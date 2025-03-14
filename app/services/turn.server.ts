import { Reference } from 'firebase-admin/database'
import { Action, Card, CardType, Game, GameStatus, Player, TurnPhase, TurnState } from '~/types'
import { ActionService } from './action.server'
import { haveAllPlayersResponded } from '~/utils/action'
import { DeckService } from './deck.server'
import { CoupRobot } from './robot.server'

interface DataSnapshot<T = Game> {
  val(): T | null
}

interface TransactionResult<T = Game> {
  committed: boolean
  snapshot: DataSnapshot<T>
}

export interface ITurnService {
  startTurn(gameId: string, action: Action): Promise<void>
  handleActionResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'block' | 'challenge',
    claimedCardForBlock?: CardType
  ): Promise<void>
  handleTargetResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'block',
    claimedCardForBlock?: CardType
  ): Promise<void>
  handleBlockResponse(gameId: string, playerId: string, response: 'accept' | 'challenge'): Promise<void>
  handleChallengeDefenseCard(gameId: string, defenderId: string, cardId: string): Promise<void>
  handleFailedChallengerCard(gameId: string, challengerId: string, cardId: string): Promise<void>
  handleExchangeReturn(gameId: string, playerId: string, cardIds: string[]): Promise<void>
  handleBotTurn(game: Game): Promise<void>
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
    let defenseSuccessful: boolean | undefined
    let revealedCard: Card | undefined

    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
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
            console.error(`Player ${defenderId} was not challenged (action player: ${turn.action.playerId})`)
            return game
          }
          break

        case 'AWAITING_BLOCKER_DEFENSE':
          if (turn.opponentResponses?.block !== defenderId) {
            console.error(
              `Player's block was not challenged or not the defender (blocker: ${turn.opponentResponses?.block})`
            )
            return game
          }
          break

        // Only allow this method when waiting for a defense reveal.
        default:
          console.error(`Not in defense reveal phase (current phase: ${turn.phase})`)
          return game
      }

      const defender = game.players.find(p => p.id === defenderId)
      if (!defender) {
        console.error(`Defender ${defenderId} not found`)
        return game
      }

      revealedCard = defender.influence.find(c => c.id === cardId)
      if (!revealedCard) {
        console.error(`Card ${cardId} not found for player ${defender.username}`)
        return game
      }

      if (revealedCard.isRevealed) {
        console.error(`Card ${cardId} is already revealed`)
        return game
      }

      defenseSuccessful = revealedCard.type === turn.challengeResult.challengedCaracter

      // Determine the next phase based on defense result
      const nextPhase = defenseSuccessful
        ? 'REPLACING_CHALLENGE_DEFENSE_CARD'
        : turn.phase === 'AWAITING_BLOCKER_DEFENSE'
          ? 'ACTION_EXECUTION'
          : 'ACTION_FAILED'

      const { players: updatedPlayers } = this.handlePlayerCardUpdate(
        { game, playerId: defenderId, cardId: revealedCard.id },
        defenseSuccessful ? { isChallengeDefenseCard: true } : { isRevealed: true }
      )

      return {
        ...game,
        players: updatedPlayers,
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
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      console.error('Failed to handle challenge defense card')
      throw new Error('Failed to handle challenge defense card')
    }

    // For successful defense, handle card replacement in the REPLACING_CHALLENGE_DEFENSE_CARD phase
    if (defenseSuccessful && revealedCard) {
      // Process the card replacement asynchronously - don't block the request
      // This allows the server to respond to the client faster
      await this.processCardReplacement(gameId, defenderId, revealedCard)
    } else {
      // Only progress to next phase immediately for failed defense
      // For successful defense, the replacement process will handle progression
      await this.progressToNextPhase(result)
    }
  }

  async handleFailedChallengerCard(gameId: string, challengerId: string, cardId: string) {
    let targetBlockResponseTimeout: number | null = null

    // Update the challengeResult to record the card chosen as the penalty.
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game || !game.currentTurn?.challengeResult) {
        return game
      }
      const updatedGame = this.handlePlayerCardUpdate({ game, playerId: challengerId, cardId }, { isRevealed: true })
      const updatedTurn = { ...game.currentTurn }

      const { canBeBlocked, playerId: actor, targetPlayerId: target } = updatedTurn.action

      if (challengerId === actor) {
        updatedTurn.phase = 'ACTION_FAILED'
      } else if (canBeBlocked && target && challengerId !== target) {
        updatedTurn.phase = 'AWAITING_TARGET_BLOCK_RESPONSE'
        // New timeout for target to respond _after_ failed challenge from other opponent
        targetBlockResponseTimeout = Date.now() + this.RESPONSE_TIMEOUT
        updatedTurn.timeoutAt = targetBlockResponseTimeout
      } else {
        updatedTurn.phase = 'ACTION_EXECUTION'
      }

      return {
        ...updatedGame,
        currentTurn: {
          ...updatedTurn,
          challengeResult: {
            ...game.currentTurn.challengeResult,
            lostCardId: cardId
          }
        },
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to handle failed challenger card')
    }

    if (targetBlockResponseTimeout && targetBlockResponseTimeout > Date.now()) {
      this.startTimer(gameId, targetBlockResponseTimeout - Date.now())
    }

    await this.progressToNextPhase(result)
  }

  private async dealExchangeCards(gameId: string, playerId: string) {
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game || game.currentTurn?.action.type !== 'EXCHANGE') {
        console.error('No game or not an exchange action')
        return game
      }

      const [dealt, remainingDeck] = this.deckService.dealCards(game.deck, 2)

      return {
        ...game,
        currentTurn: {
          ...game.currentTurn,
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

    return result
  }

  async handleExchangeReturn(gameId: string, playerId: string, cardIds: string[]): Promise<void> {
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
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

    const isBotActor = action.playerId.startsWith('bot-')
    await gameRef.child('botActionInProgress').set(isBotActor)

    let opponentResponseTimeout: number | null = null

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
          phase: 'ACTION_EXECUTION',
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
      opponentResponseTimeout = Date.now() + this.RESPONSE_TIMEOUT
      newTurn = {
        phase: 'AWAITING_OPPONENT_RESPONSES',
        action,
        timeoutAt: opponentResponseTimeout,
        respondedPlayers: [],
        opponentResponses: null,
        challengeResult: null,
        targetSelection: null,
        exchange: null
      }

      return {
        ...game,
        botActionInProgress: CoupRobot.isBotGame(game),
        currentTurn: newTurn,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to start turn')
    }

    const updatedGame = result.snapshot.val() as Game | null

    // Start the timer for opponent responses if this action can be blocked or challenged
    if (opponentResponseTimeout && opponentResponseTimeout > Date.now()) {
      this.startTimer(gameId, opponentResponseTimeout - Date.now())
      if (CoupRobot.isBotGame(updatedGame)) {
        await this.processBotResponses(updatedGame)
      }
    }

    if (action.coinCost) {
      await this.actionService.updatePlayerCoins(gameId, { [action.playerId]: -action.coinCost })
    }

    await this.progressToNextPhase(result)
  }

  async handleTargetResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'block',
    claimedCardForBlock: CardType | null = null
  ) {
    let actorBlockResponseTimeout: number | null = null

    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      if (turn.phase !== 'AWAITING_TARGET_BLOCK_RESPONSE') return game
      if (turn.action.targetPlayerId !== playerId) return game

      const updatedTurn: TurnState = {
        ...turn,
        respondedPlayers: (turn.respondedPlayers || []).concat(playerId)
      }

      switch (response) {
        case 'accept':
          updatedTurn.phase = 'ACTION_EXECUTION'
          break

        case 'block':
          if (!claimedCardForBlock) {
            console.error('Block response without claimed card')
            return game
          }
          updatedTurn.phase = 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK'
          updatedTurn.opponentResponses = {
            block: playerId,
            claimedCard: claimedCardForBlock
          }
          actorBlockResponseTimeout = Date.now() + this.RESPONSE_TIMEOUT
          updatedTurn.timeoutAt = actorBlockResponseTimeout
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

    // Start timer for actor response to block
    if (actorBlockResponseTimeout && actorBlockResponseTimeout > Date.now()) {
      this.startTimer(gameId, actorBlockResponseTimeout - Date.now())
    }

    await this.progressToNextPhase(result)
  }

  async handleActionResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'block' | 'challenge',
    claimedCardForBlock: CardType | null = null
  ) {
    let actorBlockResponseTimeout: number | null = null

    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      if (turn.phase !== 'AWAITING_OPPONENT_RESPONSES') return game
      if (turn.action.playerId === playerId) return game
      if (turn.respondedPlayers?.includes(playerId)) return game

      const updatedTurn: TurnState = {
        ...turn,
        respondedPlayers: (turn.respondedPlayers || []).concat(playerId)
      }

      switch (response) {
        case 'accept':
          if (haveAllPlayersResponded(game, updatedTurn)) {
            updatedTurn.phase = 'ACTION_EXECUTION'
          }
          break

        case 'block':
          if (!claimedCardForBlock) {
            console.error('Block response without claimed card')
            return game
          }
          updatedTurn.phase = 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK'
          updatedTurn.opponentResponses = {
            block: playerId,
            claimedCard: claimedCardForBlock
          }
          actorBlockResponseTimeout = Date.now() + this.RESPONSE_TIMEOUT
          updatedTurn.timeoutAt = actorBlockResponseTimeout
          break

        case 'challenge':
          if (!turn.action.requiredCharacter) {
            console.error('Challenge response without required character')
            return game
          }
          updatedTurn.phase = 'AWAITING_ACTOR_DEFENSE'
          updatedTurn.opponentResponses = {
            challenge: playerId
          }
          updatedTurn.timeoutAt = 0 // No timeout for challenge response
          updatedTurn.challengeResult = {
            challengerId: playerId,
            defenseSuccessful: null,
            defendingCardId: null,
            lostCardId: null,
            challengedCaracter: turn.action.requiredCharacter
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

    // Start timer for actor response to block
    if (actorBlockResponseTimeout && actorBlockResponseTimeout > Date.now()) {
      this.startTimer(gameId, actorBlockResponseTimeout - Date.now())
    }

    await this.progressToNextPhase(result)
  }

  async handleBlockResponse(gameId: string, playerId: string, response: 'accept' | 'challenge') {
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game?.currentTurn) return game
      const turn = game.currentTurn

      // Only allow active player's response when waiting for their decision.
      if (turn.phase !== 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK') return game
      if (playerId !== turn.action.playerId) return game
      if (turn.respondedPlayers?.includes(playerId)) return game

      this.clearTimer(gameId)

      // Create updated turn state - we're setting timeout to 0 for all block responses
      // because either the action is accepted (ending the turn) or challenged (no timeout needed)
      const updatedTurn: TurnState = {
        ...turn,
        respondedPlayers: [playerId],
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
    await this.progressToNextPhase(result)
  }

  // Processes all auto-acceptances, to be run on timeout expiration after action/block declared
  private async handleTimeout(gameId: string) {
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
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
          if (turn.phase === 'AWAITING_TARGET_BLOCK_RESPONSE' && playerId !== turn.action.targetPlayerId) {
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
          } else {
            return game
          }
          break

        case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
          // On timeout, active player is considered to have accepted the block
          updatedTurn.phase = 'ACTION_FAILED'
          updatedTurn.timeoutAt = 0 // Clear timeoutAt when changing phase to action failed
          break

        case 'AWAITING_TARGET_BLOCK_RESPONSE':
          updatedTurn.phase = 'ACTION_EXECUTION'
          updatedTurn.timeoutAt = 0
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

    if (result.committed && result.snapshot.val().currentTurn.timeoutAt === 0) {
      this.clearTimer(gameId)
    }

    await this.progressToNextPhase(result)
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

  private isWaitingPhase(phase: TurnPhase): boolean {
    // Only these three phases should have timeouts that auto-progress the game
    return [
      'AWAITING_OPPONENT_RESPONSES',
      'AWAITING_ACTIVE_RESPONSE_TO_BLOCK',
      'AWAITING_TARGET_BLOCK_RESPONSE'
    ].includes(phase)
  }

  private async progressToNextPhase(result: TransactionResult): Promise<void> {
    if (!result.committed) {
      console.error('Transaction not committed')
      return
    }

    const game = result.snapshot.val()
    if (!game?.currentTurn) {
      console.error('No active turn')
      return
    }
    const currentPhase = game.currentTurn.phase

    switch (currentPhase) {
      case 'AWAITING_OPPONENT_RESPONSES':
        break

      case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
        // Waiting for the active player's decision via handleBlockResponse.
        // Bot response is handled by processBotBlockerResponse
        if (CoupRobot.isBotGame(game)) {
          await this.processBotBlockerResponse(game.id)
        }
        break

      case 'AWAITING_TARGET_BLOCK_RESPONSE':
        if (CoupRobot.isBotGame(game)) {
          await this.processBotTargetResponse(game.id)
        }
        break

      case 'AWAITING_ACTOR_DEFENSE':
        this.clearTimer(game.id)
        if (CoupRobot.isBotGame(game)) {
          await this.processBotDefense(game.id)
        }
        break

      case 'AWAITING_BLOCKER_DEFENSE':
        // Waiting for the defender to select and reveal a card.
        this.clearTimer(game.id)
        if (CoupRobot.isBotGame(game)) {
          await this.processBotDefense(game.id)
        }
        break

      case 'REPLACING_CHALLENGE_DEFENSE_CARD':
        // This is an automatic phase handled by returnAndReplaceCard
        // No action needed here as the card replacement process will
        // update the state to AWAITING_CHALLENGE_PENALTY_SELECTION
        break

      case 'AWAITING_CHALLENGE_PENALTY_SELECTION':
        if (CoupRobot.isBotGame(game)) {
          await this.processBotCardSelection(game.id)
        }
        break

      case 'ACTION_EXECUTION':
        this.clearTimer(game.id)
        await this.resolveAction(game.id, game.currentTurn.action)
        break

      case 'AWAITING_TARGET_SELECTION':
        // Waiting for the target to select a card to lose (handled via selectCardToLose).
        if (CoupRobot.isBotGame(game)) {
          await this.processBotCardSelection(game.id)
        }
        break

      case 'AWAITING_EXCHANGE_RETURN':
        // Waiting for the active player to select cards to return (handled via handleExchangeReturn).
        break

      case 'ACTION_FAILED':
        await this.endTurn(game.id)
        break

      case 'TURN_COMPLETE':
        await this.endTurn(game.id)
        break

      default:
        break
    }
  }

  /**
   * Processes bot target response to already-challenged action
   */
  private async processBotTargetResponse(gameId: string): Promise<void> {
    const { game } = await this.getGame(gameId)
    if (!game?.currentTurn) return

    const { targetPlayerId } = game.currentTurn.action
    const targetPlayer = game.players.find(p => p.id === targetPlayerId)

    if (!targetPlayer || !CoupRobot.isBotPlayer(targetPlayer) || this.isPlayerEliminated(targetPlayer)) return

    await this.startBotProcessing(gameId)
    try {
      const robot = await CoupRobot.create(targetPlayer, game)
      const { response, blockCard } = await robot.decideResponse()
      await this.handleTargetResponse(gameId, targetPlayer.id, response === 'block' ? 'block' : 'accept', blockCard)
    } catch (error) {
      console.error(`Error processing bot response: ${error}`)
    }
    await this.endBotProcessing(gameId)
  }

  /**
   * Processes bot responses to actions
   */
  private async processBotResponses(game: Game | null): Promise<void> {
    if (!game?.currentTurn) return

    const { action, respondedPlayers = [] } = game.currentTurn

    // Get all bot players who need to respond
    const respondingBots = game.players.filter(player => {
      if (player.id === action.playerId) return false
      if (!CoupRobot.isBotPlayer(player)) return false
      if (respondedPlayers.includes(player.id)) return false
      if (this.isPlayerEliminated(player)) return false
      return true
    })

    let challengingBot: Player | undefined
    let blockingBot: Player | undefined
    let botBlockCard: CardType | undefined

    await this.startBotProcessing(game.id)

    while (respondingBots.length > 0) {
      // Randomly select a bot to respond
      const bot = respondingBots.splice(Math.floor(Math.random() * respondingBots.length), 1)[0]
      try {
        const robot = await CoupRobot.create(bot, game)
        const { response, blockCard } = await robot.decideResponse()

        if (response === 'block') {
          blockingBot = bot
          botBlockCard = blockCard!
          break
        }
        if (response === 'challenge') {
          challengingBot = bot
          break
        }
        if (response === 'accept') {
          await this.handleActionResponse(game.id, bot.id, response, blockCard)
        }
      } catch (error) {
        console.error(`Error processing bot response: ${error}`)
      }
    }

    if (blockingBot) {
      await this.handleActionResponse(game.id, blockingBot.id, 'block', botBlockCard)
    } else if (challengingBot) {
      await this.handleActionResponse(game.id, challengingBot.id, 'challenge')
    }

    await this.endBotProcessing(game.id)
  }

  /**
   * Processes bot response to a block
   */
  private async processBotBlockerResponse(gameId: string): Promise<void> {
    const { game } = await this.getGame(gameId)
    if (!game?.currentTurn) return

    const { action, opponentResponses } = game.currentTurn

    if (!opponentResponses?.block) return

    const botPlayer = game.players.find(p => p.id === action.playerId)
    if (!botPlayer || !CoupRobot.isBotPlayer(botPlayer) || this.isPlayerEliminated(botPlayer)) return

    await this.startBotProcessing(gameId)
    try {
      const robot = await this.assembleRobotForPhase(game, action.playerId, ['AWAITING_ACTIVE_RESPONSE_TO_BLOCK'])
      const { response } = await robot.decideResponse()
      await this.handleBlockResponse(game.id, action.playerId, response === 'challenge' ? 'challenge' : 'accept')
    } catch (error) {
      console.error(`Error processing bot block response: ${error}`)
    }
    await this.endBotProcessing(game.id)
  }

  /**
   * Processes bot defense against a challenge
   */
  private async processBotDefense(gameId: string): Promise<void> {
    const { game } = await this.getGame(gameId)
    if (!game?.currentTurn) return

    const { phase, action, opponentResponses, challengeResult } = game.currentTurn

    if (!challengeResult) return

    let defenderId: string | undefined

    if (phase === 'AWAITING_ACTOR_DEFENSE') {
      defenderId = action.playerId
    } else if (phase === 'AWAITING_BLOCKER_DEFENSE' && opponentResponses?.block) {
      defenderId = opponentResponses.block
    }

    if (!defenderId) return

    // Get the bot player
    const botPlayer = game.players.find(p => p.id === defenderId)
    if (!botPlayer || !CoupRobot.isBotPlayer(botPlayer)) return

    await this.startBotProcessing(gameId)
    try {
      const robot = await this.assembleRobotForPhase(game, botPlayer.id, [
        'AWAITING_ACTOR_DEFENSE',
        'AWAITING_BLOCKER_DEFENSE'
      ])

      // Let bot decide which card to reveal for defense
      const { cardId } = await robot.decideCardSelection()
      await this.handleChallengeDefenseCard(game.id, defenderId, cardId)
    } catch (error) {
      console.error(`Error processing bot defense: ${error}`)
    }
    await this.endBotProcessing(gameId)
  }

  /**
   * Processes bot card selection (for losing influence, etc.)
   */
  private async processBotCardSelection(gameId: string): Promise<void> {
    const { game } = await this.getGame(gameId)
    if (!game?.currentTurn) return

    const { phase, action, challengeResult } = game.currentTurn

    let botId: string | undefined

    if (phase === 'AWAITING_TARGET_SELECTION' && action.targetPlayerId) {
      botId = action.targetPlayerId
    } else if (phase === 'AWAITING_CHALLENGE_PENALTY_SELECTION' && challengeResult?.challengerId) {
      botId = challengeResult.challengerId
    }

    if (!botId) return

    // Get the bot player
    const botPlayer = game.players.find(p => p.id === botId)
    if (!botPlayer || !CoupRobot.isBotPlayer(botPlayer)) return

    await this.startBotProcessing(gameId)
    try {
      const robot = await this.assembleRobotForPhase(game, botPlayer.id, [
        'AWAITING_TARGET_SELECTION',
        'AWAITING_CHALLENGE_PENALTY_SELECTION'
      ])

      const { cardId } = await robot.decideCardSelection()

      if (phase === 'AWAITING_TARGET_SELECTION') {
        // Handle target selection
        await this.selectCardToLose(game.id, botId, cardId)
      } else {
        // Handle challenge penalty selection
        await this.handleFailedChallengerCard(game.id, botId, cardId)
      }
    } catch (error) {
      console.error(`Error processing bot card selection: ${error}`)
    }
    await this.endBotProcessing(gameId)
  }

  /**
   * Processes bot exchange card selection
   */
  private async processBotExchangeReturn(gameId: string): Promise<void> {
    const { game } = await this.getGame(gameId)
    if (!game?.currentTurn) return

    const { action } = game.currentTurn

    // Check if the player doing the exchange is a bot
    const botPlayer = game.players.find(p => p.id === action.playerId)
    if (!botPlayer || !CoupRobot.isBotPlayer(botPlayer)) return

    await this.startBotProcessing(game.id)
    try {
      const robot = await this.assembleRobotForPhase(game, botPlayer.id, ['AWAITING_EXCHANGE_RETURN'])
      const { cardIds } = await robot.decideExchangeCards()
      await this.handleExchangeReturn(game.id, action.playerId, cardIds)
    } catch (error) {
      console.error(`Error processing bot exchange: ${error}`)
    }
    await this.endBotProcessing(game.id)
  }

  private async assembleRobotForPhase(
    game: Game | null,
    botPlayerId: string,
    validPhases: TurnPhase[]
  ): Promise<CoupRobot> {
    if (!game?.currentTurn || !validPhases.includes(game.currentTurn.phase)) {
      throw new Error('Invalid turn phase for robot assembly: ' + game?.currentTurn?.phase)
    }
    const updatedPlayer = game.players.find(p => p.id === botPlayerId)
    if (!updatedPlayer || !CoupRobot.isBotPlayer(updatedPlayer)) {
      throw new Error('Bot player not found: ' + botPlayerId)
    }
    return await CoupRobot.create(updatedPlayer, game)
  }

  /**
   * Helper method to get the current game
   */
  private async getGame(gameId: string): Promise<{ game: Game | null }> {
    const snapshot = await this.gamesRef.child(gameId).get()
    return { game: snapshot.val() as Game | null }
  }

  private async endTurn(gameId: string): Promise<void> {
    this.clearTimer(gameId)

    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game) return null

      const nextPlayerIndex = this.getNextPlayerIndex(game)

      return {
        ...game,
        botActionInProgress: false,
        currentPlayerIndex: nextPlayerIndex,
        currentTurn: null,
        updatedAt: Date.now()
      }
    })

    const updatedGame = result.committed && (result.snapshot.val() as Game | null)
    if (updatedGame) {
      // Check game completion
      await this.checkGameStatus(updatedGame)

      // If game is still in progress, check if the next player is a bot
      // Handle bot turn asynchronously to allow quick response to client
      if (updatedGame.status === GameStatus.IN_PROGRESS) {
        await this.handleBotTurn(updatedGame)
      }
    }
  }

  /**
   * Checks if the current player is a bot and handles their turn if needed
   */
  async handleBotTurn(game: Game): Promise<void> {
    const currentPlayer = game.players[game.currentPlayerIndex]
    if (!currentPlayer || !CoupRobot.isBotPlayer(currentPlayer) || this.isPlayerEliminated(currentPlayer)) {
      return
    }

    await this.startBotProcessing(game.id)
    try {
      // Create a robot instance for this bot
      const robot = await CoupRobot.create(currentPlayer, game)
      // Let the bot decide on an action
      const { action } = await robot.decideAction()

      // Start the turn with the bot's chosen action
      await this.startTurn(game.id, action)
    } catch (error) {
      console.error(`Error handling bot turn: ${error}`)
    }
    await this.endBotProcessing(game.id)
  }

  private async startBotProcessing(gameId: string) {
    await this.gamesRef.child(gameId + '/botActionInProgress').set(true)
  }

  private async endBotProcessing(gameId: string) {
    await this.gamesRef.child(gameId + '/botActionInProgress').set(false)
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
    return !!player.influence?.every(card => card.isRevealed)
  }

  private async resolveAction(gameId: string, action: Action): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)
    const game = (await gameRef.get()).val() as Game | null
    const turn = game?.currentTurn

    if (!turn) {
      throw new Error('No active turn')
    }

    await this.actionService.resolveCoinUpdates(game, action)

    const actor = game.players.find(p => p.id === action.playerId)
    const target = game.players.find(p => p.id === action.targetPlayerId)

    switch (action.type) {
      case 'EXCHANGE':
        await this.dealExchangeCards(gameId, action.playerId)
        if (actor && CoupRobot.isBotPlayer(actor)) {
          await this.processBotExchangeReturn(gameId)
        }

        break

      case 'COUP':
      case 'ASSASSINATE':
        // The target might have already died by now, turn must end before target selection
        if (target && this.isPlayerEliminated(target)) {
          await this.endTurn(gameId)
        } else {
          await gameRef.child('currentTurn/phase').set('AWAITING_TARGET_SELECTION')

          // Check if the target is a bot, and if so, immediately process their card selection
          if (target && CoupRobot.isBotPlayer(target)) {
            await this.processBotCardSelection(gameId)
          }
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

  /**
   * Process card replacement asynchronously to avoid blocking client requests
   */
  private async processCardReplacement(gameId: string, defenderId: string, card: Card): Promise<void> {
    try {
      // Replace the card and return to deck, will update state to AWAITING_CHALLENGE_PENALTY_SELECTION
      const result = await this.returnAndReplaceCard(gameId, defenderId, card)

      // Progress to next phase
      await this.progressToNextPhase(result)
    } catch (e) {
      console.error(`Error in async card replacement process: ${e}`)

      // Attempt to recover the game state on error
      try {
        const gameRef = this.gamesRef.child(gameId)
        const snapshot = await gameRef.get()
        const game = snapshot.val() as Game | null

        if (game && game.currentTurn?.phase === 'REPLACING_CHALLENGE_DEFENSE_CARD') {
          // If we're still in the replacement phase, force transition to penalty selection
          await gameRef.child('currentTurn/phase').set('AWAITING_CHALLENGE_PENALTY_SELECTION')

          // Get updated state and progress
          const updatedSnapshot = await gameRef.get()
          if (updatedSnapshot.exists()) {
            await this.progressToNextPhase({ committed: true, snapshot: updatedSnapshot })
          }
        }
      } catch (recoveryError) {
        console.error(`Failed to recover from card replacement error: ${recoveryError}`)
      }
    }
  }

  private async returnAndReplaceCard(gameId: string, playerId: string, card: Card): Promise<TransactionResult> {
    // Return card to deck
    const newDeck = await this.deckService.returnCardsToDeck(gameId, card)

    // Then draw a new card for the player
    const [dealtCards, remainingDeck] = this.deckService.dealCards(newDeck, 1)

    // Update the game state and change the phase if needed
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
        currentTurn: {
          ...game.currentTurn,
          phase: 'AWAITING_CHALLENGE_PENALTY_SELECTION'
        },
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to return and replace card')
    }

    return result
  }

  private async updatePlayerCard(
    { gameId, playerId, cardId }: { gameId: string; playerId: string; cardId: string },
    update: Partial<Card>
  ) {
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game) return game
      return this.handlePlayerCardUpdate({ game, playerId, cardId }, update)
    })
    if (!result.committed) {
      throw new Error('Failed to update card')
    }
    return result
  }

  private handlePlayerCardUpdate(
    { game, playerId, cardId }: { game: Game; playerId: string; cardId: string },
    update: Partial<Card>
  ): Game {
    const playerIndex = game.players?.findIndex(p => p.id === playerId)
    if (playerIndex === undefined || playerIndex < 0) {
      console.error('Player not found')
      return game
    }
    const cardIndex = game.players[playerIndex]?.influence.findIndex(c => c.id === cardId)
    if (cardIndex === undefined || cardIndex < 0) {
      console.error('Card not found')
      return game
    }
    const card = game.players[playerIndex].influence[cardIndex]
    const updatedGame = { ...game }
    updatedGame.players[playerIndex].influence[cardIndex] = { ...card, ...update }
    updatedGame.updatedAt = Date.now()
    return updatedGame
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
