import { GameService } from './game.server'
import { PlayerService } from './player.server'
import { SessionService } from './session.server'

export const playerService = new PlayerService()
export const gameService = new GameService(playerService)
export const sessionService = new SessionService()
