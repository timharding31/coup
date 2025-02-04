import {
  ActionType,
  Action,
  CardType,
  Game,
  TurnState,
  StateTransition,
  UntargetedAction,
  TargetedAction
} from '~/types'

export function getActionFromType(
  playerId: string,
  type: Extract<ActionType, 'INCOME' | 'FOREIGN_AID' | 'TAX' | 'EXCHANGE'>,
  targetPlayerId: undefined
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

export const ACTION_REQUIREMENTS: Record<ActionType, Omit<Action, 'playerId' | 'type'>> = {
  INCOME: {
    coinCost: 0,
    canBeBlocked: false,
    canBeChallenged: false,
    autoResolve: true,
    blockableBy: []
  },
  FOREIGN_AID: {
    coinCost: 0,
    canBeBlocked: true,
    canBeChallenged: false,
    autoResolve: false,
    blockableBy: [CardType.DUKE]
  },
  TAX: {
    coinCost: 0,
    requiredCharacter: CardType.DUKE,
    canBeBlocked: false,
    canBeChallenged: true,
    autoResolve: false,
    blockableBy: []
  },
  STEAL: {
    coinCost: 0,
    requiredCharacter: CardType.CAPTAIN,
    canBeBlocked: true,
    canBeChallenged: true,
    autoResolve: false,
    blockableBy: [CardType.AMBASSADOR, CardType.CAPTAIN]
  },
  ASSASSINATE: {
    coinCost: 3,
    requiredCharacter: CardType.ASSASSIN,
    canBeBlocked: true,
    canBeChallenged: true,
    autoResolve: false,
    blockableBy: [CardType.CONTESSA]
  },
  COUP: {
    coinCost: 7,
    canBeBlocked: false,
    canBeChallenged: false,
    autoResolve: true,
    blockableBy: []
  },
  EXCHANGE: {
    coinCost: 0,
    requiredCharacter: CardType.AMBASSADOR,
    canBeBlocked: false,
    canBeChallenged: true,
    autoResolve: false,
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
  return requiredResponses.every(id => turn.respondedPlayers.includes(id))
}

export const VALID_TRANSITIONS: StateTransition[] = [
  {
    from: 'ACTION_DECLARED',
    to: 'CHALLENGE_BLOCK_WINDOW'
  },
  {
    from: 'CHALLENGE_BLOCK_WINDOW',
    to: 'ACTION_RESOLUTION',
    condition: (turn, game) => haveAllPlayersResponded(game, turn)
  },
  {
    from: 'CHALLENGE_BLOCK_WINDOW',
    to: 'CHALLENGE_RESOLUTION'
  },
  {
    from: 'CHALLENGE_BLOCK_WINDOW',
    to: 'BLOCK_DECLARED'
  },
  {
    from: 'BLOCK_DECLARED',
    to: 'BLOCK_CHALLENGE_WINDOW'
  },
  {
    from: 'BLOCK_CHALLENGE_WINDOW',
    to: 'BLOCK_CHALLENGE_RESOLUTION',
    condition: turn => turn.challengeResult !== null
  },
  {
    from: 'BLOCK_CHALLENGE_RESOLUTION',
    to: 'ACTION_FAILED',
    condition: turn => turn.challengeResult?.successful === false
  },
  {
    from: 'BLOCK_CHALLENGE_RESOLUTION',
    to: 'ACTION_RESOLUTION',
    condition: turn => turn.challengeResult?.successful === true
  },
  {
    from: 'CHALLENGE_RESOLUTION',
    to: 'ACTION_FAILED',
    condition: turn => turn.challengeResult?.successful === true
  },
  {
    from: 'CHALLENGE_RESOLUTION',
    to: 'ACTION_RESOLUTION',
    condition: turn => turn.challengeResult?.successful === false
  },
  {
    from: 'ACTION_RESOLUTION',
    to: 'LOSE_INFLUENCE',
    condition: turn => ['ASSASSINATE', 'COUP'].includes(turn.action.type)
  }
]
