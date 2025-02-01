import type { GameService } from '~/services/game.server'
import type { SocketService } from '~/services/socket.server'
import type { PlayerService } from '~/services/player.server'
import type { SessionService } from '~/services/session.server'
import { AppLoadContext } from '@remix-run/node'

export interface AppContext extends AppLoadContext {
  gameService: GameService
  socketService: SocketService
  playerService: PlayerService
  sessionService: SessionService
}
