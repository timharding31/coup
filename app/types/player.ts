import { Card, CardType } from './card'

export interface Player<Context extends 'server' | 'client' = 'server'> {
  id: string
  username: string
  influence: Card<Context>[]
  coins: number
  currentGameId?: string | null // Reference to current game
}
