import { Reference } from 'firebase-admin/database'
import { Action, Card, CardType, Game, GameStatus, Player, TurnPhase, TurnState } from '~/types'
import { IGameService } from './game.interface'
import { PlayerService } from './player.server'
import { PinService } from './pin.server'
import { db } from './firebase.server'
import { ActionService } from './action.server'
import { DeckService } from './deck.server'
import { ChallengeService } from './challenge.server'
import { TurnService } from './turn.server'

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
    this.challengeService = new ChallengeService(this.gamesRef, this.deckService, this.actionService)
    this.turnService = new TurnService(this.gamesRef, this.actionService, this.challengeService)
  }

  async createGame(hostId: string): Promise<{ gameId: string; pin: string }> {
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

  async startGameTurn(gameId: string, action: Action): Promise<{ success: boolean; turnState: TurnState | null }> {
    return this.turnService.startTurn(gameId, action)
  }

  async handlePlayerResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'challenge' | 'block',
    blockingCard?: CardType
  ): Promise<{ success: boolean; newTurnState: TurnState | null }> {
    return this.turnService.handlePlayerResponse(gameId, playerId, response, blockingCard)
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

    if (player.currentGameId) {
      throw new Error('Player is already in a game')
    }

    const result = await this.gamesRef.child(gameId).transaction((game: Game | null) => {
      if (!game) return null
      if (game.status !== GameStatus.WAITING) return null
      if (game.players.length >= 6) return null
      if (game.players.some(p => p.id === playerId)) return null

      const [influence, remainingDeck] = this.deckService.dealCards(game.deck, 2)

      return {
        ...game,
        players: [
          ...game.players,
          {
            id: playerId,
            username: player.username,
            influence,
            coins: 2
          }
        ],
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
      if (!game || game.status !== GameStatus.WAITING) return null

      const playerIndex = game.players.findIndex(p => p.id === playerId)
      if (playerIndex === -1) return null

      const playerCards = game.players[playerIndex].influence
      const updatedDeck = this.deckService.shuffleDeck([...game.deck, ...playerCards])
      const updatedPlayers = game.players.filter(p => p.id !== playerId)

      // If no players left, clean up the game
      if (updatedPlayers.length === 0) {
        return null
      }

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
      if (game.status !== GameStatus.WAITING) return null
      if (game.hostId !== hostId) return null
      if (game.players.length < 2) return null

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

  async handleCardSelection(gameId: string, playerId: string, cardType: CardType): Promise<{ success: boolean }> {
    const gameRef = this.gamesRef.child(gameId)
    const game = (await gameRef.get()).val() as Game

    // Verify the card can be revealed
    if (!game.currentTurn || !this.canSelectCard(game, playerId)) {
      throw new Error('Invalid card selection')
    }

    const result = await gameRef.transaction((game: Game | null) => {
      if (!game) return null

      const playerIndex = game.players.findIndex(p => p.id === playerId)
      if (playerIndex === -1) return null

      const cardIndex = game.players[playerIndex].influence.findIndex(
        card => !card.isRevealed && card.type === cardType
      )
      if (cardIndex === -1) return null

      const updatedPlayers = game.players.map(p => {
        if (p.id === playerId) {
          const updatedInfluence = [...p.influence]
          updatedInfluence[cardIndex] = {
            ...updatedInfluence[cardIndex],
            isRevealed: true
          }
          return { ...p, influence: updatedInfluence }
        }
        return p
      })

      return {
        ...game,
        players: updatedPlayers,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to handle card selection')
    }

    await this.turnService.progressToNextPhase(gameId)

    return { success: true }
  }

  private canSelectCard(game: Game, playerId: string): boolean {
    const turn = game.currentTurn
    if (!turn) return false

    // Player must lose influence in LOSE_INFLUENCE phase
    if (turn.phase === 'LOSE_INFLUENCE') {
      if (turn.action.type === 'ASSASSINATE' || turn.action.type === 'COUP') {
        return turn.action.targetPlayerId === playerId
      }
    }

    // Handle challenge losses
    if (
      (turn.phase === 'CHALLENGE_RESOLUTION' || turn.phase === 'BLOCK_CHALLENGE_RESOLUTION') &&
      turn.challengingPlayer === playerId &&
      !turn.resolvedChallenges[playerId]
    ) {
      return true
    }

    return false
  }

  async getGame(gameId: string | undefined) {
    if (!gameId) {
      throw new Error('Game ID is required')
    }
    const snapshot = await this.gamesRef.child(gameId).get()
    return { game: snapshot.val() }
  }

  async getCurrentTurn(gameId: string) {
    const snapshot = await this.gamesRef.child(`${gameId}/currentTurn`).get()
    return { turn: snapshot.val() as TurnState | null }
  }
}
