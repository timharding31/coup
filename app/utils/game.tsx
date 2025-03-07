import { Card, Game, Player } from '~/types'
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
    case 'ACTION_DECLARED':
    case 'ACTION_EXECUTION':
    case 'ACTION_FAILED':
    case 'TURN_COMPLETE':
      return {}

    case 'AWAITING_OPPONENT_RESPONSES':
      const { content: infinitiveVerb, target } = getActionVerb(myself.id, action, 'infinitive', targetPlayer)
      return {
        heading: `${actor.username} chose to ${infinitiveVerb}${target ? ` ${target}` : ''}`,
        subheading: 'How will you respond?'
      }

    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
      if (!blocker) return {}
      return {
        heading: `${blocker.username} chose to BLOCK your ${getActionObject(action)}`,
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
        heading: `${actor.username} ${pastTenseVerb} you`,
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
