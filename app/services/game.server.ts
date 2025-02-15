import { Reference } from 'firebase-admin/database'
import { Action, Card, CardType, Game, GameStatus, Player, TurnPhase, TurnState } from '~/types'
import { PlayerService } from './player.server'
import { PinService } from './pin.server'
import { db } from './firebase.server'
import { ActionService } from './action.server'
import { DeckService } from './deck.server'
import { TurnService } from './turn.server'

export interface IGameService {
  createGame(hostId: string): Promise<{ gameId: string; pin: string }>
  joinGameByPin(playerId: string, pin: string): Promise<{ gameId: string }>
  leaveGame(playerId: string, gameId: string): Promise<{ success: boolean }>
  startGame(gameId: string, hostId: string): Promise<{ game: Game | null }>
  getGame(gameId: string): Promise<{ game: Game | null }>
  getGameByPlayerId(playerId: string): Promise<{ game: Game | null }>
  getCurrentTurn(gameId: string): Promise<{ turn: TurnState | null }>
  startGameTurn(gameId: string, action: Action): Promise<{ game: Game | null }>
  handleExchangeReturn(
    gameId: string,
    playerId: string,
    exchangedCardIds: Array<string>
  ): Promise<{ game: Game | null }>
  handleResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'challenge' | 'block'
  ): Promise<{ game: Game | null }>
  handleCardSelection(gameId: String, playerId: string, cardId: string): Promise<{ game: Game | null }>
}

export class GameService implements IGameService {
  private gamesRef: Reference = db.ref('games')

  private actionService: ActionService
  private deckService: DeckService
  private pinService: PinService
  private playerService: PlayerService
  private turnService: TurnService

  constructor(playerService: PlayerService) {
    this.playerService = playerService
    this.pinService = new PinService()
    this.actionService = new ActionService(this.gamesRef)
    this.deckService = new DeckService(this.gamesRef)
    this.turnService = new TurnService(this.gamesRef, this.actionService, this.deckService, this.cleanupGame.bind(this))
  }

  async createGame(hostId: string) {
    const { player: host } = await this.playerService.getPlayer(hostId)
    if (!host) {
      throw new Error('Host player not found')
    }

    const pin = await this.pinService.generateUniquePin()
    const newGameRef = this.gamesRef.push()
    const gameId = newGameRef.key!

    const deck = this.deckService.createInitialDeck()
    const [hostInfluence, remainingDeck] = this.deckService.dealCards(deck, 2)

    const initialGame: Game = {
      id: gameId,
      pin,
      hostId,
      status: GameStatus.WAITING,
      players: [
        {
          id: hostId,
          username: host.username,
          influence: hostInfluence,
          coins: 2
        }
      ],
      currentTurn: null,
      deck: remainingDeck,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentPlayerIndex: 0,
      eliminationOrder: []
    }

    await Promise.all([
      newGameRef.set(initialGame),
      this.playerService.updatePlayer(hostId, { currentGameId: gameId }),
      this.pinService.saveGameIdByPin(pin, gameId)
    ])

    return { gameId, pin }
  }

  async handleResponse(gameId: string, playerId: string, response: 'accept' | 'challenge' | 'block') {
    const gameRef = this.gamesRef.child(gameId)
    const game = (await gameRef.get()).val() as Game

    if (!game?.currentTurn) {
      throw new Error('No active turn')
    }

    const turn = game.currentTurn

    switch (turn.phase) {
      case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
        if (playerId !== turn.action.playerId) {
          throw new Error('Not your turn to respond')
        }
        if (response === 'block') {
          throw new Error('Invalid response. You cannot block a block')
        }
        return this.turnService.handleBlockResponse(gameId, playerId, response)

      case 'AWAITING_OPPONENT_RESPONSES':
        return this.turnService.handleActionResponse(gameId, playerId, response)

      default:
        throw new Error(`Invalid phase for response: ${turn.phase}`)
    }
  }

