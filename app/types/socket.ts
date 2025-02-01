import { Server as SocketServer, Socket as ServerSocket } from 'socket.io'
import { Socket as ClientSocket } from 'socket.io-client'
import { Game } from './game'
import { Action } from './turn'
import { CardType } from './card'

export type GameSocketData<T = {}> = T & {
  gameId: string
  playerId: string
}

export interface ErrorResponse {
  message: string
}

// Server -> Client Events
export interface ServerToClientEvents {
  gameStateChanged: (data: { game: Game }) => void
  gameEnded: () => void
  playerJoined: (data: { playerId: string }) => void
  playerLeft: (data: { playerId: string }) => void
  playerDisconnected: (data: { playerId: string }) => void
  error: (error: ErrorResponse) => void
}

// Client -> Server Events
export interface ClientToServerEvents {
  joinGameRoom: (data: GameSocketData) => void
  leaveGameRoom: (data: GameSocketData) => void
  startGame: (data: GameSocketData) => void
  gameAction: (data: GameSocketData<{ action: Action }>) => void
  playerResponse: (
    data: GameSocketData<{ response: 'accept' | 'challenge' | 'block'; blockingCard?: CardType }>
  ) => void
  selectCard: (data: GameSocketData<{ cardType: CardType }>) => void
}

export namespace CoupSocket {
  export type Server = SocketServer<ClientToServerEvents, ServerToClientEvents>
  export type Socket = ServerSocket<ClientToServerEvents, ServerToClientEvents>
  export type Client = ClientSocket<ServerToClientEvents, ClientToServerEvents>
}
