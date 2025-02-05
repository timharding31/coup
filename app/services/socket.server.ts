import { Server } from 'socket.io'
import { Server as HTTPServer } from 'http'
import type { DataSnapshot, Reference } from 'firebase-admin/database'
import { db } from './firebase.server'
import type { Game, CoupSocket, TurnState, GameStatus, Card, CardType, Player } from '~/types'
import type { IGameService } from './game.server'

export class SocketService {
  private io: CoupSocket.Server
  private gameService: IGameService
  private gamesRef: Reference
  private turnWatchers = new Map<string, () => void>()

  constructor(httpServer: HTTPServer, gameService: IGameService) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.SOCKET_URL,
        methods: ['GET', 'POST']
      }
    })

    this.gameService = gameService
    this.gamesRef = db.ref('games') // Add Firebase reference
    this.setupEventHandlers()
  }

  private setupTurnWatcher(gameId: string) {
    // Clean up existing listener if one exists
    this.cleanupTurnWatcher(gameId)

    // Create new listener
    const turnRef = this.gamesRef.child(`${gameId}/currentTurn`)
    const onCurrentTurnSnapshot = (snapshot: DataSnapshot) => {
      const turn = snapshot.val() as TurnState | null
      if (turn) {
        this.io.to(`game:${gameId}`).emit('turnStateChanged', { turn })
      }
    }
    turnRef.on('value', onCurrentTurnSnapshot)
    this.turnWatchers.set(gameId, () => turnRef.off('value', onCurrentTurnSnapshot))
  }

  private cleanupTurnWatcher(gameId: string) {
    const cleanup = this.turnWatchers.get(gameId)
    if (cleanup) {
      cleanup()
      this.turnWatchers.delete(gameId)
    }
  }

  private setupEventHandlers() {
    this.gameService.setOnGameEnded(async gameId => {
      console.log('Game ended')
    })

    this.gameService.setOnTurnEnded(async gameId => {
      const { game } = await this.gameService.getGame(gameId)
      if (game) {
        game.players.forEach(player => {
          const playerGameState = prepareGameForClient(game, player.id)
          this.io.to(`player:${player.id}`).emit('gameStateChanged', { game: playerGameState })
        })
      }
    })

    this.io.on('connection', (socket: CoupSocket.Socket) => {
      console.log('Client connected:', socket.id)

      if (socket.handshake.auth.playerId) {
        const { playerId } = socket.handshake.auth
        this.gameService.getGameByPlayerId(playerId).then(({ game }) => {
          if (game) {
            socket.data.gameId = game.id
            socket.data.playerId = playerId
            socket.join(`game:${game.id}`)
            socket.join(`player:${playerId}`)
            this.setupTurnWatcher(game.id) // Setup watcher on reconnect
            socket.emit('reconnectSuccess', { game: prepareGameForClient(game, playerId) })
          }
        })
      }

      socket.on('joinGameRoom', async ({ gameId, playerId }) => {
        socket.join(`game:${gameId}`)
        socket.join(`player:${playerId}`)
        socket.data.gameId = gameId
        socket.data.playerId = playerId
        this.setupTurnWatcher(gameId) // Setup watcher when joining

        socket.to(`game:${gameId}`).emit('playerJoined', { playerId })

        const { game } = await this.gameService.getGame(gameId)
        if (game) {
          game.players.forEach(player => {
            socket.to(`player:${player.id}`).emit('gameStateChanged', { game: prepareGameForClient(game, player.id) })
          })
        }
      })

      socket.on('leaveGameRoom', async ({ gameId, playerId }) => {
        await this.gameService.leaveGame(playerId, gameId)
        socket.leave(`game:${gameId}`)
        this.cleanupTurnWatcher(gameId) // Cleanup watcher when leaving
        this.io.to(`game:${gameId}`).emit('playerLeft', { playerId })
      })

      socket.on('startGame', async ({ gameId, playerId }) => {
        try {
          const { game } = await this.gameService.startGame(gameId, playerId)
          if (game) {
            game.players.forEach(player => {
              this.io.to(`player:${player.id}`).emit('gameStateChanged', {
                game: prepareGameForClient(game, player.id)
              })
            })
          }
        } catch (error) {
          console.error(error)
          socket.emit('error', { message: 'Failed to start game' })
        }
      })

      socket.on('gameAction', async ({ gameId, playerId, action }) => {
        try {
          await this.gameService.startGameTurn(gameId, { ...action, playerId })
          // Turn changes will be handled by watcher
        } catch (error) {
          console.error(error)
          socket.emit('error', { message: 'Invalid action' })
        }
      })

      socket.on('playerResponse', async ({ gameId, playerId, response }) => {
        try {
          const { game } = await this.gameService.getGame(gameId)

          switch (game?.currentTurn?.phase) {
            case 'WAITING_FOR_REACTIONS':
              await this.gameService.handleActionResponse(gameId, playerId, response)
              break
            case 'WAITING_FOR_BLOCK_RESPONSE':
              if (response === 'block') {
                throw new Error('Invalid response to block')
              }
              await this.gameService.handleBlockResponse(gameId, playerId, response)
              break
          }
          // Turn changes will be handled by watcher
        } catch (error) {
          console.error(error)
          socket.emit('error', { message: 'Invalid response' })
        }
      })

      socket.on('selectCard', async ({ gameId, playerId, cardId }) => {
        try {
          await this.gameService.handleCardSelection(gameId, playerId, cardId)
          // Turn changes will be handled by watcher
        } catch (error) {
          console.error(error)
          socket.emit('error', { message: 'Invalid card selection' })
        }
      })

      socket.on('disconnect', async () => {
        const { gameId, playerId } = socket.data
        if (gameId && playerId) {
          this.io.to(`game:${gameId}`).emit('playerDisconnected', { playerId })
        }
      })
    })
  }
}

export function prepareGameForClient(game: Game<'server' | 'client'>, playerId: string): Game<'client'> {
  const currentPlayer = game.players.find(p => p.id === playerId)
  if (!currentPlayer) {
    throw new Error('Player not found')
  }
  return {
    ...game,
    deck: game.deck.map(card => prepareCardForClient(currentPlayer, card)),
    players: game.players.map(p => ({ ...p, influence: p.influence.map(c => prepareCardForClient(currentPlayer, c)) }))
  }
}

// The card's `type` should only be sent over the network if it's revealed or belongs to the player
function prepareCardForClient(player: Player, card: Card<'server' | 'client'>): Card<'client'> {
  if (card.isRevealed) {
    return card
  }
  const playerCardIds = new Set(player.influence.map(c => c.id))
  if (playerCardIds.has(card.id)) {
    return card
  }
  return { ...card, type: null }
}
