import { Reference } from 'firebase-admin/database'
import { Action, Card, CardType, Game, GameStatus, Player, TurnPhase, TurnState } from '~/types'
import { PlayerService } from './player.server'
import { PinService } from './pin.server'
import { db } from './firebase.server'
import { ActionService } from './action.server'
import { DeckService } from './deck.server'
import { TurnService } from './turn.server'
import { CoupRobot } from './robot.server'

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
    response: 'accept' | 'challenge' | 'block',
    claimedCardForBlock?: CardType
  ): Promise<{ game: Game | null }>
  handleCardSelection(gameId: String, playerId: string, cardId: string): Promise<{ game: Game | null }>
  updatePlayer(playerId: string, data: Partial<Omit<Player, 'influence' | 'coins'>>): Promise<{ player: Player | null }>
  addBot(gameId: string): Promise<{ botId: string }>
  removeBot(gameId: string, botId: string): Promise<{ botId: string }>
  rematch(gameId: string, hostId: string): Promise<{ newGameId: string; pin: string }>
  advanceTurnState(gameId: string): Promise<{ game: Game | null }>
}

export class GameService implements IGameService {
  private gamesRef: Reference = db.ref('games')
  private botsRef: Reference = db.ref('bots')

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

  async advanceTurnState(gameId: string) {
    await this.turnService.handleNextPhase(gameId)
    return this.getGame(gameId)
  }

