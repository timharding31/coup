import {
  ActionType,
  Action,
  CardType,
  Game,
  TurnState,
  StateTransition,
  UntargetedAction,
  TargetedAction,
  TurnPhase,
  WaitingPhase,
  UntargetedActionType,
  TargetedActionType,
  Player
} from '~/types'

export function getActionFromType(
  playerId: string,
  type: Extract<ActionType, 'INCOME' | 'FOREIGN_AID' | 'TAX' | 'EXCHANGE'>,
  targetPlayerId?: never
): UntargetedAction
export function getActionFromType(
  playerId: string,
  type: Extract<ActionType, 'STEAL' | 'ASSASSINATE' | 'COUP'>,
  targetPlayerId: string
): TargetedAction
export function getActionFromType(playerId: string, type: ActionType, targetPlayerId?: string): Action {
  switch (type) {
    case 'INCOME':
    case 'FOREIGN_AID':
    case 'TAX':
    case 'EXCHANGE':
      return { playerId, type, ...ACTION_REQUIREMENTS[type] } as UntargetedAction

    case 'STEAL':
    case 'ASSASSINATE':
    case 'COUP':
      return { playerId, type, targetPlayerId, ...ACTION_REQUIREMENTS[type] } as TargetedAction
  }
}

export function getActionObject(action: Action): string {
  switch (action.type) {
    case 'ASSASSINATE':
      return 'ASSASSINATION'

    case 'INCOME':
      return 'INCOME'

    case 'FOREIGN_AID':
      return 'FOREIGN AID'

    case 'COUP':
      return 'COUP'

    case 'EXCHANGE':
      return 'EXCHANGE'

    case 'STEAL':
      return 'STEAL'

    case 'TAX':
      return 'TAX'
  }
}

export type ActionVerbTense = 'present' | 'past' | 'infinitive'

export function getActionVerb(
  playerId: string,
  action: Action,
  tense: ActionVerbTense,
  target: Player<'server' | 'client'> | null = null
): string {
  if (action.type in UNTARGETED_ACTION_VERBS) {
    return UNTARGETED_ACTION_VERBS[action.type as UntargetedActionType][tense]
  } else if (!target) {
    throw new Error('Target is required for targeted actions')
  }
  return TARGETED_ACTION_VERBS[action.type as TargetedActionType][tense].call(
    null,
    target.id === playerId ? 'you' : `@${target.username}`
  )
}

const TARGETED_ACTION_VERBS: Record<TargetedActionType, Record<ActionVerbTense, (targetUsername: string) => string>> = {
  STEAL: {
    present: targetUsername => `STEALS from ${targetUsername}`,
    past: targetUsername => `STOLE from ${targetUsername}`,
    infinitive: targetUsername => `STEAL from ${targetUsername}`
  },
  ASSASSINATE: {
    present: targetUsername => `ASSASSINATES ${targetUsername}`,
    past: targetUsername => `ASSASSINATED ${targetUsername}`,
    infinitive: targetUsername => `ASSASSINATE ${targetUsername}`
  },
  COUP: {
    present: targetUsername => `COUPS ${targetUsername}`,
    past: targetUsername => `COUPED ${targetUsername}`,
    infinitive: targetUsername => `COUP ${targetUsername}`
  }
}

const UNTARGETED_ACTION_VERBS: Record<UntargetedActionType, Record<ActionVerbTense, string>> = {
  INCOME: {
    present: 'takes INCOME',
    past: 'took INCOME',
    infinitive: 'INCOME'
  },
  FOREIGN_AID: {
    present: 'takes FOREIGN AID',
    past: 'took FOREIGN AID',
    infinitive: 'FOREIGN AID'
  },
  TAX: {
    present: 'claims DUKE (tax)',
    past: 'claimed DUKE (tax)',
    infinitive: 'TAX'
  },
  EXCHANGE: {
    present: 'claims AMBASSADOR',
    past: 'claimed AMBASSADOR',
    infinitive: 'EXCHANGE'
  }
}

export const ACTION_REQUIREMENTS: Record<ActionType, Omit<Action, 'playerId' | 'type'>> = {
  INCOME: {
    coinCost: 0,
    canBeBlocked: false,
    canBeChallenged: false,
    blockableBy: []
  },
  FOREIGN_AID: {
    coinCost: 0,
    canBeBlocked: true,
    canBeChallenged: false,
    blockableBy: [CardType.DUKE]
  },
  TAX: {
    coinCost: 0,
    requiredCharacter: CardType.DUKE,
    canBeBlocked: false,
    canBeChallenged: true,
    blockableBy: []
  },
  STEAL: {
    coinCost: 0,
    requiredCharacter: CardType.CAPTAIN,
    canBeBlocked: true,
    canBeChallenged: true,
    blockableBy: [CardType.AMBASSADOR, CardType.CAPTAIN]
  },
  ASSASSINATE: {
    coinCost: 3,
    requiredCharacter: CardType.ASSASSIN,
    canBeBlocked: true,
    canBeChallenged: true,
    blockableBy: [CardType.CONTESSA]
  },
  COUP: {
    coinCost: 7,
    canBeBlocked: false,
    canBeChallenged: false,
    blockableBy: []
  },
  EXCHANGE: {
    coinCost: 0,
    requiredCharacter: CardType.AMBASSADOR,
    canBeBlocked: false,
    canBeChallenged: true,
    blockableBy: []
  }
}

