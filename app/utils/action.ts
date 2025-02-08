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
  WaitingPhase
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
    autoResolve: false,
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
  return requiredResponses.every(id => turn.respondedPlayers?.includes(id))
}

export const VALID_TRANSITIONS: StateTransition[] = [
  {
    from: 'WAITING_FOR_ACTION',
    to: 'ACTION_DECLARED',
    condition: (_turn, _game) => true
  },
  {
    from: 'ACTION_DECLARED',
    to: 'WAITING_FOR_REACTIONS',
    condition: (turn, _game) => !turn.action.autoResolve
  },
  {
    from: 'ACTION_DECLARED',
    to: 'ACTION_RESOLVING',
    condition: (turn, _game) => !turn.action.canBeBlocked && !turn.action.canBeChallenged
  },
  {
    from: 'WAITING_FOR_REACTIONS',
    to: 'BLOCK_DECLARED',
    condition: (turn, _game) => turn.blockingPlayer !== null
  },
  {
    from: 'WAITING_FOR_REACTIONS',
    to: 'WAITING_FOR_DEFENSE_REVEAL',
    condition: (turn, _game) => turn.challengeResult !== null
  },
  {
    from: 'WAITING_FOR_REACTIONS',
    to: 'ACTION_RESOLVING',
    condition: (turn, game) => haveAllPlayersResponded(game, turn)
  },
  {
    from: 'BLOCK_DECLARED',
    to: 'WAITING_FOR_BLOCK_RESPONSE',
    condition: (_turn, _game) => true
  },
  {
    from: 'WAITING_FOR_BLOCK_RESPONSE',
    to: 'WAITING_FOR_DEFENSE_REVEAL',
    condition: (turn, _game) => turn.challengeResult !== null
  },
  {
    from: 'WAITING_FOR_BLOCK_RESPONSE',
    to: 'ACTION_FAILED',
    condition: (turn, game) => haveAllPlayersResponded(game, turn)
  },
  {
    from: 'WAITING_FOR_DEFENSE_REVEAL',
    to: 'WAITING_FOR_CHALLENGE_PENALTY',
    condition: (turn, _game) =>
      turn.challengeResult?.defendingCardId !== null && turn.challengeResult?.successful === false
  },
  {
    from: 'WAITING_FOR_DEFENSE_REVEAL',
    to: 'ACTION_FAILED',
    condition: (turn, _game) => turn.challengeResult?.lostCardId !== null && turn.challengeResult?.successful === true
  },
  {
    from: 'WAITING_FOR_CHALLENGE_PENALTY',
    to: 'ACTION_RESOLVING',
    condition: (turn, _game) => turn.challengeResult?.lostCardId !== null
  },
  {
    from: 'ACTION_RESOLVING',
    to: 'WAITING_FOR_TARGET_REVEAL',
    condition: (turn, _game) => ['ASSASSINATE', 'COUP'].includes(turn.action.type)
  },
  {
    from: 'ACTION_RESOLVING',
    to: 'TURN_COMPLETE',
    condition: (turn, _game) => !['ASSASSINATE', 'COUP'].includes(turn.action.type)
  },
  {
    from: 'WAITING_FOR_TARGET_REVEAL',
    to: 'TURN_COMPLETE',
    condition: (turn, _game) => turn.lostInfluenceCardId !== null
  },
  {
    from: 'ACTION_FAILED',
    to: 'TURN_COMPLETE',
    condition: (_turn, _game) => true
  },
  {
    from: 'ACTION_RESOLVING',
    to: 'WAITING_FOR_EXCHANGE_RETURN',
    condition: (turn, _game) => turn.action.type === 'EXCHANGE'
  },
  {
    from: 'WAITING_FOR_EXCHANGE_RETURN',
    to: 'TURN_COMPLETE',
    condition: (turn, _game) => true
  }
]

export const isWaitingPhase = (phase: TurnPhase): phase is WaitingPhase => {
  return phase.startsWith('WAITING_FOR_')
}

export const getRequiredAction = (turn: TurnState): string => {
  switch (turn.phase) {
    case 'WAITING_FOR_ACTION':
      return 'Choose an action'
    case 'WAITING_FOR_REACTIONS':
      return 'Accept, challenge, or block the action'
    case 'WAITING_FOR_BLOCK_RESPONSE':
      return 'Accept or challenge the block'
    case 'WAITING_FOR_DEFENSE_REVEAL':
      return 'Reveal a card to prove your claim'
    case 'WAITING_FOR_CHALLENGE_PENALTY':
      return 'Choose a card to lose from failed challenge'
    case 'WAITING_FOR_TARGET_REVEAL':
      return 'Choose a card to lose from being targeted'
    default:
      return ''
  }
}
