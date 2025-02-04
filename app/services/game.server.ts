import { Reference } from 'firebase-admin/database'
import { Action, Card, CardType, Game, GameStatus, Player, TurnPhase, TurnState } from '~/types'
import { PlayerService } from './player.server'
import { PinService } from './pin.server'
import { db } from './firebase.server'
import { ActionService } from './action.server'
import { DeckService } from './deck.server'
import { ChallengeService } from './challenge.server'
import { TurnService } from './turn.server'

export interface IGameService {
  createGame(hostId: string): Promise<{ gameId: string; pin: string }>
  joinGameByPin(playerId: string, pin: string): Promise<{ gameId: string }>
  leaveGame(playerId: string, gameId: string): Promise<{ success: boolean }>
  startGame(gameId: string, hostId: string): Promise<{ game: Game | null }>
  getGame(gameId: string): Promise<{ game: Game | null }>
  getGameByPlayerId(playerId: string): Promise<{ game: Game | null }>
  getCurrentTurn(gameId: string): Promise<{ turn: TurnState | null }>
  startGameTurn(gameId: string, action: Action): Promise<void>
  handleActionResponse(gameId: string, playerId: string, response: 'accept' | 'challenge' | 'block'): Promise<void>
  handleBlockResponse(gameId: string, playerId: string, response: 'accept' | 'challenge'): Promise<void>
  handleCardSelection(gameId: String, playerId: string, cardId: string): Promise<void>
}

export class GameService implements IGameService {
  private gamesRef: Reference = db.ref('games')

  private actionService: ActionService
  private challengeService: ChallengeService
  private deckService: DeckService
  private pinService: PinService
  private playerService: PlayerService
  private turnService: TurnService

  constructor(playerService: PlayerService) {
    this.playerService = playerService
    this.pinService = new PinService()
    this.actionService = new ActionService(this.gamesRef)
    this.deckService = new DeckService(this.gamesRef)
    this.challengeService = new ChallengeService(this.gamesRef, this.deckService)
    this.turnService = new TurnService(
      this.gamesRef,
      this.actionService,
      this.challengeService,
      this.cleanupGame.bind(this)
    )
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
      deck: remainingDeck,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentPlayerIndex: 0
    }

    await Promise.all([
      newGameRef.set(initialGame),
      this.playerService.updatePlayer(hostId, { currentGameId: gameId }),
      this.pinService.saveGameIdByPin(pin, gameId)
    ])

    return { gameId, pin }
  }

  handleActionResponse(gameId: string, playerId: string, response: 'accept' | 'challenge' | 'block') {
    return this.turnService.handleActionResponse(gameId, playerId, response)
  }

  handleBlockResponse(gameId: string, playerId: string, response: 'accept' | 'challenge') {
    return this.turnService.handleBlockResponse(gameId, playerId, response)
  }

  async handleCardSelection(gameId: string, playerId: string, cardId: string) {
    const gameRef = this.gamesRef.child(gameId)
    const game = (await gameRef.get()).val() as Game

    if (!game?.currentTurn) {
      throw new Error('No active turn')
    }

    const turn = game.currentTurn

    // Validate card selection based on current phase
    switch (turn.phase) {
      case 'CHALLENGE_RESOLUTION':
      case 'BLOCK_CHALLENGE_RESOLUTION':
        if (!turn.challengeResult) {
          throw new Error('No active challenge')
        }
        if (turn.challengeResult.successful === false) {
          return this.turnService.selectFailedChallengerCard(gameId, playerId, cardId)
        } else {
          return this.turnService.selectChallengeDefenseCard(gameId, playerId, cardId)
        }

      case 'LOSE_INFLUENCE':
        return this.turnService.selectCardToLose(gameId, playerId, cardId)

      default:
        throw new Error(`Invalid phase for card selection: ${turn.phase}`)
    }
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

    const result = await this.gamesRef.child(gameId).transaction((game: Game | null) => {
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
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null) => {
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
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null) => {
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

    return { game: result.snapshot.val() }
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
