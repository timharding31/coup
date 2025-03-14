/**
 * Types for Coup game state to be used in Firebase functions
 * Based on the app's type definitions
 */

export enum GameStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export type CardType = 'DUKE' | 'ASSASSIN' | 'CAPTAIN' | 'AMBASSADOR' | 'CONTESSA'

export interface Card {
  id: string
  type: CardType
  isRevealed: boolean
  isChallengeDefenseCard?: boolean
}

export interface Player {
  id: string
  username: string
  influence: Card[]
  coins: number
}

export type ActionType =
  | 'INCOME'
  | 'FOREIGN_AID'
  | 'COUP'
  | 'TAX'
  | 'ASSASSINATE'
  | 'STEAL'
  | 'EXCHANGE'

export interface Action {
  playerId: string
  type: ActionType
  targetPlayerId?: string
  coinCost?: number
  requiredCharacter?: CardType
  canBeBlocked: boolean
  canBeChallenged: boolean
}

export interface ChallengeResult {
  challengerId: string
  defenseSuccessful: boolean | null
  defendingCardId: string | null
  lostCardId: string | null
  challengedCaracter: CardType
}

export interface OpponentResponses {
  block?: string
  challenge?: string
  claimedCard?: CardType
}

export type TurnPhase =
  | 'AWAITING_OPPONENT_RESPONSES'
  | 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK'
  | 'AWAITING_TARGET_BLOCK_RESPONSE'
  | 'AWAITING_ACTOR_DEFENSE'
  | 'AWAITING_BLOCKER_DEFENSE'
  | 'REPLACING_CHALLENGE_DEFENSE_CARD'
  | 'AWAITING_CHALLENGE_PENALTY_SELECTION'
  | 'ACTION_EXECUTION'
  | 'AWAITING_TARGET_SELECTION'
  | 'AWAITING_EXCHANGE_RETURN'
  | 'ACTION_FAILED'
  | 'TURN_COMPLETE'

export interface TurnState {
  phase: TurnPhase
  action: Action
  timeoutAt: number
  respondedPlayers: string[]
  opponentResponses: OpponentResponses | null
  challengeResult: ChallengeResult | null
  targetSelection: { lostCardId: string } | null
  exchange: { returnCards: string[] } | null
}

export interface Game {
  id: string
  pin: string
  hostId: string
  status: GameStatus
  players: Player[]
  currentTurn: TurnState | null
  currentPlayerIndex: number
  deck: Card[]
  createdAt: number
  updatedAt: number
  eliminationOrder: string[]
  botActionInProgress?: boolean
  winnerId?: string | null
  completedAt?: number
}

/**
 * Helper function to check if all players have responded
 */
export function haveAllPlayersResponded(game: Game, turn: TurnState): boolean {
  if (!turn.respondedPlayers) return false;
  
  // Count eligible responders (players who aren't eliminated and aren't the actor)
  const eligibleResponders = game.players.filter(p => {
    // Skip the actor
    if (p.id === turn.action.playerId) return false;
    // Skip eliminated players
    if (p.influence.every(c => c.isRevealed)) return false;
    return true;
  });
  
  // Check if all eligible responders have responded
  return turn.respondedPlayers.length >= eligibleResponders.length;
}

/**
 * Helper function to check if a phase should have timeouts
 */
export function isWaitingPhase(phase: TurnPhase): boolean {
  return [
    'AWAITING_OPPONENT_RESPONSES',
    'AWAITING_ACTIVE_RESPONSE_TO_BLOCK',
    'AWAITING_TARGET_BLOCK_RESPONSE'
  ].includes(phase);
}