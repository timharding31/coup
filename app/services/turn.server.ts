import { Reference } from 'firebase-admin/database'
import { Action, Card, Game, GameStatus, Player, TurnChallengeResult, TurnPhase, TurnState } from '~/types'
import { ActionService } from './action.server'
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
  handleChallengeDefenseCard(gameId: string, defenderId: string, cardId: string): Promise<void>
  handleFailedChallengerCard(gameId: string, challengerId: string, cardId: string): Promise<void>
  handleExchangeReturn(gameId: string, playerId: string, cardIds: string[]): Promise<void>
}

export class TurnService implements ITurnService {
  private readonly RESPONSE_TIMEOUT = 20_000 // 20 seconds

  private gamesRef: Reference
  private actionService: ActionService
  private deckService: DeckService
  private activeTimers = new Map<string, NodeJS.Timeout>()
  private onGameEnded: (gameId: string, winnerId?: string) => Promise<void>

  constructor(
    gamesRef: Reference,
    actionService: ActionService,
    deckService: DeckService,
    onGameEnded: (gameId: string, winnerId?: string) => Promise<void>
  ) {
    this.gamesRef = gamesRef
    this.actionService = actionService
    this.deckService = deckService
    this.onGameEnded = onGameEnded
  }

  async handleChallengeDefenseCard(gameId: string, defenderId: string, cardId: string) {
    const gameRef = this.gamesRef.child(gameId)
    const gameSnapshot = await gameRef.get()
    const game = gameSnapshot.val() as Game
    const turn = game?.currentTurn

    let defenseSuccessful: boolean | null = null,
      revealedCard: Card | null = null

    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game || !game.currentTurn) {
        console.error('Game not found')
        return game
      }

      const turn = game.currentTurn

      // Only allow this method when waiting for a defense reveal.
      if (turn.phase !== 'AWAITING_ACTOR_DEFENSE' && turn.phase !== 'AWAITING_BLOCKER_DEFENSE') {
        console.error('Not in defense reveal phase')
        return game
      }

      // Ensure the proper defender is responding.
      if (turn.phase === 'AWAITING_BLOCKER_DEFENSE' && turn.opponentResponses?.block !== defenderId) {
        console.error("Player's block was not challenged or not the defender")
        return game
      }
      if (turn.phase === 'AWAITING_ACTOR_DEFENSE' && turn.action.playerId !== defenderId) {
        console.error('Player was not challenged')
        return game
      }

      const player = game.players.find(p => p.id === defenderId)
      if (!player) {
        console.error('Defender not found')
        return game
      }

      revealedCard = player.influence.find(c => c.id === cardId) || null
      if (!revealedCard || revealedCard.isRevealed) {
        console.error('Card not found or already revealed')
        return game
      }

      if (!turn.challengeResult) {
        console.error('Challenger not recorded')
        return game
      }

      let nextPhase: TurnPhase