  async createGame(hostId: string) {
    const { player: host } = await this.playerService.getPlayer(hostId)
    if (!host) {
      throw new Error('Host player not found')
    }

    if (host.currentGameId) {
      const { game: existingGame } = await this.getGame(host.currentGameId)
      if (existingGame?.status === 'WAITING') {
        return { gameId: host.currentGameId, pin: existingGame.pin }
      }
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

  async handleResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'challenge' | 'block',
    claimedCardForBlock?: CardType
  ) {
    const gameRef = this.gamesRef.child(gameId)
    const game = (await gameRef.get()).val() as Game

    if (!game?.currentTurn) {
      throw new Error('No active turn')
    }

    const { phase, action } = game.currentTurn

    switch (phase) {
      case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
        if (playerId !== action.playerId) {
          throw new Error('Not your turn to respond')
        }
        if (response === 'block') {
          throw new Error('Invalid response. You cannot block a block')
        }
        await this.turnService.handleBlockResponse(gameId, playerId, response)
        break

      case 'AWAITING_OPPONENT_RESPONSES':
        await this.turnService.handleActionResponse(gameId, playerId, response, claimedCardForBlock)
        break

      case 'AWAITING_TARGET_BLOCK_RESPONSE':
        if (playerId !== action.targetPlayerId) {
          throw new Error('Not your turn to respond')
        }
        if (response === 'challenge') {
          throw new Error('Invalid response. You cannot challenge in this phase')
        }
        await this.turnService.handleTargetResponse(gameId, playerId, response, claimedCardForBlock)
        break

      default:
        throw new Error(`Invalid phase for response: ${phase}`)
    }

    return this.getGame(gameId)
  }

  async handleCardSelection(gameId: string, playerId: string, cardId: string) {
    const gameRef = this.gamesRef.child(gameId)
    const game = (await gameRef.get()).val() as Game

    if (!game?.currentTurn) {
      throw new Error('No active turn')
    }

    const { phase, action, opponentResponses, challengeResult } = game.currentTurn

    // Handle card selection based on current waiting phase
    switch (phase) {
      case 'AWAITING_ACTOR_DEFENSE': {
        // If blocking player exists, they must prove their block
        // Otherwise, the action player must prove their action
        if (playerId !== action.playerId) {
          throw new Error('Not your turn to reveal a card')
        }
        await this.turnService.handleChallengeDefenseCard(gameId, playerId, cardId)
        break
      }

      case 'AWAITING_BLOCKER_DEFENSE': {
        if (playerId !== opponentResponses?.block) {
          throw new Error('Not your turn to reveal a card')
        }
        await this.turnService.handleChallengeDefenseCard(gameId, playerId, cardId)
        break
      }

      case 'AWAITING_CHALLENGE_PENALTY_SELECTION': {
        if (playerId !== challengeResult?.challengerId) {
          throw new Error('Not your turn to reveal a card')
        }
        await this.turnService.handleFailedChallengerCard(gameId, playerId, cardId)
        break
      }

      case 'AWAITING_TARGET_SELECTION': {
        // Handle revealing a card when targeted by assassination or coup
        if (!action.targetPlayerId) {
          throw new Error('No target player')
        }

        if (playerId !== action.targetPlayerId) {
          throw new Error('Not your turn to reveal a card')
        }

        if (!['ASSASSINATE', 'COUP'].includes(action.type)) {
          throw new Error('Invalid action type for losing influence')
        }

        await this.turnService.selectCardToLose(gameId, playerId, cardId)
        break
      }

      default:
        throw new Error(`Invalid phase for card selection: ${phase}`)
    }

    return this.getGame(gameId)
  }

  async handleExchangeReturn(gameId: string, playerId: string, cardIds: string[]) {
    await this.turnService.handleExchangeReturn(gameId, playerId, cardIds)
    return this.getGame(gameId)
  }

  async startGameTurn(gameId: string, action: Action) {
    await this.turnService.startTurn(gameId, action)
    return this.getGame(gameId)
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
      if (!game || !game.players?.length) {
        return game
      }

      const playerIndex = game.players.findIndex(p => p.id === playerId)
      if (playerIndex === -1) {
        return game
      }

      const playerCards = game.players[playerIndex].influence
      const updatedDeck = this.deckService.shuffleDeck([...game.deck, ...playerCards])
      const updatedPlayers = game.players.filter(p => p.id !== playerId)

      return {
        ...game,
        status: playerId === game.hostId ? 'COMPLETED' : game.status,
        players: updatedPlayers,
        deck: updatedDeck,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to leave game')
    }

    const updatedGame = result.snapshot.val() as Game | null
    const { pin = null } = updatedGame || {}
    const humanPlayerCount = (updatedGame?.players || []).reduce((ct, p) => ct + (CoupRobot.isBotPlayer(p) ? 0 : 1), 0)

    if (humanPlayerCount < 1) {
      if (pin) await this.pinService.removeGamePin(pin)
      await this.playerService.updatePlayer(playerId, { currentGameId: null })
      await this.removeGame(gameId)
    } else if (updatedGame?.status === 'COMPLETED') {
      await this.cleanupGame(gameId)
    }

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

    const game = result.snapshot.val() as Game | null

    try {
      return { game }
    } finally {
      if (game?.status === GameStatus.IN_PROGRESS && CoupRobot.isBotPlayer(game.players[game.currentPlayerIndex])) {
        // If the first player is a bot, start their turn for them
        await this.turnService.handleBotTurn(game)
      }
    }
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

  private async cleanupGame(gameId: string, winnerId?: string): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)
    const snapshot = await gameRef.get()
    const game = snapshot.val() as Game | null

    if (!game) return

    // Clear player game references, remove PIN and mark game as completed
    await Promise.all([
      this.pinService.removeGamePin(game.pin),
      gameRef.update({ status: GameStatus.COMPLETED, winnerId: winnerId || null, completedAt: Date.now() }),
      this.botsRef.child(gameId).remove()
    ])
  }

