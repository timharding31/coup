import { Reference } from 'firebase-admin/database'
import { Action, CardType, Game, GameStatus, Player, TurnChallengeResult, TurnPhase, TurnState } from '~/types'
import { ActionService } from './action.server'
import { ChallengeService } from './challenge.server'
import { VALID_TRANSITIONS, haveAllPlayersResponded } from '~/utils/action'
import { DeckService } from './deck.server'

export interface ITurnService {
  startTurn(gameId: string, action: Action): Promise<{ game: Game | null }>
  handleActionResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'block' | 'challenge'
  ): Promise<{ game: Game | null }>
  handleBlockResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'challenge'
  ): Promise<{ game: Game | null }>
  selectChallengeDefenseCard(gameId: string, playerId: string, cardId: string): Promise<void>
  selectFailedChallengerCard(gameId: string, playerId: string, cardId: string): Promise<void>
  setOnGameEnded(listener: (gameId: string, winnerId?: string) => Promise<void>): void
  setOnTurnEnded(listener: (gameId: string) => Promise<void>): void
}

export class TurnService implements ITurnService {
  private readonly RESPONSE_TIMEOUT = 20_000 // 20 seconds

  private gamesRef: Reference
  private actionService: ActionService
  private challengeService: ChallengeService
  private activeTimers = new Map<string, NodeJS.Timeout>()
  private onGameEnded: (gameId: string, winnerId?: string) => Promise<void> = Promise.resolve
  private onTurnEnded: (gameId: string) => Promise<void> = Promise.resolve

  constructor(gamesRef: Reference, actionService: ActionService, challengeService: ChallengeService) {
    this.gamesRef = gamesRef
    this.actionService = actionService
    this.challengeService = challengeService
  }

  setOnGameEnded(listener: (gameId: string, winnerId?: string) => Promise<void>) {
    this.onGameEnded = listener
  }

  setOnTurnEnded(listener: (gameId: string) => Promise<void>) {
    this.onTurnEnded = listener
  }

