import { Game, Player, CardType, TurnPhase } from '~/types'
import { ActionVerbValue, getActionObject, getActionVerb } from '~/utils/action'
import { getActor, getTarget, getBlocker, getChallenger } from '~/utils/game'
import { action } from '../routes/_index'

// Define message data types without JSX
export type MessageType = 'info' | 'challenge' | 'block' | 'success' | 'failure'

export interface MessageData {
  text: string
  type: MessageType
  isWaiting?: boolean
  target?: string // Target for actions that need highlighting
}

export type MessageMap = Record<string, MessageData>

// Message generation functions that return data only (no JSX)
export function getPlayerActionMessages(game: Game<'client'>): MessageMap | null {
  const actor = getActor(game)
  const target = getTarget(game)
  const blocker = getBlocker(game)
  const challenger = getChallenger(game)

  const turn = game.currentTurn
  const { action, phase = null, challengeResult, opponentResponses } = turn || {}

  let actionVerb: ActionVerbValue | undefined

  switch (phase) {
    case null:
      return {
        [actor.id]: {
          text: 'Starting turn',
          type: 'info',
          isWaiting: true
        }
      }

    case 'ACTION_DECLARED':
      if (!action) {
        throw new Error('No action found')
      }
      actionVerb = getActionVerb(actor.id, action, 'infinitive', target)
      return {
        [actor.id]: {
          text: actionVerb.content,
          type: 'info',
          isWaiting: false,
          target: actionVerb.target
        }
      }

    case 'AWAITING_OPPONENT_RESPONSES':
      return Object.assign(
        {},
        ...game.players.map(opponent => {
          if (opponent.id !== actor.id) {
            return {
              [opponent.id]: {
                text: 'Responding',
                type: 'info',
                isWaiting: true
              }
            }
          }
        })
      )

    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
      if (!blocker || !action) {
        throw new Error('Blocker or Action not found')
      }
      if (!opponentResponses?.claimedCard) {
        throw new Error('Required card not found')
      }
      return {
        [blocker.id]: {
          text: `Block with ${opponentResponses.claimedCard}`,
          type: 'block',
          isWaiting: false
        },
        [actor.id]: {
          text: 'Responding to block',
          type: 'info',
          isWaiting: true
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
          text: `Challenge ${action.requiredCharacter}`,
          type: 'challenge',
          isWaiting: false
        },
        [actor.id]: {
          text: `Proving ${challengeResult.challengedCaracter}`,
          type: 'info',
          isWaiting: true
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
          text: `Challenge ${challengeResult.challengedCaracter}`,
          type: 'challenge',
          isWaiting: false
        },
        [blocker.id]: {
          text: `Proving ${challengeResult.challengedCaracter}`,
          type: 'info',
          isWaiting: true
        }
      }

    case 'AWAITING_CHALLENGE_PENALTY_SELECTION':
      const defender = turn?.opponentResponses?.block ? blocker : actor
      if (!challenger || !defender) {
        throw new Error('Challenger and/or defender not found')
      }
      return {
        [challenger.id]: {
          text: 'Selecting challenge penalty',
          type: 'failure',
          isWaiting: true
        }
      }

    case 'ACTION_EXECUTION':
      // if (!action) {
      //   throw new Error('Action not found')
      // }
      // actionVerb = getActionVerb(actor.id, action, 'past', target)
      // return {
      //   [actor.id]: {
      //     text: actionVerb.content,
      //     type: 'success',
      //     isWaiting: false,
      //     target: actionVerb.target
      //   }
      // }
      return null

    case 'AWAITING_TARGET_SELECTION':
      if (!target || !action) {
        throw new Error('Target and/or action not found')
      }
      actionVerb = getActionVerb(actor.id, action, 'past', target)
      return {
        [actor.id]: {
          text: actionVerb.content,
          type: 'success',
          isWaiting: false,
          target: actionVerb.target
        },
        [target.id]: {
          text: 'Choosing card to reveal',
          type: 'failure',
          isWaiting: true
        }
      }

    case 'AWAITING_EXCHANGE_RETURN':
      return {
        [actor.id]: {
          text: 'Exchanging cards',
          type: 'info',
          isWaiting: true
        }
      }

    case 'ACTION_FAILED':
      if (!action) {
        throw new Error('Action not found')
      }
      return {
        [actor.id]: {
          text: `${getActionObject(action)} failed`,
          type: 'failure',
          isWaiting: false
        }
      }

    case 'TURN_COMPLETE':
      return null
  }
}

// Helper for response messages
export function getResponderMessage(
  playerId: string,
  actorId: string,
  phase: TurnPhase | null = null,
  blockerId: string = '',
  challengerId: string = ''
): MessageData | null {
  if (phase === 'AWAITING_OPPONENT_RESPONSES') {
    if (playerId === actorId) {
      return null
    }
    if (playerId === blockerId) {
      return { text: '✗', type: 'block' }
    }
    if (playerId === challengerId) {
      return { text: '⁉️', type: 'challenge' }
    }
    return { text: '✓', type: 'success' }
  }

  return null
}
