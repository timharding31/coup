import { Card, Game, NordColor, Player, PlayerMessage } from '~/types'
import { getActionObject, getActionVerb } from './action'
import { WaitingEllipsis } from '~/components/WaitingEllipsis'

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

export function getPlayerActionMessages(game: Game<'client'>): { [playerId: string]: PlayerMessage } | null {
  const actor = getActor(game)
  const target = getTarget(game)
  const blocker = getBlocker(game)
  const challenger = getChallenger(game)

  const turn = game.currentTurn
  const { action, phase = null, challengeResult } = turn || {}

  switch (phase) {
    case null:
      return {
        [actor.id]: {
          message: (
            <>
              Starting turn
              <WaitingEllipsis />
            </>
          ),
          type: 'info'
        }
      }

    case 'ACTION_DECLARED':
      if (!action) {
        throw new Error('No action found')
      }
      return {
        [actor.id]: {
          message: getActionVerb(actor.id, action, 'infinitive', target),
          type: 'info'
        }
      }

    case 'AWAITING_OPPONENT_RESPONSES':
      return Object.assign(
        {},
        ...game.players.map(opponent => {
          if (opponent.id !== actor.id) {
            return {
              [opponent.id]: {
                message: <WaitingEllipsis />,
                type: 'info'
              }
            }
          }
        })
      )

    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
      if (!blocker || !action) {
        throw new Error('Blocker or Action not found')
      }
      return {
        [blocker.id]: {
          message: `Block ${getActionObject(action)}`,
          type: 'block'
        },
        [actor.id]: {
          message: (
            <>
              Responding to block
              <WaitingEllipsis />
            </>
          ),
          type: 'info'
        }
      }

    case 'AWAITING_ACTOR_DEFENSE':
      if (!challenger || !action) {
        throw new Error('Challenger or Action not found')
      }
      if (!challengeResult?.challengedCaracter) {
        throw new Error('Required character not found')
      }
      return {
        [challenger.id]: {
          message: `Challenge ${action.requiredCharacter}`,
          type: 'challenge'
        },
        [actor.id]: {
          message: (
            <>
              Proving {challengeResult.challengedCaracter}
              <WaitingEllipsis />
            </>
          ),
          type: 'info'
        }
      }

    case 'AWAITING_BLOCKER_DEFENSE':
      if (!challenger || !blocker) {
        throw new Error('Challenger or Blocker not found')
      }
      if (!challengeResult?.challengedCaracter) {
        throw new Error('Required character not found')
      }
      return {
        [challenger.id]: {
          message: `Challenge ${challengeResult.challengedCaracter}`,
          type: 'challenge'
        },
        [blocker.id]: {
          message: (
            <>
              Proving {challengeResult.challengedCaracter}
              <WaitingEllipsis />
            </>
          ),
          type: 'info'
        }
      }

    case 'AWAITING_CHALLENGE_PENALTY_SELECTION':
      const defender = turn?.opponentResponses?.block ? blocker : actor
      if (!challenger || !defender) {
        throw new Error('Challenger and/or defender not found')
      }
      return {
        [challenger.id]: {
          message: (
            <>
              Selecting challenge penalty
              <WaitingEllipsis />
            </>
          ),
          type: 'failure'
        }
      }

    case 'ACTION_EXECUTION':
      if (!action) {
        throw new Error('Action not found')
      }
      return {
        [actor.id]: {
          message: `${getActionObject(action)} succeeded`,
          type: 'success'
        }
      }

    case 'AWAITING_TARGET_SELECTION':
      if (!target || !action) {
        throw new Error('Target and/or action not found')
      }
      return {
        [actor.id]: {
          message: <>{getActionVerb(actor.id, action, 'past', target)}</>,
          type: 'success'
        },
        [target.id]: {
          message: (
            <>
              Choosing card to reveal
              <WaitingEllipsis />
            </>
          ),
          type: 'failure'
        }
      }
    // return `Waiting for ${target?.username} to reveal card`

    case 'AWAITING_EXCHANGE_RETURN':
      return {
        [actor.id]: {
          message: (
            <>
              Exchanging cards
              <WaitingEllipsis />
            </>
          ),
          type: 'info'
        }
      }

    case 'ACTION_FAILED':
      if (!action) {
        throw new Error('Action not found')
      }
      return {
        [actor.id]: {
          message: `${getActionObject(action)} failed`,
          type: 'failure'
        }
      }

    case 'TURN_COMPLETE':
      return null
  }
}

export function getResponseMenuProps(
  game: Game<'client'>,
  myself: Player<'client'>
): Partial<{ heading: React.ReactNode; subheading: React.ReactNode }> {
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
        heading: (
          <>
            {actor.username} chose to {getActionVerb(myself.id, action, 'infinitive', target)}
          </>
        ),
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
      return {
        heading: (
          <>
            {actor.username} {getActionVerb(myself.id, action, 'past', target)}
          </>
        ),
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
