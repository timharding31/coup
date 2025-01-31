import { Card } from './card'

export interface Player {
  id: string
  username: string
  influence: Card[]
  coins: number
  isActive: boolean // In game or eliminated
  currentGame?: string // Reference to current game
}
