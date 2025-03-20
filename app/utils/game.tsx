import { Card, Game, Player, TurnPhase } from '~/types'
import { getActionObject, getActionVerb } from './action'

export function prepareGameForClient(game: Game<'server' | 'client'>, playerId: string): Game<'client'> {
  const player = game.status === 'WAITING' ? null : game.players.find(p => p.id === playerId)
  return {
    ...game,
    deck: game.deck.map(card => prepareCardForClient(card, player)),
    players: game.players.map(opponent => prepareOpponentForPlayer(opponent, player))
  }
}

export function prepareOpponentForPlayer(
  opponent: Player<'server' | 'client'>,
  player: Player<'server' | 'client'> | null = null
): Player<'client'> {
  return {
    ...opponent,
    influence: opponent.influence.map(card => prepareCardForClient(card, player))
  }
}

// The card's `type` should only be sent over the network if it's revealed or belongs to the player
function prepareCardForClient(card: Card<'server' | 'client'>, player: Player | null = null): Card<'client'> {
  if (!player) {
    return { ...card, type: null }
  }
  const playerCardIds = new Set(player.influence.map(c => c.id))
  if (card.isRevealed || card.isChallengeDefenseCard || playerCardIds.has(card.id)) {
    return card
  }
  return { ...card, type: null }
}

export function getResponseMenuProps(
  game: Game<'client'>,
  myself: Player<'client'>
): Partial<{ heading: string; subheading: string }> {
  const actor = getActor(game)
  const targetPlayer = getTarget(game)
  const blocker = getBlocker(game)
  const challenger = getChallenger(game)

  const turn = game.currentTurn
  const { action, phase = null } = turn || {}

  if (!action || !phase) return {}

  switch (phase) {
    case 'ACTION_EXECUTION':
    case 'ACTION_FAILED':
    case 'TURN_COMPLETE':
    case 'REPLACING_CHALLENGE_DEFENSE_CARD':
      return {}

    case 'AWAITING_OPPONENT_RESPONSES':
    case 'AWAITING_TARGET_BLOCK_RESPONSE':
      const { content: infinitiveVerb, target } = getActionVerb(myself.id, action, 'infinitive', targetPlayer)
      return {
        heading: `${actor.username} wants to ${infinitiveVerb}${target ? ` ${target}` : ''}`,
        subheading: 'How will you respond?'
      }

    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
      if (!blocker) return {}
      return {
        heading: `${blocker.username} BLOCKED your ${getActionObject(action)}`,
        subheading: 'How will you respond?'
      }

    case 'AWAITING_ACTOR_DEFENSE':
      if (!challenger || !action.requiredCharacter) return {}
      return {
        heading: `${challenger.username} CHALLENGED your ${action.requiredCharacter}`,
        subheading: 'Select one to defend the challenge'
      }

    case 'AWAITING_BLOCKER_DEFENSE':
      if (!challenger || !turn?.opponentResponses?.claimedCard) return {}
      return {
        heading: `${challenger.username} CHALLENGED your ${turn.opponentResponses.claimedCard}`,
        subheading: 'Select one to defend the challenge'
      }

    case 'AWAITING_CHALLENGE_PENALTY_SELECTION':
      return {
        heading: 'Your CHALLENGE failed',
        subheading: 'Choose a card to lose'
      }

    case 'AWAITING_TARGET_SELECTION':
      const pastTenseVerb = getActionVerb(myself.id, action, 'past', targetPlayer).content
      return {
        heading: `${actor.username} ${pastTenseVerb} YOU`,
        subheading: 'Choose a card to lose'
      }

    case 'AWAITING_EXCHANGE_RETURN':
      return {
        heading: 'Exchanging cards',
        subheading: 'Choose two cards to return to the deck'
      }
  }
}

export function getMyself<T extends 'server' | 'client' = 'client'>(game: Game<T>, playerId: string): Player<T> {
  const myself = game.players.find(p => p.id === playerId)
  if (!myself) {
    throw new Error('Player not found')
  }
  return myself
}

export function getActor<T extends 'server' | 'client' = 'client'>(game: Game<T>): Player<T> {
  const actor = game.players.at(game.currentPlayerIndex)
  if (!actor) {
    throw new Error('Actor not found')
  }
  return actor
}

export function getBlocker<T extends 'server' | 'client' = 'client'>(game: Game<T>): Player<T> | null {
  return game.players.find(p => p.id === game.currentTurn?.opponentResponses?.block) || null
}

export function getChallenger<T extends 'server' | 'client' = 'client'>(game: Game<T>): Player<T> | null {
  return game.players.find(p => p.id === game.currentTurn?.challengeResult?.challengerId) || null
}

export function getTarget<T extends 'server' | 'client' = 'client'>(game: Game<T>): Player<T> | null {
  return game.players.find(p => p.id === game.currentTurn?.action.targetPlayerId) || null
}

export function isBotActionInProgress<T extends 'server' | 'client' = 'client'>({
  actor = '',
  target = '',
  phase,
  respondedPlayers = [],
  players = []
}: {
  actor?: string
  target?: string
  phase?: TurnPhase
  respondedPlayers?: string[]
  players?: Player<T>[]
}): boolean {
  const activeBotPlayers = players.filter(p => p.id.startsWith('bot-') && !p.influence.every(c => c.isRevealed))

  switch (phase) {
    case undefined: // Actor deciding its turn
    case 'AWAITING_ACTOR_DEFENSE': // Actor defending challenge
    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK': // Actor responding to block
      return actor.startsWith('bot-')

    case 'AWAITING_OPPONENT_RESPONSES':
      const respondingBots = activeBotPlayers.filter(bot => bot.id !== actor)
      if (respondingBots.length > 0) {
        return respondingBots.some(bot => !respondedPlayers.includes(bot.id))
      }
      break

    case 'AWAITING_TARGET_SELECTION':
    case 'AWAITING_TARGET_BLOCK_RESPONSE':
      return target.startsWith('bot-')

    default:
      break
  }
  return false
}
