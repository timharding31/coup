import { Reference } from 'firebase-admin/database'
import { Action, CardType, Game, GameStatus, Player, TurnChallengeResult, TurnPhase, TurnState } from '~/types'
import { ActionService } from './action.server'
import { ChallengeService } from './challenge.server'
import { VALID_TRANSITIONS, haveAllPlayersResponded } from '~/utils/action'
import { DeckService } from './deck.server'

export interface ITurnService {
  startTurn(gameId: string, action: Action): Promise<void>
  handleActionResponse(gameId: string, playerId: string, response: 'accept' | 'block' | 'challenge'): Promise<void>
  handleBlockResponse(gameId: string, playerId: string, response: 'accept' | 'challenge'): Promise<void>
  selectChallengeDefenseCard(gameId: string, playerId: string, cardId: string): Promise<void>
  selectFailedChallengerCard(gameId: string, playerId: string, cardId: string): Promise<void>
  endTurn(gameId: string): Promise<void>
}

export class TurnService implements ITurnService {
  private readonly CHALLENGE_TIMEOUT = 20_000 // 20 seconds
  private readonly RESPONSE_TIMEOUT = 10_000 // 10 seconds

  private gamesRef: Reference
  private actionService: ActionService
  private challengeService: ChallengeService
  private activeTimers = new Map<string, NodeJS.Timeout>()
  private onGameCompleted: (gameId: string, winnerId?: string) => Promise<void>

  constructor(
    gamesRef: Reference,
    actionService: ActionService,
    challengeService: ChallengeService,
    onGameCompleted: (gameId: string, winnerId?: string) => Promise<void>
  ) {
    this.gamesRef = gamesRef
    this.actionService = actionService
    this.challengeService = challengeService
    this.onGameCompleted = onGameCompleted
  }

  async selectChallengeDefenseCard(gameId: string, playerId: string, cardId: string) {
    const gameRef = this.gamesRef.child(gameId)
    const game = (await gameRef.get()).val() as Game
    const turn = game.currentTurn

    if (!game || !turn) {
      throw new Error('Game not found')
    }

    if (!turn.challengeResult) {
      throw new Error('Not in challenge resolution phase')
    }

    const revealedCard = game.players.find(p => p.id === playerId)?.influence.find(c => c.id === cardId)

    if (!revealedCard || revealedCard.isRevealed) {
      throw new Error('Card not found')
    }

    let defenseSuccessful: boolean

    switch (turn.phase) {
      case 'CHALLENGE_RESOLUTION':
        // Actor must be defending an opponent's challenge
        if (turn.action.playerId !== playerId) {
          throw new Error('Player was not challenged')
        }
        // Card must assert the action
        switch (turn.action.type) {
          case 'ASSASSINATE':
            defenseSuccessful = revealedCard.type === 'ASSASSIN'
            break

          case 'STEAL':
            defenseSuccessful = revealedCard.type === 'CAPTAIN'
            break

          case 'EXCHANGE':
            defenseSuccessful = revealedCard.type === 'AMBASSADOR'
            break

          case 'TAX':
            defenseSuccessful = revealedCard.type === 'DUKE'
            break

          default:
            throw new Error('Invalid action type')
        }
        break

      case 'BLOCK_CHALLENGE_RESOLUTION':
        // Blocking player must be defending actor's challenge
        if (turn.blockingPlayer !== playerId) {
          throw new Error("Player's block was not challenged")
        }
        // Card must assert the action
        switch (turn.action.type) {
          case 'FOREIGN_AID':
            defenseSuccessful = revealedCard.type === 'DUKE'
            break

          case 'ASSASSINATE':
            defenseSuccessful = revealedCard.type === 'CONTESSA'
            break

          case 'STEAL':
            defenseSuccessful = revealedCard.type === 'AMBASSADOR' || revealedCard.type === 'CAPTAIN'
            break

          default:
            throw new Error('Invalid action type')
        }
        break

      default:
        throw new Error('Not in challenge resolution phase')
    }

    // Update challenge result & perform effects, then move to next phase
    // Challenger succeeds if revealed card does NOT assert action or block
    const challengeResult = {
      ...turn.challengeResult,
      successful: !defenseSuccessful,
      defendingCardId: defenseSuccessful ? revealedCard.id : null,
      lostCardId: defenseSuccessful ? null : revealedCard.id
    }

    await gameRef.child('currentTurn/challengeResult').set(challengeResult)

    // If defense was successful, reshuffle the `defendingCardId` into the court deck
    // Then wait for challenger to select their card to lose
    if (defenseSuccessful) {
      await this.challengeService.returnAndReplaceCard(gameId, turn.action.playerId, revealedCard)
    } else {
      // If defense was unsuccessful, reveal loser's card and progress to ACTION_RESOLUTION or ACTION_FAILURE
      await this.actionService.revealInfluence(gameId, playerId, cardId)
      await this.progressToNextPhase(gameId)
    }
  }

