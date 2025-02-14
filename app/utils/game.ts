import { Card, Game, Player } from '~/types'

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
  if (card.isRevealed || playerCardIds.has(card.id)) {
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
): { playerId: string; message: string; clear?: boolean } | null {
  const actor = getActor(game)
  const target = getTarget(game)
  const blocker = getBlocker(game)
  const challenger = getChallenger(game)

  const turn = game.currentTurn
  const { action, phase = null } = turn || {}

  if (!phase) return null

  switch (phase) {
    case 'ACTION_DECLARED':
      if (!action) {
        throw new Error('No action found')
      }
      return { playerId: actor.id, message: `${actor.username.toUpperCase()} ${action.verb.present}`, clear: true }

    case 'AWAITING_OPPONENT_RESPONSES':
      return null

    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
      if (!blocker || !action) {
        throw new Error('Blocker or Action not found')
      }
      return { playerId: blocker.id, message: `${blocker.username.toUpperCase()} BLOCKS ${action.type}` }
    // return `Waiting for ${actor.username.toUpperCase()} to respond to BLOCK`

    case 'AWAITING_ACTOR_DEFENSE':
      if (!challenger) {
        throw new Error('Challenger not found')
      }
      return {
        playerId: challenger.id,
        message: `${challenger.username.toUpperCase()} CHALLENGES ${actor.username.toUpperCase()}`
      }
    // return `Waiting for ${actor.username.toUpperCase()} to respond to ${challenger.username.toUpperCase()}'s CHALLENGE`

    case 'AWAITING_BLOCKER_DEFENSE':
      if (!challenger || !blocker) {
        throw new Error('Challenger or Blocker not found')
      }
      return {
        playerId: challenger.id,
        message: `${challenger.username.toUpperCase()} CHALLENGES ${blocker.username.toUpperCase()}`
      }
    // return `Waiting for ${blocker.username.toUpperCase()} to respond to ${actor.username.toUpperCase()}'s CHALLENGE`

    case 'AWAITING_CHALLENGE_PENALTY_SELECTION':
      if (!challenger) {
        throw new Error('Challenger not found')
      }
      return { playerId: challenger.id, message: `${challenger.username.toUpperCase()}'s CHALLENGE failed` }
    // return `${challenger.username.toUpperCase()}'s CHALLENGE failed. Waiting for ${challenger.username.toUpperCase()} to reveal card`

    case 'ACTION_EXECUTION':
      return null
    // return `Executing ${actor.username.toUpperCase()}'s ${action.type}`

    case 'AWAITING_TARGET_SELECTION':
      if (!target) {
        throw new Error('Target not found')
      }
      return { playerId: target.id, message: 'Choosing card to reveal', clear: true }
    // return `Waiting for ${target?.username.toUpperCase()} to reveal card`

    case 'AWAITING_EXCHANGE_RETURN':
      return { playerId: actor.id, message: `Exchanging cards` }
    // return `Waiting for ${actor.username.toUpperCase()} to return cards`

    case 'ACTION_FAILED':
      return null

    case 'TURN_COMPLETE':
      return null
  }
}

export function getTurnPhaseMessage(game: Game<'client'>): string {
  const actor = getActor(game)
  const target = getTarget(game)
  const blocker = getBlocker(game)
  const challenger = getChallenger(game)

  const turn = game.currentTurn
  const { action, phase = null } = turn || {}

  switch (phase) {
    case null:
      return `It's ${actor.username.toUpperCase()}'s turn`

    case 'ACTION_DECLARED':
      if (!action) return ''
      return `${actor.username.toUpperCase()} ${action.verb.present}`

    case 'AWAITING_OPPONENT_RESPONSES':
      return `Waiting for responses`

    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
      return `Waiting for ${actor.username.toUpperCase()} to respond to BLOCK`

    case 'AWAITING_ACTOR_DEFENSE':
      if (!challenger) return ''
      return `Waiting for ${actor.username.toUpperCase()} to respond to ${challenger.username.toUpperCase()}'s CHALLENGE`

    case 'AWAITING_BLOCKER_DEFENSE':
      if (!blocker) return ''
      return `Waiting for ${blocker.username.toUpperCase()} to respond to ${actor.username.toUpperCase()}'s CHALLENGE`

    case 'AWAITING_CHALLENGE_PENALTY_SELECTION':
      if (!challenger) return ''
      return `${challenger.username.toUpperCase()}'s CHALLENGE failed. Waiting for ${challenger.username.toUpperCase()} to reveal card`

    case 'ACTION_EXECUTION':
      if (!action) return ''
      return `Executing ${actor.username.toUpperCase()}'s ${action.type}`

    case 'AWAITING_TARGET_SELECTION':
      return `Waiting for ${target?.username.toUpperCase()} to reveal card`

    case 'AWAITING_EXCHANGE_RETURN':
      return `Waiting for ${actor.username.toUpperCase()} to return cards`

    case 'ACTION_FAILED':
      return `${actor.username.toUpperCase()}'s action failed`

    case 'TURN_COMPLETE':
      return 'Turn complete'
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
