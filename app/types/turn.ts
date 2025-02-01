import { CardType } from './card'

export const TurnPhase = {
  ACTION_DECLARED: 'ACTION_DECLARED',
  CHALLENGE_BLOCK_WINDOW: 'CHALLENGE_BLOCK_WINDOW',
  CHALLENGE_RESOLUTION: 'CHALLENGE_RESOLUTION',
  BLOCK_DECLARED: 'BLOCK_DECLARED',
  BLOCK_CHALLENGE_WINDOW: 'BLOCK_CHALLENGE_WINDOW',
  BLOCK_CHALLENGE_RESOLUTION: 'BLOCK_CHALLENGE_RESOLUTION',
  ACTION_RESOLUTION: 'ACTION_RESOLUTION',
  ACTION_FAILED: 'ACTION_FAILED',
  LOSE_INFLUENCE: 'LOSE_INFLUENCE'
} as const
export type TurnPhase = (typeof TurnPhase)[keyof typeof TurnPhase]

export interface TurnState {
  phase: TurnPhase
  action: Action
  timeoutAt: number // Unix timestamp for timeout
  respondedPlayers: string[] // Players who have explicitly responded
  resolvedChallenges: Record<string, boolean>
  challengingPlayer?: string
  blockingPlayer?: string
  blockingCard?: CardType
}

export const ActionType = {
  INCOME: 'INCOME',
  FOREIGN_AID: 'FOREIGN_AID',
  COUP: 'COUP',
  TAX: 'TAX', // Duke
  STEAL: 'STEAL', // Captain
  ASSASSINATE: 'ASSASSINATE',
  EXCHANGE: 'EXCHANGE' // Ambassador
} as const
export type ActionType = (typeof ActionType)[keyof typeof ActionType]

export interface Action {
  type: ActionType
  playerId: string
  targetPlayerId?: string
  requiredCharacter?: CardType // Character needed for the action
  canBeBlocked: boolean // Can this action be blocked?
  blockableBy: CardType[] // Which characters can block this?
  canBeChallenged: boolean // Can this action be challenged?
  autoResolve: boolean // Should this resolve immediately?
  coinCost: number // Cost in coins to perform
}