  async selectChallengeDefenseCard(gameId: string, playerId: string, cardId: string) {
    const gameRef = this.gamesRef.child(gameId)
    const game = (await gameRef.get()).val() as Game
    const turn = game.currentTurn

    if (!game || !turn) {
      throw new Error('Game not found')
    }

    if (turn.phase !== 'WAITING_FOR_DEFENSE_REVEAL') {
      throw new Error('Not in defense reveal phase')
    }

    if (!turn.challengeResult) {
      throw new Error('No active challenge')
    }

    const revealedCard = game.players.find(p => p.id === playerId)?.influence.find(c => c.id === cardId)

    if (!revealedCard || revealedCard.isRevealed) {
      throw new Error('Card not found or already revealed')
    }

    let defenseSuccessful: boolean

    // Determine if the revealed card matches the required type
    if (turn.blockingPlayer) {
      // Blocking player must be defending actor's challenge
      if (turn.blockingPlayer !== playerId) {
        throw new Error("Player's block was not challenged")
      }

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
    } else {
      // Actor must be defending an opponent's challenge
      if (turn.action.playerId !== playerId) {
        throw new Error('Player was not challenged')
      }

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
    }

    const challengeResult = {
      ...turn.challengeResult,
      successful: !defenseSuccessful,
      defendingCardId: defenseSuccessful ? revealedCard.id : null,
      lostCardId: defenseSuccessful ? null : revealedCard.id
    }

    await gameRef.child('currentTurn/challengeResult').set(challengeResult)

    if (defenseSuccessful) {
      await this.challengeService.returnAndReplaceCard(gameId, playerId, revealedCard)
    } else {
      await this.actionService.revealInfluence(gameId, playerId, cardId)
    }

    await this.progressToNextPhase(gameId)
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

    let timeoutAt: number | null = null

    const result = await gameRef.transaction((game: Game | null) => {
      if (!game || (game.currentTurn && !this.isTurnComplete(game.currentTurn))) {
        return game
      }

      if (!this.actionService.validateAction(game, action)) {
        return game
      }

      let newTurn: TurnState

      // Handle auto-resolve actions
      if (action.autoResolve && !action.canBeBlocked && !action.canBeChallenged) {
        newTurn = {
          phase: 'ACTION_DECLARED',
          action,
          timeoutAt: Date.now(),
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
      }

      // Create new turn state for non-auto-resolve actions
      timeoutAt = Date.now() + this.RESPONSE_TIMEOUT
      newTurn = {
        phase: 'ACTION_DECLARED',
        action,
        timeoutAt,
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
      throw new Error('Failed to start turn')
    }

    const game = result.snapshot.val() as Game | null

    if (timeoutAt && !action.autoResolve) {
      this.startTimer(gameId, timeoutAt - Date.now())
    }

    if (action.coinCost) {
      await this.actionService.updatePlayerCoins(gameId, action.playerId, -action.coinCost)
    }

    await this.progressToNextPhase(gameId)

    return { game }
  }

  async handleActionResponse(gameId: string, playerId: string, response: 'accept' | 'block' | 'challenge') {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null) => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      // Validate response is allowed
      if (turn.phase !== 'WAITING_FOR_REACTIONS') return game
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
            updatedTurn.phase = 'ACTION_RESOLVING'
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
          updatedTurn.phase = 'WAITING_FOR_DEFENSE_REVEAL'
          updatedTurn.challengeResult = {
            challengingPlayer: playerId,
            successful: null,
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

    return { game: result.snapshot.val() as Game | null }
  }

  async handleBlockResponse(gameId: string, playerId: string, response: 'accept' | 'challenge') {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null) => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      // Validate response is allowed
      if (turn.phase !== 'WAITING_FOR_BLOCK_RESPONSE') return game
      if (playerId !== turn.action.playerId) return game
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
          updatedTurn.phase = 'WAITING_FOR_DEFENSE_REVEAL'
          updatedTurn.challengeResult = {
            challengingPlayer: playerId,
            successful: null,
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

    return { game: result.snapshot.val() as Game | null }
  }

  // Processes all auto-acceptances, to be run on timeout expiration after action/block declared
  private async handleTimeout(gameId: string) {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null) => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      // Only handle timeouts for reaction phases
      if (turn.phase !== 'WAITING_FOR_REACTIONS' && turn.phase !== 'WAITING_FOR_BLOCK_RESPONSE') {
        return game
      }

      // Check if timeout has actually expired
      if (Date.now() < turn.timeoutAt) {
        return game
      }

      const updatedTurn = { ...turn }

      // Get list of players who haven't responded yet
      const respondedPlayers = turn.respondedPlayers?.slice() || []
      const nonRespondedPlayers = game.players
        .map(p => p.id)
        .filter(playerId => {
          // Exclude the action player
          if (playerId === turn.action.playerId) return false
          // Exclude players who have already responded
          if (respondedPlayers.includes(playerId)) return false
          // Exclude eliminated players
          const player = game.players.find(p => p.id === playerId)
          if (player && player.influence.every(card => card.isRevealed)) return false
          return true
        })

      // Add all non-responded players as implicit accepts
      updatedTurn.respondedPlayers = respondedPlayers.concat(nonRespondedPlayers)

      // Progress the phase if everyone has now responded
      if (turn.phase === 'WAITING_FOR_REACTIONS') {
        if (haveAllPlayersResponded(game, updatedTurn)) {
          updatedTurn.phase = 'ACTION_RESOLVING'
        }
      } else if (turn.phase === 'WAITING_FOR_BLOCK_RESPONSE') {
        if (haveAllPlayersResponded(game, updatedTurn)) {
          updatedTurn.phase = 'ACTION_FAILED'
        }
      }

      return {
        ...game,
        currentTurn: updatedTurn,
        updatedAt: Date.now()
      }
    })

    if (result.committed && result.snapshot.val()) {
      await this.progressToNextPhase(gameId)
    }
  }

  private startTimer(gameId: string, timeoutMs: number) {
    timeoutMs = Math.max(0, timeoutMs)
    // Clear any existing timer
    this.clearTimer(gameId)

    const timer = setTimeout(() => {
      this.handleTimeout(gameId).then(() => this.activeTimers.delete(gameId))
    }, timeoutMs)

    this.activeTimers.set(gameId, timer)
  }

  private clearTimer(gameId: string) {
    const existingTimer = this.activeTimers.get(gameId)
    if (existingTimer) {
      clearTimeout(existingTimer)
      this.activeTimers.delete(gameId)
    }
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

    if (this.isWaitingPhase(fromPhase)) {
      this.clearTimer(gameId)
    }

    if (toPhase === 'TURN_COMPLETE') {
      await this.progressToNextPhase(gameId)
    }
  }

  private isWaitingPhase(phase: TurnPhase): boolean {
    return ['WAITING_FOR_REACTIONS', 'WAITING_FOR_BLOCK_RESPONSE'].includes(phase)
  }

