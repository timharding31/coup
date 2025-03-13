import { CardType } from './card'
import { Action } from './turn'

export const CoupRequestIntent = {
  START_TURN: 'START_TURN',
  SELECT_CARD: 'SELECT_CARD',
  RETURN_CARDS: 'RETURN_CARDS',
  RESPOND_TO_ACTION: 'RESPOND_TO_ACTION'
} as const
export type CoupRequestIntent = keyof typeof CoupRequestIntent

export type CoupRequest = { playerId: string } & (
  | {
      intent: typeof CoupRequestIntent.START_TURN
      action: Action
      cardId?: never
      cardIds?: never
      response?: never
      blockCard?: never
    }
  | {
      intent: typeof CoupRequestIntent.SELECT_CARD
      action?: never
      cardId: string
      cardIds?: never
      response?: never
      blockCard?: never
    }
  | {
      intent: typeof CoupRequestIntent.RETURN_CARDS
      action?: never
      cardId?: never
      cardIds: string[]
      response?: never
      blockCard?: never
    }
  | {
      intent: typeof CoupRequestIntent.RESPOND_TO_ACTION
      action?: never
      cardId?: never
      cardIds?: never
      response: 'accept' | 'challenge' | 'block'
      blockCard?: CardType
    }
)
