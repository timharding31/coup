import { Card, CardType } from './card'
import { NordColor } from './style'

export interface Player<Context extends 'server' | 'client' = 'server'> {
  id: string
  username: string
  influence: Card<Context>[]
  coins: number
  currentGameId?: string | null // Reference to current game
}

export interface PlayerMessage {
  message: React.ReactNode
  type: 'info' | 'challenge' | 'block' | 'success' | 'failure'
}
