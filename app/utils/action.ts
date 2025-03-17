import {
  ActionType,
  Action,
  CardType,
  Game,
  TurnState,
  UntargetedAction,
  TargetedAction,
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

export type ActionVerbValue = { content: string; target?: string }

export function getActionVerb(
  playerId: string,
  action: Action,
  tense: ActionVerbTense,
  target: Player<'server' | 'client'> | null = null
): ActionVerbValue {
  if (action.type in UNTARGETED_ACTION_VERBS) {
    return UNTARGETED_ACTION_VERBS[action.type as UntargetedActionType][tense]
  } else if (!target) {
    throw new Error('Target is required for targeted actions')
  }
  return TARGETED_ACTION_VERBS[action.type as TargetedActionType][tense].call(
    null,
    target.id === playerId ? 'YOU' : target.username
  )
}

const TARGETED_ACTION_VERBS: Record<
  TargetedActionType,
  Record<ActionVerbTense, (target: string) => ActionVerbValue>
> = {
  STEAL: {
    present: target => ({ content: 'STEALS from', target }),
    past: target => ({ content: 'STOLE from', target }),
    infinitive: target => ({ content: 'STEAL from', target })
  },
  ASSASSINATE: {
    present: target => ({ content: 'ASSASSINATES', target }),
    past: target => ({ content: 'ASSASSINATED', target }),
    infinitive: target => ({ content: 'ASSASSINATE', target })
  },
  COUP: {
    present: target => ({ content: 'COUPS', target }),
    past: target => ({ content: 'COUPED', target }),
    infinitive: target => ({ content: 'COUP', target })
  }
}

const UNTARGETED_ACTION_VERBS: Record<UntargetedActionType, Record<ActionVerbTense, ActionVerbValue>> = {
  INCOME: {
    present: { content: 'takes INCOME' },
    past: { content: 'took INCOME' },
    infinitive: { content: 'INCOME' }
  },
  FOREIGN_AID: {
    present: { content: 'takes FOREIGN AID' },
    past: { content: 'took FOREIGN AID' },
    infinitive: { content: 'FOREIGN AID' }
  },
  TAX: {
    present: { content: 'claims DUKE (tax)' },
    past: { content: 'claimed DUKE (tax)' },
    infinitive: { content: 'TAX' }
  },
  EXCHANGE: {
    present: { content: 'claims AMBASSADOR' },
    past: { content: 'claimed AMBASSADOR' },
    infinitive: { content: 'EXCHANGE' }
  }
}

export interface ActionRequirements extends Omit<Action, 'playerId' | 'type'> {}

export const ACTION_REQUIREMENTS: Record<ActionType, ActionRequirements> = {
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
  EXCHANGE: {
    coinCost: 0,
    requiredCharacter: CardType.AMBASSADOR,
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
