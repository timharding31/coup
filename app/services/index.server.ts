import { createServer } from 'http'
import express from 'express'
import { GameService } from './game.server'
import { SocketService } from './socket.server'
import { PlayerService } from './player.server'
import { SessionService } from './session.server'

export const app = express()
export const httpServer = createServer(app)
export const playerService = new PlayerService()
export const gameService = new GameService(playerService)
export const sessionService = new SessionService()
export const socketService = new SocketService(httpServer, gameService)
