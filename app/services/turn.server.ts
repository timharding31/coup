import { Reference } from 'firebase-admin/database'
import { Action, Card, CardType, Game, GameStatus, Player, TurnPhase, TurnState } from '~/types'
import { ActionService } from './action.server'
import { VALID_TRANSITIONS, haveAllPlayersResponded } from '~/utils/action'
import { DeckService } from './deck.server'

export interface ITurnService {
  startTurn(gameId: string, action: Action): Promise<void>
  handleActionResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'block' | 'challenge',
    claimedCardForBlock?: CardType
  ): Promise<void>
  handleBlockResponse(gameId: string, playerId: string, response: 'accept' | 'challenge'): Promise<void>
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

    let revealedCard: Card | null = null,
      defenseSuccessful: boolean | null = null

    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game || !game.currentTurn) {
        console.error('Game not found')
        return game
      }

      const turn = { ...game.currentTurn }

      if (!turn.challengeResult) {
        console.error('Challenger not recorded')
        return game
      }

      switch (turn.phase) {
        case 'AWAITING_ACTOR_DEFENSE':
          if (turn.action.playerId !== defenderId) {
            console.error('Player was not challenged')
            return game
          }
          break

        case 'AWAITING_BLOCKER_DEFENSE':
          if (turn.opponentResponses?.block !== defenderId) {
            console.error("Player's block was not challenged or not the defender")
            return game
          }
          break

        // Only allow this method when waiting for a defense reveal.
        default:
          console.error('Not in defense reveal phase')
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

      defenseSuccessful = revealedCard.type === turn.challengeResult.challengedCaracter
      const nextPhase = defenseSuccessful
        ? 'AWAITING_CHALLENGE_PENALTY_SELECTION'
        : turn.phase === 'AWAITING_BLOCKER_DEFENSE'
          ? 'ACTION_EXECUTION'
          : 'ACTION_FAILED'

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
        let card: Card | undefined
        try {
          // Replace the revealed card.
          card = await this.revealChallengeDefenseCardTemporarily(gameId, defenderId, revealedCard)
          // Sleep for 5s before replacing the card with a new one from the deck
          await new Promise(res => setTimeout(res, 3_000))
        } catch (e) {
          console.error(e)
        }
        await this.returnAndReplaceCard(gameId, defenderId, card || revealedCard)
      }
      await this.progressToNextPhase(gameId)
    }
  }

  private async revealChallengeDefenseCardTemporarily(
    gameId: string,
    defenderId: string,
    revealedCard: Card
  ): Promise<Card> {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game || !game.currentTurn) return game

      return {
        ...game,
        players: game.players.map(p => {
          if (p.id !== defenderId) return p
          const cardIndex = p.influence.findIndex(c => c.id === revealedCard.id)
          if (cardIndex === -1) return p
          const newInfluence = p.influence.slice()
          newInfluence[cardIndex].isChallengeDefenseCard = true
          return { ...p, influence: newInfluence }
        }),
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to reveal challenge defense card')
    }

    return { ...revealedCard, isChallengeDefenseCard: true }
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
          timeoutAt: 0, // No timeout for exchange return phase
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
      if (!game || game.currentTurn?.action.type !== 'EXCHANGE') {
        return game
      }

      // Validate the exchange
      const player = game.players.find(p => p.id === playerId)
      if (!player) return game

      const exchangedCards = player.influence.filter(c => cardIds.includes(c.id)) || []
      if (exchangedCards.length !== 2) return game

      // Update player's cards and return selected cards to deck
      const updatedPlayers = game.players.map(p => {
        if (p.id !== playerId) return p
        return {
          ...p,
          influence: p.influence.filter(c => !cardIds.includes(c.id))
        }
      })

      // Important: We're ONLY updating the game state here, not ending the turn
      // This ensures the progressToNextPhase can properly handle the state transition
      return {
        ...game,
        players: updatedPlayers,
        deck: game.deck.concat(
          exchangedCards.map(c => ({
            ...c,
            isRevealed: false,
            isChallengeDefenseCard: false
          }))
        ),
        currentTurn: {
          ...game.currentTurn,
          phase: 'TURN_COMPLETE',
          exchange: { returnCards: cardIds }
        },
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to process exchange return')
    }

    // Now the turn is marked as TURN_COMPLETE, explicitly call endTurn to ensure
    // it moves to the next player. This is a more direct approach than progressToNextPhase
    // to ensure the turn is properly ended.
    await this.endTurn(gameId)
  }

  async selectCardToLose(gameId: string, playerId: string, cardId: string): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game || !game.currentTurn) return game

      const turn = game.currentTurn

      // Ensure we're in the right phase
      if (turn.phase !== 'AWAITING_TARGET_SELECTION') return game

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

    if (!result.committed) {
      throw new Error('Failed to select card to lose')
    }

    // Directly end the turn for more reliability
    await this.endTurn(gameId)
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
      if (!action.canBeBlocked && !action.canBeChallenged) {
        newTurn = {
          phase: 'ACTION_DECLARED',
          action,
          timeoutAt: 0, // No timeout for auto-resolve actions
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

    // Start the timer for opponent responses if this action can be blocked or challenged
    if (timeoutAt && timeoutAt > Date.now() && (action.canBeBlocked || action.canBeChallenged)) {
      this.startTimer(gameId, timeoutAt - Date.now())
    }

    if (action.coinCost) {
      await this.actionService.updatePlayerCoins(gameId, { [action.playerId]: -action.coinCost })
    }

    await this.progressToNextPhase(gameId)
  }

  async handleActionResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'block' | 'challenge',
    claimedCardForBlock: CardType | null = null
  ) {
    const gameRef = this.gamesRef.child(gameId)

    let timeoutAt: number | null = null

    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      if (turn.phase !== 'AWAITING_OPPONENT_RESPONSES') return game
      if (turn.action.playerId === playerId) return game
      if (turn.respondedPlayers?.includes(playerId)) return game

      const updatedTurn: TurnState = {
        ...turn,
        respondedPlayers: (turn.respondedPlayers || []).concat(playerId)
      }

      // Record opponent response.
      if (response === 'block') {
        if (!claimedCardForBlock) {
          console.error('Block response without claimed card')
          return game
        }
        // When a block is recorded, clear the current timeout and set a new one for actor to respond to block
        updatedTurn.opponentResponses = { block: playerId, claimedCard: claimedCardForBlock }

        // New timeout for actor to respond to block
        timeoutAt = Date.now() + this.RESPONSE_TIMEOUT
        updatedTurn.timeoutAt = timeoutAt
      } else if (response === 'challenge') {
        if (!turn.action.requiredCharacter) {
          console.error('Challenge response without required character')
          return game
        }
        // When a challenge is recorded, no timeout is needed because the actor must defend immediately
        updatedTurn.opponentResponses = { challenge: playerId }
        updatedTurn.timeoutAt = 0 // No timeout for challenge response
        updatedTurn.challengeResult = {
          challengerId: playerId,
          defenseSuccessful: null,
          defendingCardId: null,
          lostCardId: null,
          challengedCaracter: turn.action.requiredCharacter
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

    // Start timer for actor response to block
    if (timeoutAt && timeoutAt > Date.now()) {
      this.startTimer(gameId, timeoutAt - Date.now())
    }
    // Progress phase based on responses.
    // If a block was recorded, transition to AWAITING_ACTIVE_RESPONSE_TO_BLOCK.
    // If a challenge is recorded, transition to AWAITING_ACTOR_DEFENSE.
    await this.progressToNextPhase(gameId)
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

      // Create updated turn state - we're setting timeout to 0 for all block responses
      // because either the action is accepted (ending the turn) or challenged (no timeout needed)
      const updatedTurn: TurnState = {
        ...turn,
        respondedPlayers: (turn.respondedPlayers || []).concat(playerId),
        timeoutAt: 0 // Always clear timeout for block response as we'll be moving to a non-timeout phase
      }

      if (response === 'accept') {
        // Accepting the block: action fails.
        updatedTurn.phase = 'ACTION_FAILED'
      } else if (response === 'challenge') {
        if (!turn.opponentResponses?.claimedCard) {
          return game
        }
        // Challenging the block sets the phase so that the blocker must now defend.
        updatedTurn.phase = 'AWAITING_BLOCKER_DEFENSE'
        updatedTurn.challengeResult = {
          challengerId: playerId,
          defenseSuccessful: null,
          defendingCardId: null,
          lostCardId: null,
          challengedCaracter: turn.opponentResponses.claimedCard
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

    // Only progress to next phase, don't clear timer unless all responses are received
    // or a special response changes the phase (handled in progressToNextPhase)
    await this.progressToNextPhase(gameId)
  }

  // Processes all auto-acceptances, to be run on timeout expiration after action/block declared
  private async handleTimeout(gameId: string) {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      // Don't process timeouts for phases that don't support them
      if (!this.isWaitingPhase(turn.phase)) {
        return game
      }

      // Don't process timeouts that haven't actually expired
      if (turn.timeoutAt > Date.now()) {
        return game
      }

      // Create updated turn state - only clear the timeout when completing the timeout action
      const updatedTurn = { ...turn }

      // Get list of players who haven't responded yet
      const respondedPlayers = turn.respondedPlayers?.slice() || []
      const nonRespondedPlayers = game.players
        .map(p => p.id)
        .filter(playerId => {
          // Exclude the player who started the action
          if (turn.phase === 'AWAITING_OPPONENT_RESPONSES' && playerId === turn.action.playerId) {
            return false
          }
          if (turn.phase === 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK' && playerId === turn.opponentResponses?.block) {
            return false
          }
          // Exclude players who have already responded
          if (respondedPlayers.includes(playerId)) return false
          // Exclude eliminated players
          const player = game.players.find(p => p.id === playerId)
          if (player && player.influence.every(card => card.isRevealed)) return false
          return true
        })

      // Add all non-responded players as implicit accepts
      updatedTurn.respondedPlayers = respondedPlayers.concat(nonRespondedPlayers)

      // Progress the phase based on current waiting phase
      switch (turn.phase) {
        case 'AWAITING_OPPONENT_RESPONSES':
          // If everyone has responded or timeout has been reached, progress to execution
          if (haveAllPlayersResponded(game, updatedTurn)) {
            updatedTurn.phase = 'ACTION_EXECUTION'
            updatedTurn.timeoutAt = 0 // Clear timeoutAt when changing phase to action execution
          }
          break

        case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
          // On timeout, active player is considered to have accepted the block
          updatedTurn.phase = 'ACTION_FAILED'
          updatedTurn.timeoutAt = 0 // Clear timeoutAt when changing phase to action failed
          break

        // No other phases should have timeouts, but if they do, don't change state
        default:
          return game
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

    // Add a buffer to ensure the server has time to process the timeout
    // This helps with race conditions where timeouts might be processed too early
    const bufferMs = 500
    const actualTimeoutMs = timeoutMs + bufferMs

    const timer = setTimeout(async () => {
      try {
        // Double-check the game state before handling timeout to prevent race conditions
        const gameRef = this.gamesRef.child(gameId)
        const gameSnapshot = await gameRef.get()
        const game = gameSnapshot.val() as Game | null

        // Only process timeout if it's still needed
        if (game?.currentTurn?.timeoutAt && game.currentTurn.timeoutAt <= Date.now()) {
          await this.handleTimeout(gameId)
        }
      } catch (error) {
        console.error(`Error handling timeout for game ${gameId}:`, error)
      } finally {
        this.activeTimers.delete(gameId)
      }
    }, actualTimeoutMs)

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

    if (toPhase === 'TURN_COMPLETE') {
      await this.progressToNextPhase(gameId)
    }
  }

  private isWaitingPhase(phase: TurnPhase): boolean {
    // Only these two phases should have timeouts that auto-progress the game
    return ['AWAITING_OPPONENT_RESPONSES', 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK'].includes(phase)
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
          // Don't clear the timer - a new timeout was already set in handleActionResponse
          await this.transitionState(gameId, currentPhase, 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK')
        } else if (game.currentTurn.opponentResponses?.challenge) {
          // A direct challenge: actor must defend.
          // Clear timer as no timeout is needed for defense
          this.clearTimer(gameId)
          await this.transitionState(gameId, currentPhase, 'AWAITING_ACTOR_DEFENSE')
        } else if (haveAllPlayersResponded(game, game.currentTurn)) {
          // All players have responded (possibly due to timeout), clear timer
          this.clearTimer(gameId)
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
        await this.endTurn(gameId)
        break

      case 'TURN_COMPLETE':
        await this.endTurn(gameId)
        break

      default:
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
    await this.actionService.resolveCoinUpdates(game, action)

    switch (action.type) {
      case 'EXCHANGE':
        await this.dealExchangeCards(gameId, action.playerId)
        await this.transitionState(gameId, turn.phase, 'AWAITING_EXCHANGE_RETURN')
        break

      case 'COUP':
      case 'ASSASSINATE':
        // The target might have already died by now, turn must end before target selection
        const target = game.players.find(p => p.id === action.targetPlayerId)
        if (target && this.isPlayerEliminated(target)) {
          await this.endTurn(gameId)
        } else {
          await this.transitionState(gameId, turn.phase, 'AWAITING_TARGET_SELECTION')
        }
        break

      default:
        await this.endTurn(gameId)
        break
    }
  }

  private async checkGameStatus(game: Game): Promise<GameStatus> {
    const activePlayers = game.players.filter(p => !this.isPlayerEliminated(p))

    // Find newly eliminated players
    const currentlyEliminated = game.players.filter(p => this.isPlayerEliminated(p)).map(p => p.id)

    const eliminationOrder = game.eliminationOrder || []

    const newlyEliminated = currentlyEliminated.filter(id => !eliminationOrder.includes(id))

    if (newlyEliminated.length > 0) {
      await this.gamesRef.child(`${game.id}/eliminationOrder`).set(eliminationOrder.concat(newlyEliminated))
    }

    if (activePlayers.length <= 1) {
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
