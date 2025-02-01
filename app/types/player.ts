import { Card } from './card'

export interface Player {
  id: string
  username: string
  influence: Card[]
  coins: number
  currentGameId?: string | null // Reference to current game
}
