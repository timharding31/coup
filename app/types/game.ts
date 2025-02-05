import { Card, CardType } from './card'
import { Player } from './player'
import { Action, TurnState } from './turn'

export const GameStatus = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
} as const
export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus]

export interface Game<Context extends 'server' | 'client' = 'server'> {
  id: string
  pin: string
  status: GameStatus
  hostId: string
  players: Player<Context>[]
  deck: Card<Context>[]
  currentPlayerIndex: number // Index of current player
  currentTurn?: TurnState
  winnerId?: string
  createdAt: number // Unix timestamp
  updatedAt: number // Unix timestamp
  completedAt?: number
}
