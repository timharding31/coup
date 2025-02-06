import { GameService } from './game.server'
import { SocketService } from './socket.server'
import { PlayerService } from './player.server'
import { SessionService } from './session.server'

export const playerService = new PlayerService()
export const gameService = new GameService(playerService)
export const sessionService = new SessionService()
export const socketService = new SocketService(gameService)
