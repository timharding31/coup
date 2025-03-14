import { CardType } from './card'
import { Action } from './turn'

type Merge<A, B> =
  | (A & { [K in Exclude<keyof B, keyof A>]?: never })
  | (B & { [K in Exclude<keyof A, keyof B>]?: never })

type DiscriminatedUnion<A, B, C = undefined, D = undefined> = D extends undefined
  ? C extends undefined
    ? Merge<A, B>
    : Merge<Merge<A, B>, C>
  : Merge<Merge<Merge<A, B>, C>, D>

type CoupRequest<A, B, C = undefined, D = undefined> = { playerId: string } & DiscriminatedUnion<A, B, C, D>

export const GameMethod = {
  START: 'START',
  REMATCH: 'REMATCH'
} as const
export type GameMethod = keyof typeof GameMethod

export type GameRequest = CoupRequest<
  { method: typeof GameMethod.START; gameId: string },
  { method: typeof GameMethod.REMATCH; gameId: string }
>

export const TurnMethod = {
  ACTION: 'ACTION',
  RESPONSE: 'RESPONSE',
  ADVANCE: 'ADVANCE'
} as const
export type TurnMethod = keyof typeof TurnMethod

export type TurnRequest = CoupRequest<
  { method: typeof TurnMethod.ACTION; action: Action },
  { method: typeof TurnMethod.RESPONSE; response: 'accept' | 'challenge' | 'block'; blockCard?: CardType },
  { method: typeof TurnMethod.ADVANCE }
>

export const CardMethod = {
  SELECT: 'SELECT',
  EXCHANGE: 'EXCHANGE'
} as const
export type CardMethod = keyof typeof CardMethod

export type CardRequest = CoupRequest<
  { method: typeof CardMethod.SELECT; cardId: string },
  { method: typeof CardMethod.EXCHANGE; cardIds: string[] }
>

export const BotMethod = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
} as const
export type BotMethod = keyof typeof BotMethod

export type BotRequest = CoupRequest<
  { method: typeof BotMethod.ADD },
  { method: typeof BotMethod.REMOVE; botId: string }
>