  async handleCardSelection(gameId: string, playerId: string, cardId: string) {
    const gameRef = this.gamesRef.child(gameId)
    const game = (await gameRef.get()).val() as Game

    if (!game?.currentTurn) {
      throw new Error('No active turn')
    }

    const turn = game.currentTurn

    // Handle card selection based on current waiting phase
    switch (turn.phase) {
      case 'AWAITING_ACTOR_DEFENSE': {
        // If blocking player exists, they must prove their block
        // Otherwise, the action player must prove their action
        if (playerId !== turn.action.playerId) {
          throw new Error('Not your turn to reveal a card')
        }
        await this.turnService.handleChallengeDefenseCard(gameId, playerId, cardId)
        break
      }

      case 'AWAITING_BLOCKER_DEFENSE': {
        if (playerId !== turn.opponentResponses?.block) {
          throw new Error('Not your turn to reveal a card')
        }
        await this.turnService.handleChallengeDefenseCard(gameId, playerId, cardId)
        break
      }

      case 'AWAITING_CHALLENGE_PENALTY_SELECTION': {
        if (playerId !== turn.challengeResult?.challengerId) {
          throw new Error('Not your turn to reveal a card')
        }
        await this.turnService.handleFailedChallengerCard(gameId, playerId, cardId)
        break
      }

      case 'AWAITING_TARGET_SELECTION': {
        // Handle revealing a card when targeted by assassination or coup
        if (!turn.action.targetPlayerId) {
          throw new Error('No target player')
        }

        if (playerId !== turn.action.targetPlayerId) {
          throw new Error('Not your turn to reveal a card')
        }

        if (!['ASSASSINATE', 'COUP'].includes(turn.action.type)) {
          throw new Error('Invalid action type for losing influence')
        }

        await this.turnService.selectCardToLose(gameId, playerId, cardId)
        break
      }

      default:
        throw new Error(`Invalid phase for card selection: ${turn.phase}`)
    }

    return this.getGame(gameId)
  }

  async handleExchangeReturn(gameId: string, playerId: string, cardIds: string[]) {
    await this.turnService.handleExchangeReturn(gameId, playerId, cardIds)
    return this.getGame(gameId)
  }

  startGameTurn(gameId: string, action: Action) {
    return this.turnService.startTurn(gameId, action)
  }

  async joinGameByPin(playerId: string, pin: string): Promise<{ gameId: string }> {
    const gameId = await this.pinService.getGameIdByPin(pin)

    if (!gameId) {
      throw new Error('Game not found')
    }

    return { gameId: await this.joinGame(playerId, gameId) }
  }

  private async joinGame(playerId: string, gameId: string): Promise<string> {
    const { player } = await this.playerService.getPlayer(playerId)

    if (!player) {
      throw new Error('Player not found')
    }

    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game) return null
      if (game.status !== GameStatus.WAITING) return game
      if (game.players.length >= 6) return game
      if (game.players.some(p => p.id === playerId)) return game

      const [influence, remainingDeck] = this.deckService.dealCards(game.deck, 2)

      return {
        ...game,
        players: game.players.slice().concat({ id: playerId, username: player.username, influence, coins: 2 }),
        deck: remainingDeck,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to join game')
    }

    await this.playerService.updatePlayer(playerId, { currentGameId: gameId })

    return gameId
  }

  async leaveGame(playerId: string, gameId: string) {
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game || game.status !== GameStatus.WAITING) return game

      const playerIndex = game.players.findIndex(p => p.id === playerId)
      if (playerIndex === -1) return game

      const playerCards = game.players[playerIndex].influence
      const updatedDeck = this.deckService.shuffleDeck([...game.deck, ...playerCards])
      const updatedPlayers = game.players.filter(p => p.id !== playerId)

      // If no players left, clean up the game
      if (updatedPlayers.length === 0) return null

      return {
        ...game,
        players: updatedPlayers,
        deck: updatedDeck,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to leave game')
    }

    await this.playerService.updatePlayer(playerId, { currentGameId: null })

    return { success: true }
  }

  async startGame(gameId: string, hostId: string) {
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game) return null
      if (game.status !== GameStatus.WAITING) return game
      if (game.hostId !== hostId) return game
      if (game.players.length < 2) return game

      const firstPlayerIndex = Math.floor(Math.random() * game.players.length)

      return {
        ...game,
        status: GameStatus.IN_PROGRESS,
        currentPlayerIndex: firstPlayerIndex,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to start game')
    }

    return { game: result.snapshot.val() as Game | null }
  }

  async getGame(gameId?: string | null) {
    if (!gameId) {
      throw new Error('Game ID is required')
    }
    const snapshot = await this.gamesRef.child(gameId).get()
    return { game: snapshot.val() as Game | null }
  }

  async getGameByPlayerId(playerId: string) {
    const { player } = await this.playerService.getPlayer(playerId)
    const { currentGameId } = player || {}
    try {
      return await this.getGame(currentGameId)
    } catch (e) {
      return { game: null }
    }
  }

  async getCurrentTurn(gameId: string) {
    const snapshot = await this.gamesRef.child(`${gameId}/currentTurn`).get()
    return { turn: snapshot.val() as TurnState | null }
  }

  private async cleanupGame(gameId: string, winnerId = ''): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)
    const snapshot = await gameRef.get()
    const game = snapshot.val() as Game

    if (!game) return

    // Clear player game references, remove PIN and mark game as completed
    await Promise.all([
      ...game.players.map(player => this.playerService.updatePlayer(player.id, { currentGameId: null })),
      this.pinService.removeGamePin(gameId),
      gameRef.update({ status: GameStatus.COMPLETED, winnerId: winnerId || null, completedAt: Date.now() })
    ])
  }
}
