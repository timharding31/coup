import { Server as HTTPServer } from 'http'
import { Server } from 'socket.io'

import type { IGameService } from './game.interface'
import type { Game, CoupSocket, CardType } from '~/types'

export class SocketService {
  private io: CoupSocket.Server
  private gameService: IGameService

  constructor(httpServer: HTTPServer, gameService: IGameService) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.SOCKET_URL,
        methods: ['GET', 'POST']
      }
    })

    this.gameService = gameService
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: CoupSocket.Socket) => {
      console.log('Client connected:', socket.id)

      socket.on('joinGameRoom', async ({ gameId, playerId }) => {
        socket.join(`game:${gameId}`)
        socket.data.gameId = gameId
        socket.data.playerId = playerId

        socket.to(`game:${gameId}`).emit('playerJoined', { playerId })

        const { game } = await this.gameService.getGame(gameId)
        if (game) {
          socket.emit('gameStateChanged', { game })
        }
      })

      socket.on('leaveGameRoom', async ({ gameId, playerId }) => {
        await this.gameService.leaveGame(playerId, gameId)
        socket.leave(`game:${gameId}`)
        this.io.to(`game:${gameId}`).emit('playerLeft', { playerId })
      })

      socket.on('startGame', async ({ gameId, playerId }) => {
        try {
          const { game } = await this.gameService.startGame(gameId, playerId)
          if (game) {
            this.io.to(`game:${gameId}`).emit('gameStateChanged', { game })
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to start game' })
        }
      })

      socket.on('gameAction', async ({ gameId, playerId, action }) => {
        try {
          const { success, turnState } = await this.gameService.startGameTurn(gameId, { ...action, playerId })

          if (success) {
            const { game } = await this.gameService.getGame(gameId)
            if (game) {
              this.io.to(`game:${gameId}`).emit('gameStateChanged', { game })
            }

            // Start response timer if the action isn't auto-resolved
            if (!action.autoResolve) {
              this.startResponseTimer(gameId)
            }
          }
        } catch (error) {
          socket.emit('error', { message: 'Invalid action' })
        }
      })

      socket.on('playerResponse', async ({ gameId, playerId, response, blockingCard }) => {
        try {
          const { success, newTurnState } = await this.gameService.handlePlayerResponse(
            gameId,
            playerId,
            response,
            blockingCard
          )

          if (success) {
            const { game } = await this.gameService.getGame(gameId)
            if (game) {
              this.io.to(`game:${gameId}`).emit('gameStateChanged', { game })
            }
          }
        } catch (error) {
          socket.emit('error', { message: 'Invalid response' })
        }
      })

      socket.on('selectCard', async ({ gameId, playerId, cardType }) => {
        try {
          const { success } = await this.gameService.handleCardSelection(gameId, playerId, cardType)

          if (success) {
            const { game } = await this.gameService.getGame(gameId)
            if (game) {
              this.io.to(`game:${gameId}`).emit('gameStateChanged', { game })
            }
          }
        } catch (error) {
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

  private async startResponseTimer(gameId: string) {
    setTimeout(async () => {
      const { turn } = await this.gameService.getCurrentTurn(gameId)
      const { game } = await this.gameService.getGame(gameId)

      if (game && turn?.timeoutAt && turn.timeoutAt <= Date.now()) {
        // Auto-accept for all players who haven't responded
        const responses = turn.respondedPlayers || []
        const remaining = game.players.filter(p => !responses.includes(p.id) && p.id !== turn.action.playerId)

        // Process automatic accepts
        await Promise.all(remaining.map(p => this.gameService.handlePlayerResponse(gameId, p.id, 'accept')))

        const updatedGame = await this.gameService.getGame(gameId)
        if (updatedGame.game) {
          this.io.to(`game:${gameId}`).emit('gameStateChanged', { game: updatedGame.game })
        }
      }
    }, 20000) // 20 second timer
  }

  public emitGameUpdate(gameId: string, game: Game) {
    this.io.to(`game:${gameId}`).emit('gameStateChanged', { game })
  }
}
