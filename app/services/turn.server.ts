import { Reference } from 'firebase-admin/database'
import { Action, CardType, Game, GameStatus, Player, TurnPhase, TurnState } from '~/types'
import { ActionService } from './action.server'
import { ChallengeService } from './challenge.server'

export interface ITurnService {
  startTurn(gameId: string, action: Action): Promise<{ success: boolean; turnState: TurnState | null }>
  handlePlayerResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'challenge' | 'block',
    blockingCard?: CardType
  ): Promise<{ success: boolean; newTurnState: TurnState | null }>
  progressToNextPhase(gameId: string): Promise<void>
  updateTurnPhase(gameId: string, newPhase: TurnPhase): Promise<void>
  endTurn(gameId: string): Promise<void>
}

export class TurnService implements ITurnService {
  private readonly CHALLENGE_TIMEOUT = 20_000 // 20 seconds
  private readonly RESPONSE_TIMEOUT = 10_000 // 10 seconds

  private gamesRef: Reference
  private actionService: ActionService
  private challengeService: ChallengeService

  constructor(gamesRef: Reference, actionService: ActionService, challengeService: ChallengeService) {
    this.gamesRef = gamesRef
    this.actionService = actionService
    this.challengeService = challengeService
  }

  async startTurn(gameId: string, action: Action): Promise<{ success: boolean; turnState: TurnState | null }> {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null) => {
      if (!game) return null

      // Validate current turn state
      if (game.currentTurn && !this.isTurnComplete(game.currentTurn)) {
        return null // Abort if there's an ongoing turn
      }

      // Validate the action
      if (!this.actionService.validateAction(game, action)) {
        return null
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
        resolvedChallenges: {}
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

    const turnState = result.snapshot.val()?.currentTurn

    // Handle post-turn creation logic
    if (action.autoResolve) {
      await this.resolveAction(gameId, action)
    } else {
      await this.progressToNextPhase(gameId)
    }

    return {
      success: true,
      turnState
    }
  }

  async handlePlayerResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'challenge' | 'block',
    blockingCard?: CardType
  ): Promise<{ success: boolean; newTurnState: TurnState | null }> {
    const gameRef = this.gamesRef.child(gameId)
    let challengeResult: boolean | null = null
    let blockChallengeResult: boolean | null = null

    // Pre-transaction: Handle challenge resolution if needed
    const currentGame = (await gameRef.get()).val() as Game
    if (!currentGame || !currentGame.currentTurn) {
      throw new Error('No active turn')
    }

    if (currentGame.currentTurn.phase === 'CHALLENGE_RESOLUTION') {
      challengeResult = await this.challengeService.resolveChallengeReveal(currentGame, currentGame.currentTurn)
    } else if (currentGame.currentTurn.phase === 'BLOCK_CHALLENGE_RESOLUTION') {
      blockChallengeResult = await this.challengeService.resolveBlockChallengeReveal(
        currentGame,
        currentGame.currentTurn
      )
    }

    const result = await gameRef.transaction((game: Game | null) => {
      if (!game || !game.currentTurn) return null

      // Validate the response
      if (!this.isValidResponse(game.currentTurn, playerId, response)) {
        return null
      }

      const turn = { ...game.currentTurn }
      turn.respondedPlayers = turn.respondedPlayers || []

      switch (turn.phase) {
        case 'CHALLENGE_BLOCK_WINDOW':
          if (response === 'accept') {
            turn.respondedPlayers.push(playerId)
            if (this.haveAllPlayersResponded(game.players, turn)) {
              turn.phase = 'ACTION_RESOLUTION'
            }
          } else if (response === 'challenge') {
            turn.phase = 'CHALLENGE_RESOLUTION'
            turn.challengingPlayer = playerId
            turn.timeoutAt = Date.now() + this.RESPONSE_TIMEOUT
          } else if (
            response === 'block' &&
            blockingCard &&
            this.actionService.isActionBlocked(turn.action, blockingCard)
          ) {
            turn.phase = 'BLOCK_DECLARED'
            turn.blockingPlayer = playerId
            turn.blockingCard = blockingCard
            turn.respondedPlayers = [] // Reset for new phase
          }
          break

        case 'BLOCK_CHALLENGE_WINDOW':
          if (response === 'accept') {
            turn.phase = 'ACTION_FAILED'
          } else if (response === 'challenge') {
            turn.phase = 'BLOCK_CHALLENGE_RESOLUTION'
            turn.challengingPlayer = playerId
            turn.timeoutAt = Date.now() + this.RESPONSE_TIMEOUT
          }
          break

        case 'CHALLENGE_RESOLUTION':
          if (challengeResult !== null) {
            turn.phase = challengeResult ? 'ACTION_FAILED' : 'ACTION_RESOLUTION'
          }
          break

        case 'BLOCK_CHALLENGE_RESOLUTION':
          if (blockChallengeResult !== null) {
            turn.phase = blockChallengeResult ? 'ACTION_RESOLUTION' : 'ACTION_FAILED'
          }
          break
      }

      return {
        ...game,
        currentTurn: turn,
        updatedAt: Date.now()
      }
    })

    if (!result.committed || !result.snapshot.val()?.currentTurn) {
      throw new Error('Failed to handle player response')
    }

    const newTurnState = result.snapshot.val().currentTurn

    // Post-transaction: Progress game state if needed
    await this.progressToNextPhase(gameId)

    return {
      success: true,
      newTurnState
    }
  }