  async updatePlayer(playerId: string, data: Partial<Omit<Player, 'influence' | 'coins'>>) {
    const { player } = await this.playerService.updatePlayer(playerId, data)
    if (player?.currentGameId) {
      const result = await this.gamesRef.child(player.currentGameId).transaction((game: Game | null): Game | null => {
        if (!game) return game
        const playerIndex = game.players.findIndex(p => p.id === playerId)
        if (playerIndex === -1) {
          console.error('Player not found')
          return game
        }
        const updatedPlayers = game.players.slice()
        updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], ...data }
        return { ...game, players: updatedPlayers, updatedAt: Date.now() }
      })
      if (!result.committed) {
        throw new Error('Failed to update player in game')
      }
    }
    return { player }
  }

  async removeBot(gameId: string, botId: string): Promise<{ botId: string }> {
    const { game } = await this.getGame(gameId)
    if (!game) {
      throw new Error('Game not found')
    }
    if (game.status !== GameStatus.WAITING) {
      throw new Error('Cannot remove bots after game has started')
    }
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game || game.status !== GameStatus.WAITING) return game

      const botPlayerIndex = game.players?.findIndex(p => p.id === botId) ?? -1
      if (botPlayerIndex < 0) return game

      const newDeck = this.deckService.shuffleDeck(game.deck.concat(game.players[botPlayerIndex].influence))
      const newPlayers = game.players?.slice() || []
      newPlayers.splice(botPlayerIndex, 1)

      return {
        ...game,
        players: newPlayers,
        deck: newDeck,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to add bot to game')
    }

    return { botId }
  }

  async addBot(gameId: string): Promise<{ botId: string }> {
    // Get the current game to check existing bots
    const { game } = await this.getGame(gameId)

    if (!game) {
      throw new Error('Game not found')
    }

    if (game.status !== GameStatus.WAITING) {
      throw new Error('Cannot add bots after game has started')
    }

    if (game.players.length >= 6) {
      throw new Error('Game is full')
    }

    // Generate unique bot username
    const botUsername = CoupRobot.getRandomUsername(game.players.map(p => p.username))

    // Create a unique ID for the bot
    const botId = `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Add the bot to the game
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null): Game | null => {
      if (!game) return null
      if (game.status !== GameStatus.WAITING) return game
      if (game.players.length >= 6) return game

      const [influence, remainingDeck] = this.deckService.dealCards(game.deck, 2)

      return {
        ...game,
        players: [
          ...game.players,
          {
            id: botId,
            username: botUsername,
            influence,
            coins: 2
          }
        ],
        deck: remainingDeck,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to add bot to game')
    }

    return { botId }
  }

  async rematch(gameId: string, hostId: string): Promise<{ newGameId: string; pin: string }> {
    // Get the original game
    const { game: originalGame } = await this.getGame(gameId)
    if (!originalGame) {
      throw new Error('Original game not found')
    }

    if (originalGame.status !== GameStatus.COMPLETED) {
      throw new Error('Can only rematch completed games')
    }

    if (originalGame.hostId !== hostId) {
      throw new Error('Only the host can start a rematch')
    }

    // Generate new game data
    const pin = await this.pinService.generateUniquePin()
    const newGameRef = this.gamesRef.push()
    const newGameId = newGameRef.key!

    // Create fresh deck
    const deck = this.deckService.createInitialDeck()

    // Set up players with new influence cards
    const players = []
    let remainingDeck = deck

    for (const originalPlayer of originalGame.players || []) {
      const [influence, updatedDeck] = this.deckService.dealCards(remainingDeck, 2)
      remainingDeck = updatedDeck
      players.push({
        id: originalPlayer.id,
        username: originalPlayer.username,
        influence,
        coins: 2
      })
    }

    const newGame: Game = {
      id: newGameId,
      pin,
      hostId,
      status: GameStatus.WAITING,
      players,
      currentTurn: null,
      deck: remainingDeck,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentPlayerIndex: 0,
      eliminationOrder: []
    }

    // Save the new game and update player references
    await Promise.all([
      this.removeGame(originalGame.id),
      newGameRef.set(newGame),
      this.pinService.saveGameIdByPin(pin, newGameId),
      ...players.map(player => this.playerService.updatePlayer(player.id, { currentGameId: newGameId }))
    ])

    return { newGameId, pin }
  }

  private async removeGame(gameId: string) {
    await this.gamesRef.child(gameId).remove()
    await this.botsRef.child(gameId).remove()
  }
}
