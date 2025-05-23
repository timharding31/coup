import { useRef, useCallback, useEffect } from 'react'
import { Game, TurnPhase } from '~/types'
import { isBotActionInProgress } from '~/utils/game'

export function useThrottledGameCallback(callback: (value: Game<'client'>) => void) {
  const isProcessingRef = useRef(false)
  const gameUpdateTimeoutRef = useRef<NodeJS.Timeout>()
  const gameUpdatesQueueRef = useRef<Game<'client'>[]>([])
  const prevGameRef = useRef<Game<'client'>>()

  useEffect(() => {
    return () => {
      gameUpdatesQueueRef.current = []
      isProcessingRef.current = false
      if (gameUpdateTimeoutRef.current) clearTimeout(gameUpdateTimeoutRef.current)
    }
  }, [callback])

  const processGameUpdate = useCallback(() => {
    if (gameUpdatesQueueRef.current.length < 1) {
      isProcessingRef.current = false
      return
    }

    isProcessingRef.current = true

    const game = gameUpdatesQueueRef.current.shift()!
    const nextGame = gameUpdatesQueueRef.current.at(0)
    const prevGame = prevGameRef.current
    const delay = getDelayFromGame(game, nextGame, prevGame)

    callback(game)

    prevGameRef.current = game
    gameUpdateTimeoutRef.current = setTimeout(() => {
      gameUpdateTimeoutRef.current = undefined
      processGameUpdate()
    }, delay)
  }, [callback])

  return useCallback(
    (game: Game<'client'>) => {
      gameUpdatesQueueRef.current.push(game)
      if (!isProcessingRef.current) {
        processGameUpdate()
      }
    },
    [processGameUpdate]
  )
}

function getDelayFromGame(game: Game<'client'>, nextGame?: Game<'client'>, prevGame?: Game<'client'>): number {
  if (isChallengeDefenseCardVisible(game) && !isChallengeDefenseCardVisible(nextGame)) {
    return 2_500
  }
  if (isActiveBotExchangeReturn(game) && !isActiveBotExchangeReturn(nextGame)) {
    return 1_500
  }
  if (isNewBlockOrChallenge(game, prevGame)) {
    const { block, challenge } = game.currentTurn?.opponentResponses || {}
    if (block?.startsWith('bot-') || challenge?.startsWith('bot-')) {
      return 2_500
    }
    return 1_000
  }
  if (isTurnAboutToEnd(game)) {
    return 1_000
  }
  const { phase, action, respondedPlayers = [] } = game.currentTurn || {}
  const { playerId: actor, targetPlayerId: target } = action || {}
  if (
    isBotActionInProgress({
      actor,
      target,
      phase,
      respondedPlayers,
      players: game.players
    })
  ) {
    if (phase === 'AWAITING_OPPONENT_RESPONSES') {
      return 200 + Math.random() * 600
    }
    return 500 + Math.random() * 1_000
  }
  if (game.currentTurn?.phase !== nextGame?.currentTurn?.phase) {
    return 1_000
  }
  return 200
}

function isNewBlockOrChallenge(game: Game<'client'> | null, prevGame: Game<'client'> | null = null): boolean {
  const turn = game?.currentTurn
  const prevTurn = prevGame?.currentTurn
  if (!turn || !prevTurn) {
    return false
  }
  if (turn.opponentResponses?.block && !prevTurn.opponentResponses?.block) {
    return true
  }
  if (turn.opponentResponses?.challenge && !prevTurn.opponentResponses?.challenge) {
    return true
  }
  return false
}

function isTurnAboutToEnd(game: Game<'client'> | null = null): boolean {
  if (!game?.currentTurn) {
    return false
  }
  return ['ACTION_EXECUTION', 'ACTION_FAILED'].includes(game.currentTurn.phase)
}

function isChallengeDefenseCardVisible(game: Game<'client'> | null = null): boolean {
  const { phase } = game?.currentTurn || {}
  if (phase !== 'REPLACING_CHALLENGE_DEFENSE_CARD') {
    return false
  }
  const actor = game?.players?.[game.currentPlayerIndex]
  if (!actor) {
    return false
  }
  return actor.influence.some(card => card.isChallengeDefenseCard)
}

function isActiveBotExchangeReturn(game: Game<'client'> | null = null): boolean {
  const { phase } = game?.currentTurn || {}
  if (phase !== 'AWAITING_EXCHANGE_RETURN') {
    return false
  }
  const actor = game?.players[game.currentPlayerIndex]
  if (!actor || !actor.id.startsWith('bot-')) {
    return false
  }
  return actor.influence.length > 2
}

function isPendingBotDecision(game: Game<'client'> | null = null): boolean {
  if (!game) {
    return false
  }
  // If no alive bots, return false
  if (!game.players?.some(player => player.id.startsWith('bot-') && player.influence.some(card => !card.isRevealed))) {
    return false
  }
  const { playerId: actor, targetPlayerId: target } = game.currentTurn?.action || {}
  const { block: blocker, challenge: challenger } = game.currentTurn?.opponentResponses || {}
  switch (game.currentTurn?.phase) {
    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
      return !!actor?.startsWith('bot-') || !!blocker?.startsWith('bot-')

    case 'AWAITING_ACTOR_DEFENSE':
      return !!actor?.startsWith('bot-')

    case 'AWAITING_TARGET_SELECTION':
    case 'AWAITING_TARGET_BLOCK_RESPONSE':
      return !!target?.startsWith('bot-')

    case 'AWAITING_BLOCKER_DEFENSE':
      return !!blocker?.startsWith('bot-')

    case 'AWAITING_CHALLENGE_PENALTY_SELECTION':
      return !!challenger?.startsWith('bot-')

    default:
      return false
  }
}

function isWaitingPhase(phase?: TurnPhase): boolean {
  if (!phase) return false
  return [
    'AWAITING_OPPONENT_RESPONSES',
    'AWAITING_ACTIVE_RESPONSE_TO_BLOCK',
    'AWAITING_TARGET_BLOCK_RESPONSE'
  ].includes(phase)
}
