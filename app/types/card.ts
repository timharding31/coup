export const CardType = {
  DUKE: 'DUKE',
  ASSASSIN: 'ASSASSIN',
  CONTESSA: 'CONTESSA',
  CAPTAIN: 'CAPTAIN',
  AMBASSADOR: 'AMBASSADOR'
} as const
export type CardType = (typeof CardType)[keyof typeof CardType]

export interface Card {
  id: string
  type: CardType
  isRevealed?: boolean
}
