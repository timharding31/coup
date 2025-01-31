import { CardType } from './card'

export const TurnPhase = {
  PLAYER_ACTION: 'PLAYER_ACTION',
  OBSERVER_RESPONSE: 'OBSERVER_RESPONSE',
  BLOCK_RESPONSE: 'BLOCK_RESPONSE',
  CHALLENGE_RESOLUTION: 'CHALLENGE_RESOLUTION',
  ACTION_RESOLUTION: 'ACTION_RESOLUTION'
} as const
export type TurnPhase = (typeof TurnPhase)[keyof typeof TurnPhase]

export interface TurnState {
  phase: TurnPhase
  activePlayer: string
  action: Action
  blockingPlayer?: string
  challengingPlayer?: string
  timeoutAt: number // Unix timestamp for timeout
  respondedPlayers: string[] // Players who have explicitly responded
  resolvedChallenges: {
    blockChallenge?: boolean
    actionChallenge?: boolean
  }
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
  coinCost?: number // Cost in coins to perform
}