      // Determine what card type constitutes a successful defense.
      if (turn.phase === 'AWAITING_BLOCKER_DEFENSE') {
        // When defending a block challenge, compare against the card types allowed to block.
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
            throw new Error('Invalid action type for block defense')
        }
        nextPhase = defenseSuccessful ? 'AWAITING_CHALLENGE_PENALTY_SELECTION' : 'ACTION_EXECUTION'
      } else {
        // AWAITING_ACTOR_DEFENSE: the actor defends against a direct challenge.
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
            throw new Error('Invalid action type for actor defense')
        }
        nextPhase = defenseSuccessful ? 'AWAITING_CHALLENGE_PENALTY_SELECTION' : 'ACTION_FAILED'
      }

      const updatedPlayers = defenseSuccessful
        ? game.players.slice()
        : this.actionService.withRevealedInfluence(game, defenderId, cardId).players

      return {
        ...game,
        currentTurn: {
          ...game.currentTurn,
          phase: nextPhase,
          challengeResult: {
            ...turn.challengeResult,
            defenseSuccessful: defenseSuccessful,
            defendingCardId: defenseSuccessful ? revealedCard.id : null,
            lostCardId: defenseSuccessful ? null : revealedCard.id
          }
        },
        players: updatedPlayers,
        updatedAt: Date.now()
      }
    })

    if (result.committed) {
      if (defenseSuccessful && revealedCard) {
        // Replace the revealed card.
        await this.returnAndReplaceCard(gameId, defenderId, revealedCard)
      }
      await this.progressToNextPhase(gameId)
    }
  }

  async handleFailedChallengerCard(gameId: string, challengerId: string, cardId: string) {
    const gameRef = this.gamesRef.child(gameId)

    // Update the challengeResult to record the card chosen as the penalty.
    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game || !game.currentTurn?.challengeResult) {
        return game
      }
      const turn = game.currentTurn
      const nextPhase: TurnPhase = challengerId === turn.action.playerId ? 'ACTION_FAILED' : 'ACTION_EXECUTION'
      const updatedPlayers = this.actionService.withRevealedInfluence(game, challengerId, cardId).players
      return {
        ...game,
        currentTurn: {
          ...game.currentTurn,
          phase: nextPhase,
          challengeResult: {
            ...game.currentTurn.challengeResult,
            lostCardId: cardId
          }
        },
        players: updatedPlayers,
        updatedAt: Date.now()
      }
    })

    if (result.committed) {
      await this.progressToNextPhase(gameId)
    }
  }

  private async dealExchangeCards(gameId: string, playerId: string) {
    await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game || game.currentTurn?.action.type !== 'EXCHANGE') {
        return game
      }

      const [dealt, remainingDeck] = this.deckService.dealCards(game.deck, 2)

      return {
        ...game,
        currentTurn: {
          ...game.currentTurn,
          timeoutAt: Date.now(),
          respondedPlayers: [],
          phase: 'AWAITING_EXCHANGE_RETURN'
        },
        deck: remainingDeck,
        players: game.players.map(p => {
          if (p.id !== playerId) return p
          return { ...p, influence: p.influence.concat(dealt) }
        }),
        updatedAt: Date.now()
      }
    })
  }

  async handleExchangeReturn(gameId: string, playerId: string, cardIds: string[]): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)
    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game || !game.currentTurn || game.currentTurn.action.type !== 'EXCHANGE') return game

      const player = game.players.find(p => p.id === playerId)
      const exchangedCards = player?.influence.filter(c => cardIds.includes(c.id)) || []

      if (exchangedCards.length !== 2) return game

      // Update player's cards and return selected cards to deck
      const updatedPlayers = game.players.map(p => {
        if (p.id !== playerId) return p
        return {
          ...p,
          influence: p.influence.filter(c => !cardIds.includes(c.id))
        }
      })

      return {
        ...game,
        players: updatedPlayers,
        deck: game.deck.concat(exchangedCards.map(c => ({ ...c, isRevealed: false }))),
        currentTurn: {
          ...game.currentTurn,
          phase: 'TURN_COMPLETE',
          exchange: { returnCards: cardIds }
        },
        updatedAt: Date.now()
      }
    })

    if (result.committed) {
      await this.progressToNextPhase(gameId)
    }
  }

  async selectCardToLose(gameId: string, playerId: string, cardId: string): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game || !game.currentTurn) return game

      const turn = game.currentTurn
      const player = game.players.find(p => p.id === playerId)
      if (!player || turn.action.targetPlayerId !== playerId) return game

      const card = player.influence.find(c => c.id === cardId)
      if (!card || card.isRevealed) return game

      return {
        ...game,
        currentTurn: {
          ...turn,
          phase: 'TURN_COMPLETE',
          targetSelection: {
            lostCardId: cardId
          }
        },
        players: game.players.map(p => {
          if (p.id !== playerId) return p
          return {
            ...p,
            influence: p.influence.map(c => {
              if (c.id !== cardId) return c
              return {
                ...c,
                isRevealed: true
              }
            })
          }
        }),
        updatedAt: Date.now()
      }
    })

    if (result.committed) {
      await this.progressToNextPhase(gameId)
    }
  }

  async startTurn(gameId: string, action: Action) {
    const gameRef = this.gamesRef.child(gameId)

    let timeoutAt: number | null = null

    const result = await gameRef.transaction((game: Game | null): Game | null => {
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
          opponentResponses: null,
          challengeResult: null,
          targetSelection: null,
          exchange: null
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
        opponentResponses: null,
        challengeResult: null,
        targetSelection: null,
        exchange: null
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

    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      if (turn.phase !== 'AWAITING_OPPONENT_RESPONSES') return game
      if (turn.action.playerId === playerId) return game
      if (turn.respondedPlayers?.includes(playerId)) return game

      const updatedTurn = { ...turn, respondedPlayers: (turn.respondedPlayers || []).concat(playerId) }

      // Record opponent response.
      if (response === 'block') {
        updatedTurn.opponentResponses = { block: playerId }
      } else if (response === 'challenge') {
        updatedTurn.opponentResponses = { challenge: playerId }
        updatedTurn.challengeResult = {
          challengerId: playerId,
          defenseSuccessful: null,
          defendingCardId: null,
          lostCardId: null
        }
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

    // Progress phase based on responses.
    // If a block is recorded, transition to AWAITING_ACTIVE_RESPONSE_TO_BLOCK.
    // If a challenge is recorded, transition to AWAITING_ACTOR_DEFENSE.
    await this.progressToNextPhase(gameId)

    return { game: result.snapshot.val() as Game | null }
  }

  async handleBlockResponse(gameId: string, playerId: string, response: 'accept' | 'challenge') {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      // Only allow active player's response when waiting for their decision.
      if (turn.phase !== 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK') return game
      if (playerId !== turn.action.playerId) return game
      if (turn.respondedPlayers?.includes(playerId)) return game

      const updatedTurn = {
        ...turn,
        respondedPlayers: (turn.respondedPlayers || []).concat(playerId)
      }

      if (response === 'accept') {
        // Accepting the block: action fails.
        updatedTurn.phase = 'ACTION_FAILED'
      } else if (response === 'challenge') {
        // Challenging the block sets the phase so that the blocker must now defend.
        updatedTurn.phase = 'AWAITING_BLOCKER_DEFENSE'
        updatedTurn.challengeResult = {
          challengerId: playerId,
          defenseSuccessful: null,
          defendingCardId: null,
          lostCardId: null
        }
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

    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      // Only handle timeouts for reaction phases
      if (turn.phase !== 'AWAITING_OPPONENT_RESPONSES' && turn.phase !== 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK') {
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
      if (turn.phase === 'AWAITING_OPPONENT_RESPONSES' && haveAllPlayersResponded(game, updatedTurn)) {
        updatedTurn.phase = 'ACTION_EXECUTION'
      } else if (turn.phase === 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK') {
        updatedTurn.phase = 'ACTION_FAILED'
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
    const gameSnapshot = await this.gamesRef.child(gameId).get()
    const game = gameSnapshot.val() as Game
    if (!game?.currentTurn) {
      return
    }
    const currentPhase = game.currentTurn.phase

    switch (currentPhase) {
      case 'ACTION_DECLARED':
        if (game.currentTurn.action.canBeBlocked || game.currentTurn.action.canBeChallenged) {
          await this.transitionState(gameId, currentPhase, 'AWAITING_OPPONENT_RESPONSES')
        } else {
          await this.transitionState(gameId, currentPhase, 'ACTION_EXECUTION')
          await this.resolveAction(gameId, game.currentTurn.action)
        }
        break

      case 'AWAITING_OPPONENT_RESPONSES':
        // If a block was recorded, let the active player decide how to respond.
        if (game.currentTurn.opponentResponses?.block) {
          await this.transitionState(gameId, currentPhase, 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK')
        } else if (game.currentTurn.opponentResponses?.challenge) {
          // A direct challenge: actor must defend.
          await this.transitionState(gameId, currentPhase, 'AWAITING_ACTOR_DEFENSE')
        } else if (haveAllPlayersResponded(game, game.currentTurn)) {
          await this.transitionState(gameId, currentPhase, 'ACTION_EXECUTION')
          await this.resolveAction(gameId, game.currentTurn.action)
        }
        break

      case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
        // Waiting for the active player's decision via handleBlockResponse.
        break

      case 'AWAITING_ACTOR_DEFENSE':
      case 'AWAITING_BLOCKER_DEFENSE':
        // Waiting for the defender to select and reveal a card.
        break

      case 'AWAITING_CHALLENGE_PENALTY_SELECTION':
        // Waiting for failed challenger to select card.
        break

      case 'ACTION_EXECUTION':
        await this.resolveAction(gameId, game.currentTurn.action)
        break

      case 'AWAITING_TARGET_SELECTION':
        // Waiting for the target to select a card to lose (handled via selectCardToLose).
        break

      case 'AWAITING_EXCHANGE_RETURN':
        // Waiting for the active player to select cards to return (handled via handleExchangeReturn).
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

    const result = await gameRef.transaction((game: Game | null): Game | null => {
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

  private async resolveAction(gameId: string, action: Action): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)
    const game = (await gameRef.get()).val() as Game | null
    const turn = game?.currentTurn

    if (!turn) {
      throw new Error('No active turn')
    }

    // Apply coin effects
    await this.actionService.resolveCoinUpdates(gameId, action)

    switch (action.type) {
      case 'EXCHANGE':
        await this.dealExchangeCards(gameId, action.playerId)
        await this.transitionState(gameId, turn.phase, 'AWAITING_EXCHANGE_RETURN')
        break

      case 'COUP':
      case 'ASSASSINATE':
        await this.transitionState(gameId, turn.phase, 'AWAITING_TARGET_SELECTION')
        break

      default:
        await this.transitionState(gameId, turn.phase, 'TURN_COMPLETE')
        break
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

  async returnAndReplaceCard(gameId: string, playerId: string, card: Card): Promise<void> {
    // Return card to deck
    const newDeck = await this.deckService.returnCardsToDeck(gameId, card)

    // Then draw a new card for the player
    const [dealtCards, remainingDeck] = this.deckService.dealCards(newDeck, 1)

    // Update the game state
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game || !game.currentTurn) return game

      const updatedPlayers = game.players.map(p => {
        if (p.id !== playerId) return p
        return {
          ...p,
          influence: p.influence.concat(dealtCards)
        }
      })

      return {
        ...game,
        deck: remainingDeck,
        players: updatedPlayers,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to return and replace card')
    }
  }

  private async updateGameState(gameId: string, updateFn: (game: Game) => Partial<Game>) {
    return this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game) return game
      return {
        ...game,
        ...updateFn(game),
        updatedAt: Date.now()
      }
    })
  }
}
