import { Card, Game, NordColor, Player } from '~/types'
import { getActionObject, getActionVerb } from './action'

export function prepareGameForClient(game: Game<'server' | 'client'>, playerId: string): Game<'client'> {
  const player = game.status === 'WAITING' ? null : game.players.find(p => p.id === playerId)
  return {
    ...game,
    deck: game.deck.map(card => prepareCardForClient(card, player)),
    players: game.players.map(opponent => prepareOpponentForPlayer(opponent, player))
  }
}

function prepareOpponentForPlayer(
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

/* 
  const actor = useMemo(() => game.players[game.currentPlayerIndex], [game.players, game.currentPlayerIndex])

  const myself = useMemo(() => game.players.find(p => p.id === playerId), [game.players, playerId])

  const blocker = useMemo(
    () => game.players.find(p => p.id === game.currentTurn?.opponentResponses?.block),
    [game.players, game.currentTurn?.opponentResponses]
  )

  const challenger = useMemo(
    () => game.players.find(p => p.id === game.currentTurn?.challengeResult?.challengerId),
    [game.players, game.currentTurn?.challengeResult]
  )

  const target = useMemo(
    () => game.players.find(p => p.id === game.currentTurn?.action.targetPlayerId),
    [game.players, game.currentTurn?.action]
  )
*/

export function getPlayerActionMessages(
  game: Game<'client'>
): { playerId: string; message: string; clear?: boolean; color?: NordColor } | null {
  const actor = getActor(game)
  const target = getTarget(game)
  const blocker = getBlocker(game)
  const challenger = getChallenger(game)

  const turn = game.currentTurn
  const { action, phase = null } = turn || {}

  switch (phase) {
    case null:
      return { playerId: actor.id, message: 'Selecting action', clear: true, color: 'nord-15' }

    case 'ACTION_DECLARED':
      if (!action) {
        throw new Error('No action found')
      }
      const actionVerb = getActionVerb(actor.id, action, 'infinitive', target)
      return {
        playerId: actor.id,
        message: actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1),
        color: 'nord-14',
        clear: true
      }

    case 'AWAITING_OPPONENT_RESPONSES':
      return null

    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
      if (!blocker || !action) {
        throw new Error('Blocker or Action not found')
      }
      return {
        playerId: blocker.id,
        message: `Block ${action.type}`,
        color: 'nord-13'
      }
    // return `Waiting for ${actor.username} to respond to BLOCK`

    case 'AWAITING_ACTOR_DEFENSE':
      if (!challenger || !action) {
        throw new Error('Challenger or Action not found')
      }
      return {
        playerId: challenger.id,
        message: `Challenge ${action.type}`,
        color: 'nord-11'
      }
    // return `Waiting for ${actor.username} to respond to ${challenger.username}'s CHALLENGE`

    case 'AWAITING_BLOCKER_DEFENSE':
      if (!challenger || !blocker) {
        throw new Error('Challenger or Blocker not found')
      }
      return {
        playerId: challenger.id,
        message: `Challenge block`,
        color: 'nord-11'
      }
    // return `Waiting for ${blocker.username} to respond to ${actor.username}'s CHALLENGE`

    case 'AWAITING_CHALLENGE_PENALTY_SELECTION':
      if (!challenger) {
        throw new Error('Challenger not found')
      }
      return {
        playerId: challenger.id,
        message: `Challenge failed`,
        color: 'nord-11'
      }
    // return `${challenger.username}'s CHALLENGE failed. Waiting for ${challenger.username} to reveal card`

    case 'ACTION_EXECUTION':
      return null
    // return `Executing ${actor.username}'s ${action.type}`

    case 'AWAITING_TARGET_SELECTION':
      if (!target) {
        throw new Error('Target not found')
      }
      return {
        playerId: target.id,
        message: 'Choosing card to reveal',
        color: 'nord-12'
      }
    // return `Waiting for ${target?.username} to reveal card`

    case 'AWAITING_EXCHANGE_RETURN':
      return {
        playerId: actor.id,
        message: 'Exchanging cards',
        color: 'nord-14'
      }
    // return `Waiting for ${actor.username} to return cards`

    case 'ACTION_FAILED':
      return null

    case 'TURN_COMPLETE':
      return null
  }
}

export function getResponseMenuProps(
  game: Game<'client'>,
  myself: Player<'client'>
): Partial<{ heading: string; subheading: string }> {
  const actor = getActor(game)
  const target = getTarget(game)
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
      return {
        heading: `${actor.username} chose to ${getActionVerb(myself.id, action, 'infinitive', target)}`,
        subheading: 'How will you respond?'
      }

    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
      if (!blocker) return {}
      return {
        heading: `${blocker.username} chose to BLOCK your ${getActionObject(action)}`,
        subheading: 'How will you respond?'
      }

    case 'AWAITING_ACTOR_DEFENSE':
      if (!challenger) return {}
      return {
        heading: `${challenger.username} CHALLENGED your ${getActionObject(action)}`,
        subheading: `Reveal ${action.requiredCharacter?.startsWith('A') ? 'an' : 'a'} ${action.requiredCharacter} to defend the challenge`
      }

    case 'AWAITING_BLOCKER_DEFENSE':
      if (!challenger) return {}
      const requiredCards = action.blockableBy.join(' or ')
      return {
        heading: `${challenger.username} CHALLENGED your BLOCK`,
        subheading: `Reveal ${requiredCards.startsWith('A') ? 'an' : 'a'} ${requiredCards} to defend the challenge`
      }

    case 'AWAITING_CHALLENGE_PENALTY_SELECTION':
      return {
        heading: 'Your CHALLENGE failed',
        subheading: 'Choose a card to lose'
      }

    case 'AWAITING_TARGET_SELECTION':
      return {
        heading: `${actor.username}'s ${getActionObject(action)} succeeded`,
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