export function isValidAction(game: Game, action: Action): boolean {
  const requirements = ACTION_REQUIREMENTS[action.type]
  if (!requirements) return false

  // Check if player has enough coins
  const player = game.players.find(p => p.id === action.playerId)
  if (!player) return false

  if (player.coins < requirements.coinCost) return false

  // Force coup at 10+ coins
  if (player.coins >= 10 && action.type !== 'COUP') return false

  // Check if target is valid for actions that need one
  if (action.targetPlayerId) {
    const targetPlayer = game.players.find(p => p.id === action.targetPlayerId)
    if (!targetPlayer) return false

    // Can't target eliminated players
    if (!targetPlayer.influence.some(card => !card.isRevealed)) return false
  }

  return true
}

function getAllRespondingPlayers(game: Game, turn: TurnState): string[] {
  return game.players
    .filter(p => !p.influence.every(card => card.isRevealed)) // Filter out dead players
    .filter(p => p.id !== turn.action.playerId) // Filter out active player
    .map(p => p.id)
}

export function haveAllPlayersResponded(game: Game, turn: TurnState): boolean {
  const requiredResponses = getAllRespondingPlayers(game, turn)
  return requiredResponses.every(id => turn.respondedPlayers?.includes(id))
}

export const VALID_TRANSITIONS: StateTransition[] = [
  {
    from: 'ACTION_DECLARED',
    to: 'AWAITING_OPPONENT_RESPONSES',
    condition: () => true
  },
  {
    from: 'ACTION_DECLARED',
    to: 'ACTION_EXECUTION',
    condition: turn => !turn.action.canBeBlocked && !turn.action.canBeChallenged
  },
  {
    from: 'ACTION_EXECUTION',
    to: 'AWAITING_EXCHANGE_RETURN',
    condition: turn => turn.action.type === 'EXCHANGE'
  },
  {
    from: 'ACTION_EXECUTION',
    to: 'AWAITING_TARGET_SELECTION',
    condition: turn => ['ASSASSINATE', 'COUP'].includes(turn.action.type)
  },
  {
    from: 'ACTION_EXECUTION',
    to: 'TURN_COMPLETE',
    condition: turn => !['EXCHANGE', 'ASSASSINATE', 'COUP'].includes(turn.action.type)
  },
  {
    from: 'AWAITING_OPPONENT_RESPONSES',
    to: 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK',
    condition: turn => turn.action.canBeBlocked && !!turn.opponentResponses?.block
  },
  {
    from: 'AWAITING_OPPONENT_RESPONSES',
    to: 'AWAITING_ACTOR_DEFENSE',
    condition: turn => turn.action.canBeChallenged && !!turn.opponentResponses?.challenge
  },
  {
    from: 'AWAITING_OPPONENT_RESPONSES',
    to: 'ACTION_EXECUTION',
    condition: (turn, game) => haveAllPlayersResponded(game, turn)
  },
  {
    from: 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK',
    to: 'ACTION_FAILED',
    condition: () => true
  },
  {
    from: 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK',
    to: 'AWAITING_BLOCKER_DEFENSE',
    condition: turn => !!turn.challengeResult && turn.challengeResult.defenseSuccessful === null
  },
  {
    from: 'AWAITING_ACTOR_DEFENSE',
    to: 'AWAITING_CHALLENGE_PENALTY_SELECTION',
    condition: turn => turn.challengeResult?.defenseSuccessful === true
  },
  {
    from: 'AWAITING_ACTOR_DEFENSE',
    to: 'ACTION_FAILED',
    condition: turn => turn.challengeResult?.defenseSuccessful === false
  },
  {
    from: 'AWAITING_BLOCKER_DEFENSE',
    to: 'ACTION_EXECUTION',
    condition: turn => turn.challengeResult?.defenseSuccessful === false
  },
  {
    from: 'AWAITING_BLOCKER_DEFENSE',
    to: 'AWAITING_CHALLENGE_PENALTY_SELECTION',
    condition: turn => turn.challengeResult?.defenseSuccessful === true
  },
  {
    from: 'AWAITING_CHALLENGE_PENALTY_SELECTION',
    to: 'ACTION_EXECUTION',
    condition: turn => turn.challengeResult?.lostCardId != null
  },
  {
    from: 'AWAITING_CHALLENGE_PENALTY_SELECTION',
    to: 'ACTION_FAILED',
    condition: turn => turn.challengeResult?.lostCardId != null
  },
  {
    from: 'AWAITING_EXCHANGE_RETURN',
    to: 'TURN_COMPLETE',
    condition: turn => turn.action.type === 'EXCHANGE'
  },
  {
    from: 'AWAITING_CHALLENGE_PENALTY_SELECTION',
    to: 'TURN_COMPLETE',
    condition: turn => !!turn.targetSelection?.lostCardId
  },
  {
    from: 'ACTION_FAILED',
    to: 'TURN_COMPLETE',
    condition: () => true
  }
]

export const isWaitingPhase = (phase: TurnPhase): phase is WaitingPhase => {
  return phase.startsWith('AWAITING_')
}
