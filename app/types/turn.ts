import { CardType } from './card'
import { Game } from './game'

/**
 * Turn Phases:
 * - ACTION_DECLARED: The active player has submitted an action.
 * - AWAITING_OPPONENT_RESPONSES: Waiting for opponents to respond (block/challenge).
 * - AWAITING_ACTIVE_RESPONSE_TO_BLOCK: A block was declared and the active player must decide to accept or challenge.
 * - AWAITING_ACTOR_DEFENSE: The active player defends a direct challenge.
 * - AWAITING_BLOCKER_DEFENSE: A blocker defends against a challenge to their block.
 * - ACTION_EXECUTION: The action is being executed after successful defenses (or if no challenge/block occurs).
 * - AWAITING_TARGET_SELECTION: For targeted actions—waiting for the target to choose a card to lose.
 * - AWAITING_EXCHANGE_RETURN: For exchange actions—waiting for the active player to select which cards to return.
 * - ACTION_FAILED: The action failed (e.g. because a block was accepted).
 * - TURN_COMPLETE: Final state indicating end of turn.
 */
export const TurnPhase = {
  ACTION_DECLARED: 'ACTION_DECLARED',
  AWAITING_OPPONENT_RESPONSES: 'AWAITING_OPPONENT_RESPONSES',
  AWAITING_ACTIVE_RESPONSE_TO_BLOCK: 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK',
  AWAITING_ACTOR_DEFENSE: 'AWAITING_ACTOR_DEFENSE',
  AWAITING_BLOCKER_DEFENSE: 'AWAITING_BLOCKER_DEFENSE',
  AWAITING_CHALLENGE_PENALTY_SELECTION: 'AWAITING_CHALLENGE_PENALTY_SELECTION',
  ACTION_EXECUTION: 'ACTION_EXECUTION',
  AWAITING_TARGET_SELECTION: 'AWAITING_TARGET_SELECTION',
  AWAITING_EXCHANGE_RETURN: 'AWAITING_EXCHANGE_RETURN',
  ACTION_FAILED: 'ACTION_FAILED',
  TURN_COMPLETE: 'TURN_COMPLETE'
} as const

export type TurnPhase = (typeof TurnPhase)[keyof typeof TurnPhase]

// Helper type for phases that require user input.
export type WaitingPhase = Extract<
  TurnPhase,
  | 'AWAITING_OPPONENT_RESPONSES'
  | 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK'
  | 'AWAITING_ACTOR_DEFENSE'
  | 'AWAITING_BLOCKER_DEFENSE'
  | 'AWAITING_CHALLENGE_PENALTY_SELECTION'
  | 'AWAITING_TARGET_SELECTION'
  | 'AWAITING_EXCHANGE_RETURN'
>

export interface OpponentChallengeResponse {
  block?: never
  challenge: string
}

export interface OpponentBlockResponse {
  block: string
  challenge?: never
}

// Represents the result of a challenge defense.
export interface TurnChallengeResult {
  challengerId: string
  defenseSuccessful: boolean | null
  defendingCardId: string | null // Card used for defense if successful, otherwise null.
  lostCardId: string | null
}

// Revised TurnState with improved structure:
export interface TurnState {
  phase: TurnPhase
  action: Action
  timeoutAt: number // timestamp for timeout.
  respondedPlayers?: string[] // IDs of players who have explicitly responded.

  // Opponent responses (e.g., a block or a direct challenge).
  opponentResponses: OpponentChallengeResponse | OpponentBlockResponse | null

  // For challenge defenses.
  challengeResult: TurnChallengeResult | null

  // For targeted actions: the target's chosen card to lose.
  targetSelection: { lostCardId: string } | null

  // For exchange actions: the set of card IDs the active player chooses to return.
  exchange: { returnCards: string[] } | null
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
  verb: {
    present: string
    past: string
  }
}

export type TargetedActionType = Extract<ActionType, 'STEAL' | 'ASSASSINATE' | 'COUP'>

export interface TargetedAction extends BaseAction {
  type: TargetedActionType
  targetPlayerId: string
  autoResolve: false
}

export type UntargetedActionType = Extract<ActionType, 'INCOME' | 'FOREIGN_AID' | 'TAX' | 'EXCHANGE'>

export interface UntargetedAction extends BaseAction {
  type: UntargetedActionType
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