  async progressToNextPhase(gameId: string): Promise<void> {
    const snapshot = await this.gamesRef.child(gameId).get()
    const game = snapshot.val() as Game

    if (!game || !game.currentTurn) return

    switch (game.currentTurn.phase) {
      case 'ACTION_DECLARED':
        await this.updateTurnPhase(gameId, 'CHALLENGE_BLOCK_WINDOW')
        break

      case 'BLOCK_DECLARED':
        await this.updateTurnPhase(gameId, 'BLOCK_CHALLENGE_WINDOW')
        break

      case 'ACTION_RESOLUTION':
        if (this.actionRequiresInfluenceLoss(game.currentTurn.action)) {
          await this.updateTurnPhase(gameId, 'LOSE_INFLUENCE')
        } else {
          await this.resolveAction(gameId, game.currentTurn.action)
        }
        break

      case 'LOSE_INFLUENCE':
        await this.resolveAction(gameId, game.currentTurn.action)
        break

      case 'ACTION_FAILED':
        await this.endTurn(gameId)
        break
    }
  }

  async updateTurnPhase(gameId: string, newPhase: TurnPhase): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)

    await gameRef.transaction((game: Game | null) => {
      if (!game || !game.currentTurn) return null

      return {
        ...game,
        currentTurn: {
          ...game.currentTurn,
          phase: newPhase,
          timeoutAt:
            Date.now() + (newPhase === 'CHALLENGE_BLOCK_WINDOW' ? this.CHALLENGE_TIMEOUT : this.RESPONSE_TIMEOUT)
        },
        updatedAt: Date.now()
      }
    })
  }

  async endTurn(gameId: string): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)

    await gameRef.transaction((game: Game | null) => {
      if (!game) return null

      const nextPlayerIndex = this.getNextPlayerIndex(game)

      return {
        ...game,
        currentPlayerIndex: nextPlayerIndex,
        currentTurn: null,
        updatedAt: Date.now()
      }
    })
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
        resolvedChallenges: {}
      },
      updatedAt: Date.now()
    }
  }

  private async resolveAction(gameId: string, action: Action): Promise<void> {
    // First apply the action effects
    await this.actionService.applyActionEffects(gameId, action)

    // Then update game state
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

    if (!result.committed) {
      throw new Error('Failed to resolve action')
    }

    // Check game completion
    const gameStatus = await this.checkGameStatus(gameId)
    if (gameStatus === GameStatus.COMPLETED) {
      await this.gamesRef.child(`${gameId}/status`).set(GameStatus.COMPLETED)
    }
  }

  private async checkGameStatus(gameId: string): Promise<GameStatus> {
    const snapshot = await this.gamesRef.child(`${gameId}/players`).get()
    const players = snapshot.val() as Player[]

    const activePlayers = players.filter(p => !this.isPlayerEliminated(p))
    return activePlayers.length <= 1 ? GameStatus.COMPLETED : GameStatus.IN_PROGRESS
  }

  private isValidResponse(turn: TurnState, playerId: string, response: 'accept' | 'challenge' | 'block'): boolean {
    // Player can't respond to their own action
    if (playerId === turn.action.playerId) {
      return false
    }

    // Player can't respond twice in the same phase
    if (turn.respondedPlayers?.includes(playerId)) {
      return false
    }

    // Check if the response is valid for the current phase
    switch (turn.phase) {
      case 'CHALLENGE_BLOCK_WINDOW':
        if (response === 'block' && !turn.action.canBeBlocked) return false
        if (response === 'challenge' && !turn.action.canBeChallenged) return false
        break

      case 'BLOCK_CHALLENGE_WINDOW':
        // Only the original action player can challenge a block
        if (response === 'challenge' && playerId !== turn.action.playerId) return false
        break

      // Other phases might not accept responses
      default:
        return false
    }

    return true
  }

  private haveAllPlayersResponded(players: Player[], turn: TurnState): boolean {
    const activePlayers = players.filter(p => !this.isPlayerEliminated(p))
    const requiredResponses = activePlayers.filter(p => p.id !== turn.action.playerId).length
    return (turn.respondedPlayers?.length || 0) >= requiredResponses
  }

  private isTurnComplete(turn: TurnState): boolean {
    return turn.phase === 'ACTION_RESOLUTION' || turn.phase === 'ACTION_FAILED'
  }

  private actionRequiresInfluenceLoss(action: Action): boolean {
    return action.type === 'ASSASSINATE' || action.type === 'COUP'
  }
}
