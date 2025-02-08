import { CardType } from './card'
import { Game } from './game'

export const TurnPhase = {
  WAITING_FOR_ACTION: 'WAITING_FOR_ACTION',
  ACTION_DECLARED: 'ACTION_DECLARED',
  WAITING_FOR_REACTIONS: 'WAITING_FOR_REACTIONS',
  BLOCK_DECLARED: 'BLOCK_DECLARED',
  WAITING_FOR_BLOCK_RESPONSE: 'WAITING_FOR_BLOCK_RESPONSE',
  WAITING_FOR_DEFENSE_REVEAL: 'WAITING_FOR_DEFENSE_REVEAL',
  WAITING_FOR_CHALLENGE_PENALTY: 'WAITING_FOR_CHALLENGE_PENALTY',
  WAITING_FOR_TARGET_REVEAL: 'WAITING_FOR_TARGET_REVEAL',
  WAITING_FOR_EXCHANGE_RETURN: 'WAITING_FOR_EXCHANGE_RETURN',
  ACTION_RESOLVING: 'ACTION_RESOLVING',
  ACTION_FAILED: 'ACTION_FAILED',
  TURN_COMPLETE: 'TURN_COMPLETE'
} as const

export type TurnPhase = (typeof TurnPhase)[keyof typeof TurnPhase]

// Helper type to identify phases requiring user input
export type WaitingPhase = Extract<
  TurnPhase,
  | 'WAITING_FOR_ACTION'
  | 'WAITING_FOR_REACTIONS'
  | 'WAITING_FOR_BLOCK_RESPONSE'
  | 'WAITING_FOR_DEFENSE_REVEAL'
  | 'WAITING_FOR_CHALLENGE_PENALTY'
  | 'WAITING_FOR_TARGET_REVEAL'
>

export interface TurnChallengeResult {
  challengingPlayer: string
  successful: boolean | null
  defendingCardId: string | null // Used when challenge is unsuccessful
  lostCardId: string | null // Used when challenge is successful
}

export interface TurnState {
  phase: TurnPhase
  action: Action
  timeoutAt: number // Unix timestamp for timeout
  respondedPlayers?: string[] // Players who have explicitly responded
  challengeResult: TurnChallengeResult | null
  blockingPlayer: string | null
  lostInfluenceCardId: string | null
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

interface BaseAction {
  playerId: string
  requiredCharacter?: CardType
  canBeBlocked: boolean
  blockableBy: CardType[]
  canBeChallenged: boolean
  coinCost: number
}

export type TargetedActionType = Extract<ActionType, 'STEAL' | 'ASSASSINATE' | 'COUP'>

export interface TargetedAction extends BaseAction {
  type: Extract<ActionType, 'STEAL' | 'ASSASSINATE' | 'COUP'>
  targetPlayerId: string
  autoResolve: false
}

export type UntargetedActionType = Extract<ActionType, 'INCOME' | 'FOREIGN_AID' | 'TAX' | 'EXCHANGE'>
export interface UntargetedAction extends BaseAction {
  type: Extract<ActionType, 'INCOME' | 'FOREIGN_AID' | 'TAX' | 'EXCHANGE'>
  targetPlayerId?: never
  autoResolve: boolean
}

export type Action = TargetedAction | UntargetedAction

export interface StateTransition {
  from: TurnPhase
  to: TurnPhase
  condition?: (turn: TurnState, game: Game) => boolean
  onTransition?: (turn: TurnState, game: Game) => Promise<void>
}