  private async progressToNextPhase(gameId: string): Promise<void> {
    const game = (await this.gamesRef.child(gameId).get()).val() as Game
    if (!game?.currentTurn) return

    const currentPhase = game.currentTurn.phase

    if (this.isWaitingPhase(currentPhase)) {
      const remainingTime = game.currentTurn.timeoutAt - Date.now()
      this.startTimer(gameId, remainingTime)
    }

    switch (currentPhase) {
      case 'ACTION_DECLARED':
        if (game.currentTurn.action.autoResolve) {
          await this.transitionState(gameId, currentPhase, 'ACTION_RESOLVING')
          await this.resolveAction(gameId, game.currentTurn.action)
          await this.transitionState(gameId, 'ACTION_RESOLVING', 'TURN_COMPLETE')
        } else if (game.currentTurn.action.canBeBlocked || game.currentTurn.action.canBeChallenged) {
          await this.transitionState(gameId, currentPhase, 'WAITING_FOR_REACTIONS')
        } else {
          await this.transitionState(gameId, currentPhase, 'ACTION_RESOLVING')
          await this.progressToNextPhase(gameId)
          return
        }
        break

      case 'WAITING_FOR_REACTIONS':
        if (game.currentTurn.blockingPlayer) {
          await this.transitionState(gameId, currentPhase, 'BLOCK_DECLARED')
        } else if (game.currentTurn.challengeResult) {
          await this.transitionState(gameId, currentPhase, 'WAITING_FOR_DEFENSE_REVEAL')
        } else if (haveAllPlayersResponded(game, game.currentTurn)) {
          await this.transitionState(gameId, currentPhase, 'ACTION_RESOLVING')
          await this.resolveAction(gameId, game.currentTurn.action)
          await this.transitionState(gameId, 'ACTION_RESOLVING', 'TURN_COMPLETE')
        }
        break

      case 'BLOCK_DECLARED':
        await this.transitionState(gameId, currentPhase, 'WAITING_FOR_BLOCK_RESPONSE')
        break

      case 'WAITING_FOR_BLOCK_RESPONSE':
        if (game.currentTurn.challengeResult) {
          await this.transitionState(gameId, currentPhase, 'WAITING_FOR_DEFENSE_REVEAL')
        } else if (haveAllPlayersResponded(game, game.currentTurn)) {
          await this.transitionState(gameId, currentPhase, 'ACTION_FAILED')
          await this.transitionState(gameId, 'ACTION_FAILED', 'TURN_COMPLETE')
        }
        break

      case 'WAITING_FOR_DEFENSE_REVEAL':
        if (!game.currentTurn.challengeResult) break

        if (game.currentTurn.challengeResult.defendingCardId) {
          await this.transitionState(gameId, currentPhase, 'WAITING_FOR_CHALLENGE_PENALTY')
        } else if (game.currentTurn.challengeResult.lostCardId) {
          await this.transitionState(gameId, currentPhase, 'ACTION_FAILED')
          await this.transitionState(gameId, 'ACTION_FAILED', 'TURN_COMPLETE')
        }
        break

      case 'WAITING_FOR_CHALLENGE_PENALTY':
        if (game.currentTurn.challengeResult?.lostCardId) {
          await this.transitionState(gameId, currentPhase, 'ACTION_RESOLVING')
          await this.resolveAction(gameId, game.currentTurn.action)
          await this.transitionState(gameId, 'ACTION_RESOLVING', 'TURN_COMPLETE')
        }
        break

      case 'ACTION_RESOLVING':
        if (['ASSASSINATE', 'COUP'].includes(game.currentTurn.action.type)) {
          await this.transitionState(gameId, currentPhase, 'WAITING_FOR_TARGET_REVEAL')
        } else {
          await this.resolveAction(gameId, game.currentTurn.action)
          await this.transitionState(gameId, currentPhase, 'TURN_COMPLETE')
        }
        break

      case 'WAITING_FOR_TARGET_REVEAL':
        if (game.currentTurn.lostInfluenceCardId) {
          await this.resolveAction(gameId, game.currentTurn.action)
          await this.transitionState(gameId, currentPhase, 'TURN_COMPLETE')
        }
        break

      case 'ACTION_FAILED':
        await this.transitionState(gameId, currentPhase, 'TURN_COMPLETE')
        break

      case 'TURN_COMPLETE':
        await this.endTurn(gameId)
        break
    }
  }

  private async endTurn(gameId: string): Promise<void> {
    this.clearTimer(gameId)

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
      // Execute onTurnEnded callback
      await this.onTurnEnded(gameId)
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
  }

  private async checkGameStatus(game: Game): Promise<GameStatus> {
    const activePlayers = game.players.filter(p => !this.isPlayerEliminated(p))
    if (activePlayers.length <= 1) {
      this.clearTimer(game.id)
      await this.onGameEnded(game.id, activePlayers[0]?.id)
      return GameStatus.COMPLETED
    }
    return GameStatus.IN_PROGRESS
  }

  private isTurnComplete(turn: TurnState): boolean {
    return turn.phase === 'TURN_COMPLETE'
  }
}
