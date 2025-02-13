export const CardType = {
  DUKE: 'DUKE',
  ASSASSIN: 'ASSASSIN',
  CONTESSA: 'CONTESSA',
  CAPTAIN: 'CAPTAIN',
  AMBASSADOR: 'AMBASSADOR'
} as const
export type CardType = (typeof CardType)[keyof typeof CardType]

export interface Card<Context extends 'server' | 'client' = 'server'> {
  id: string
  type: Context extends 'server' ? CardType : CardType | null
  isRevealed?: boolean
  isChallengeDefenseCard?: boolean
}
