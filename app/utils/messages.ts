import { SpriteId } from '~/components/Sprite'
import { Game, CardType, TurnPhase, ActionType } from '~/types'
import { ActionVerbValue, getActionObject, getActionVerb } from '~/utils/action'
import { getActor, getTarget, getBlocker, getChallenger } from '~/utils/game'

export type MessageType = 'info' | 'challenge' | 'block' | 'success' | 'failure'

export interface MessageData {
  text: string
  type: MessageType
  isWaiting?: boolean
  cardType?: CardType
  target?: string
  delayMs?: number
  action?: ActionType
  sprite?: SpriteId
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

    case 'AWAITING_OPPONENT_RESPONSES':
      if (!action) {
        throw new Error('Action not found')
      }
      actionVerb = getActionVerb(actor.id, action, 'infinitive', target)
      return Object.assign(
        {},
        ...game.players.map(player => {
          if (player.id === actor.id) {
            if (!actionVerb) return {}
            return {
              [player.id]: {
                text: actionVerb.content,
                type: 'info',
                isWaiting: false,
                target: actionVerb.target,
                action: action.type
              }
            }
          }
          return {
            [player.id]: {
              text: 'Responding',
              type: 'info',
              isWaiting: true,
              delay: 200
            }
          }
        })
      )

    case 'AWAITING_TARGET_BLOCK_RESPONSE':
      if (!target) {
        throw new Error('Target not found')
      }
      return {
        [target.id]: {
          text: 'Responding',
          type: 'info',
          isWaiting: true
        }
      }

    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
      if (!blocker || !action) {
        throw new Error('Blocker or Action not found')
      }
      if (!opponentResponses?.claimedCard) {
        throw new Error('Required card not found')
      }
      return {
        [blocker.id]: {
          text: 'BLOCK with',
          type: 'block',
          isWaiting: false,
          cardType: opponentResponses.claimedCard,
          sprite: 'shield'
        },
        [actor.id]: {
          text: 'Responding',
          type: 'block',
          isWaiting: true,
          delayMs: 200
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
          text: 'CHALLENGE',
          type: 'challenge',
          isWaiting: false,
          cardType: challengeResult.challengedCaracter,
          sprite: 'challenge'
        },
        [actor.id]: {
          text: 'Proving',
          type: 'challenge',
          isWaiting: true,
          delayMs: 50,
          cardType: challengeResult.challengedCaracter
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
          text: 'CHALLENGE',
          type: 'challenge',
          isWaiting: false,
          cardType: challengeResult.challengedCaracter,
          sprite: 'challenge'
        },
        [blocker.id]: {
          text: 'Proving',
          type: 'challenge',
          isWaiting: true,
          delayMs: 50,
          cardType: challengeResult.challengedCaracter
        }
      }

    case 'REPLACING_CHALLENGE_DEFENSE_CARD':
      const defender = turn?.opponentResponses?.block ? blocker : actor
      if (!defender || !challengeResult?.challengedCaracter) {
        throw new Error('Defender not found')
      }
      return {
        [defender.id]: {
          text: 'Replacing',
          type: 'success',
          isWaiting: true,
          cardType: challengeResult.challengedCaracter
        }
      }

    case 'AWAITING_CHALLENGE_PENALTY_SELECTION':
      if (!challenger) {
        throw new Error('Challenger not found')
      }
      return {
        [challenger.id]: {
          text: 'Revealing card',
          type: 'failure',
          isWaiting: true
        }
      }

    case 'ACTION_EXECUTION':
      if (action && !action.canBeBlocked && !action.canBeChallenged) {
        actionVerb = getActionVerb(actor.id, action, 'infinitive', target)
        return {
          [actor.id]: {
            text: actionVerb.content,
            type: 'info',
            isWaiting: false,
            target: actionVerb.target,
            action: action.type
          }
        }
      }
      return null

    case 'AWAITING_TARGET_SELECTION':
      if (!target || !action) {
        throw new Error('Target and/or action not found')
      }
      return {
        [target.id]: {
          text: 'Revealing card',
          type: 'failure',
          isWaiting: true
        }
      }

    case 'AWAITING_EXCHANGE_RETURN':
      return {
        [actor.id]: {
          text: 'Exchanging cards',
          type: 'success',
          isWaiting: true,
          sprite: 'exchange'
        }
      }

    case 'ACTION_FAILED':
      if (!action) {
        throw new Error('Action not found')
      }
      return {
        [actor.id]: {
          text: 'Action failed',
          type: 'failure',
          isWaiting: false
        }
      }

    case 'TURN_COMPLETE':
      return null
  }
}

// Helper for response messages
function getResponderMessage(
  playerId: string,
  actorId: string = '',
  blockerId: string = '',
  challengerId: string = ''
): MessageData | null {
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