  async selectFailedChallengerCard(gameId: string, playerId: string, cardId: string) {
    // First, ensure the lostCardId is tracked
    const gameRef = this.gamesRef.child(gameId)
    await gameRef.transaction((game: Game | null) => {
      if (!game || !game.currentTurn?.challengeResult) return game
      return {
        ...game,
        currentTurn: {
          ...game.currentTurn,
          challengeResult: {
            ...game.currentTurn.challengeResult,
            lostCardId: cardId
          }
        }
      }
    })
    // Then reveal the lostCardId and progress to next phase
    await this.actionService.revealInfluence(gameId, playerId, cardId)
    await this.progressToNextPhase(gameId)
  }

  async selectCardToLose(gameId: string, playerId: string, cardId: string): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null) => {
      if (!game || !game.currentTurn) return game

      // Validate the card belongs to the player
      const player = game.players.find(p => p.id === playerId)
      if (!player) return game

      const card = player.influence.find(c => c.id === cardId)
      if (!card || card.isRevealed) return game

      return {
        ...game,
        currentTurn: {
          ...game.currentTurn,
          lostInfluenceCardId: cardId
        },
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to select card to lose')
    }

    await this.progressToNextPhase(gameId)
  }

  async startTurn(gameId: string, action: Action) {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null) => {
      // Validate current turn state
      if (!game || (game.currentTurn && !this.isTurnComplete(game.currentTurn))) {
        return game // Abort if there's an ongoing turn
      }

      // Validate the action
      if (!this.actionService.validateAction(game, action)) {
        return game
      }

      // Handle auto-resolve actions
      if (action.autoResolve && !action.canBeBlocked && !action.canBeChallenged) {
        return this.handleAutoResolveAction(game, action)
      }

      // Create new turn state
      const newTurn: TurnState = {
        phase: 'ACTION_DECLARED',
        action,
        timeoutAt: Date.now() + this.CHALLENGE_TIMEOUT,
        respondedPlayers: [],
        challengeResult: null,
        blockingPlayer: null,
        lostInfluenceCardId: null
      }

      return {
        ...game,
        currentTurn: newTurn,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to start game turn')
    }

    // Handle post-turn creation logic
    if (action.autoResolve) {
      await this.resolveAction(gameId, action)
    } else {
      await this.progressToNextPhase(gameId)
    }
  }

  async handleActionResponse(gameId: string, playerId: string, response: 'accept' | 'block' | 'challenge') {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null) => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      // Validate response is allowed
      if (turn.phase !== 'CHALLENGE_BLOCK_WINDOW') return game
      if (turn.action.playerId === playerId) return game
      if (turn.respondedPlayers?.includes(playerId)) return game

      const respondedPlayers = turn.respondedPlayers?.slice() || []

      const updatedTurn = {
        ...turn,
        respondedPlayers: respondedPlayers.concat(playerId)
      }

      switch (response) {
        case 'accept':
          if (haveAllPlayersResponded(game, updatedTurn)) {
            updatedTurn.phase = 'ACTION_RESOLUTION'
          }
          break

        case 'block':
          if (!turn.action.canBeBlocked) return game
          updatedTurn.phase = 'BLOCK_DECLARED'
          updatedTurn.blockingPlayer = playerId
          updatedTurn.respondedPlayers = [] // Reset for new phase
          break

        case 'challenge':
          if (!turn.action.canBeChallenged) return game
          updatedTurn.phase = 'CHALLENGE_RESOLUTION'
          updatedTurn.challengeResult = {
            challengingPlayer: playerId,
            successful: null, // Will be set when turn.action.playerId dis/proves they had the card
            defendingCardId: null,
            lostCardId: null
          }
          break
      }

      return {
        ...game,
        currentTurn: updatedTurn,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to handle action response')
    }

    await this.progressToNextPhase(gameId)
  }

  async handleBlockResponse(gameId: string, playerId: string, response: 'accept' | 'challenge') {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null) => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      // Validate response is allowed
      if (turn.phase !== 'BLOCK_CHALLENGE_WINDOW') return game
      if (playerId !== turn.action.playerId) return game // Only original player can respond
      if (turn.respondedPlayers?.includes(playerId)) return game

      const respondedPlayers = turn.respondedPlayers?.slice() || []

      const updatedTurn = {
        ...turn,
        respondedPlayers: respondedPlayers.concat(playerId)
      }

      switch (response) {
        case 'accept':
          updatedTurn.phase = 'ACTION_FAILED'
          break

        case 'challenge':
          updatedTurn.phase = 'BLOCK_CHALLENGE_RESOLUTION'
          updatedTurn.challengeResult = {
            challengingPlayer: playerId,
            successful: null, // Will be set when blockingPlayer dis/proves they had the card
            defendingCardId: null,
            lostCardId: null
          }
          break
      }

      return {
        ...game,
        currentTurn: updatedTurn,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to handle block response')
    }

    await this.progressToNextPhase(gameId)
  }

  private async transitionState(gameId: string, fromPhase: TurnPhase, toPhase: TurnPhase): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)
    const game = (await gameRef.get()).val() as Game

    if (!game?.currentTurn) throw new Error('No active turn')

    const transition = VALID_TRANSITIONS.find(
      t => t.from === fromPhase && t.to === toPhase && (!t.condition || t.condition(game.currentTurn!, game))
    )

    if (!transition) {
      throw new Error(`Invalid state transition: ${fromPhase} -> ${toPhase}`)
    }

    await gameRef.child('currentTurn/phase').set(toPhase)

    if (transition.onTransition) {
      await transition.onTransition(game.currentTurn, game)
    }
  }

  private async progressToNextPhase(gameId: string): Promise<void> {
    const game = (await this.gamesRef.child(gameId).get()).val() as Game
    if (!game?.currentTurn) return

    const currentPhase = game.currentTurn.phase

    // Handle automatic transitions based on current state
    switch (currentPhase) {
      case 'ACTION_DECLARED':
        await this.transitionState(gameId, currentPhase, 'CHALLENGE_BLOCK_WINDOW')
        break

      case 'CHALLENGE_BLOCK_WINDOW':
        if (haveAllPlayersResponded(game, game.currentTurn)) {
          await this.transitionState(gameId, currentPhase, 'ACTION_RESOLUTION')
        }
        break

      case 'BLOCK_DECLARED':
        await this.transitionState(gameId, currentPhase, 'BLOCK_CHALLENGE_WINDOW')
        break

      case 'CHALLENGE_RESOLUTION':
        if (game.currentTurn.challengeResult?.lostCardId) {
          let shouldProgress = false
          if (game.currentTurn.challengeResult.successful === true) {
            // Actor was successfully challenged, the turn fails
            await this.transitionState(gameId, currentPhase, 'ACTION_FAILED')
            shouldProgress = true
          } else if (game.currentTurn.challengeResult.successful === false) {
            // Actor was unsuccessfully challenged, resolve the action
            await this.transitionState(gameId, currentPhase, 'ACTION_RESOLUTION')
            shouldProgress = true
          }
          if (shouldProgress) {
            await this.progressToNextPhase(gameId)
          }
        }
        break

      case 'BLOCK_CHALLENGE_RESOLUTION':
        if (game.currentTurn.challengeResult?.lostCardId) {
          let shouldProgress = false
          if (game.currentTurn.challengeResult.successful === true) {
            // Actor successfully challenged the block, the turn resolves
            await this.transitionState(gameId, currentPhase, 'ACTION_RESOLUTION')
            shouldProgress = true
          } else if (game.currentTurn.challengeResult.successful === false) {
            // Actor's block challenge failed, the turn fails
            await this.transitionState(gameId, currentPhase, 'ACTION_FAILED')
            shouldProgress = true
          }
          if (shouldProgress) {
            await this.progressToNextPhase(gameId)
          }
        }
        break

      case 'ACTION_RESOLUTION':
        if (['ASSASSINATE', 'COUP'].includes(game.currentTurn.action.type)) {
          await this.transitionState(gameId, currentPhase, 'LOSE_INFLUENCE')
        } else {
          await this.resolveAction(gameId, game.currentTurn.action)
        }
        break

      case 'ACTION_FAILED':
        if (game.currentTurn.action.type === 'ASSASSINATE') {
          // Actor still needs to pay for failed assassination attempt
          await this.actionService.updatePlayerCoins(gameId, game.currentTurn.action.playerId, -3)
        }
        await this.endTurn(gameId)
        break

      case 'LOSE_INFLUENCE':
        if (game.currentTurn.lostInfluenceCardId) {
          await this.resolveAction(gameId, game.currentTurn.action)
        }
        break
    }
  }

  async endTurn(gameId: string): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null) => {
      if (!game) return null

      const nextPlayerIndex = this.getNextPlayerIndex(game)

      return {
        ...game,
        currentPlayerIndex: nextPlayerIndex,
        currentTurn: null,
        updatedAt: Date.now()
      }
    })

    const game = result.committed && (result.snapshot.val() as Game)
    if (game) {
      // Check game completion
      await this.checkGameStatus(game)
    }
  }

  private getNextPlayerIndex(game: Game): number {
    let nextIndex = (game.currentPlayerIndex + 1) % game.players.length
    let attempts = 0

    // Find the next player who is still alive
    while (attempts < game.players.length) {
      if (!this.isPlayerEliminated(game.players[nextIndex])) {
        return nextIndex
      }
      nextIndex = (nextIndex + 1) % game.players.length
      attempts++
    }

    return nextIndex
  }

  private isPlayerEliminated(player: Player): boolean {
    return player.influence.every(card => card.isRevealed)
  }

  private handleAutoResolveAction(game: Game, action: Action): Game {
    return {
      ...game,
      currentTurn: {
        phase: 'ACTION_RESOLUTION',
        action,
        timeoutAt: Date.now(),
        respondedPlayers: [],
        challengeResult: null,
        blockingPlayer: null,
        lostInfluenceCardId: null
      },
      updatedAt: Date.now()
    }
  }

  private async resolveAction(gameId: string, action: Action): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)
    const game = (await gameRef.get()).val() as Game | null
    const turn = game?.currentTurn

    if (!turn) {
      throw new Error('No active turn')
    }

    // Apply coin effects
    await this.actionService.resolveCoinUpdates(gameId, action)

    // Apply influence effects if targeted action succeeded
    if (turn.action.targetPlayerId && turn.lostInfluenceCardId) {
      await this.actionService.revealInfluence(gameId, turn.action.targetPlayerId, turn.lostInfluenceCardId)
    }
    // Then end the turn
    await this.endTurn(gameId)
  }

  private async checkGameStatus(game: Game): Promise<GameStatus> {
    const activePlayers = game.players.filter(p => !this.isPlayerEliminated(p))
    if (activePlayers.length <= 1) {
      this.clearTurnTimer(game.id)
      await this.onGameCompleted(game.id, activePlayers[0]?.id)
      return GameStatus.COMPLETED
    }
    return GameStatus.IN_PROGRESS
  }

  private isTurnComplete(turn: TurnState): boolean {
    return turn.phase === 'ACTION_RESOLUTION' || turn.phase === 'ACTION_FAILED'
  }

  private async setTurnTimer(gameId: string, timeoutMs: number): Promise<void> {
    // Clear any existing timer
    this.clearTurnTimer(gameId)

    const gameRef = this.gamesRef.child(gameId)
    const timerExpiry = Date.now() + timeoutMs

    // Set the timer in the database first
    await gameRef.child('currentTurn/timeoutAt').set(timerExpiry)

    // Set the actual timer
    const timer = setTimeout(async () => {
      const result = await gameRef.transaction((game: Game | null) => {
        if (!game || !game.currentTurn) return game

        // Verify the timer hasn't been modified
        if (game.currentTurn.timeoutAt !== timerExpiry) return game

        // Auto-accept for all players who haven't responded
        const responses = game.currentTurn.respondedPlayers || []
        const remaining = game.players.filter(
          p => !responses.includes(p.id) && p.id !== game.currentTurn?.action.playerId
        )

        // Mark all remaining players as accepted
        return {
          ...game,
          currentTurn: {
            ...game.currentTurn,
            respondedPlayers: [...responses, ...remaining.map(p => p.id)]
          },
          updatedAt: Date.now()
        }
      })

      if (result.committed) {
        await this.progressToNextPhase(gameId)
      }

      this.activeTimers.delete(gameId)
    }, timeoutMs)

    this.activeTimers.set(gameId, timer)
  }

  private clearTurnTimer(gameId: string): void {
    const existingTimer = this.activeTimers.get(gameId)
    if (existingTimer) {
      clearTimeout(existingTimer)
      this.activeTimers.delete(gameId)
    }
  }
}
