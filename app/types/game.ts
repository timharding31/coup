import { Card } from './card'
import { Player } from './player'
import { Action } from './turn'

export const GameStatus = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
} as const
export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus]

export interface Game {
  id: string
  status: GameStatus
  players: Player[]
  deck: Card[]
  currentTurn: number // Index of current player
  currentAction?: Action
  winner?: string
  createdAt: number // Unix timestamp
  updatedAt: number // Unix timestamp
}
