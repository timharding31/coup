import { Card } from './card'
import { Player } from './player'
import { Action, TurnState } from './turn'

export const GameStatus = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
} as const
export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus]

export interface Game {
  id: string
  pin: string
  status: GameStatus
  hostId: string
  players: Player[]
  deck: Card[]
  currentPlayerIndex: number // Index of current player
  currentTurn?: TurnState
  winner?: string
  createdAt: number // Unix timestamp
  updatedAt: number // Unix timestamp
}
