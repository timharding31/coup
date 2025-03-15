import { useRef, useCallback, useEffect } from 'react'
import { CoupRobot } from '~/services/robot.server'
import { Game } from '~/types'

export function useThrottledGameCallback(callback: (value: Game<'client'>) => void) {
  const isProcessingRef = useRef(false)
  const gameUpdateTimeoutRef = useRef<NodeJS.Timeout>()
  const gameUpdatesQueueRef = useRef<Game<'client'>[]>([])
  const prevGameRef = useRef<Game<'client'> | null>(null)

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
    const delay = getDelayFromGame(game, { next: nextGame, prev: prevGame })

    gameUpdateTimeoutRef.current = setTimeout(() => {
      callback(game)
      prevGameRef.current = game
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

function getDelayFromGame(
  game: Game<'client'>,
  games: { next?: Game<'client'> | null; prev?: Game<'client'> | null }
): number {
  if (isNewBlockOrChallenge(game, games.prev)) {
    return 1_000
  }
  if (isChallengeDefenseCardVisible(game) && !isChallengeDefenseCardVisible(games.next)) {
    return 2_500
  }
  if (isActiveBotExchangeReturn(game) && !isActiveBotExchangeReturn(games.next)) {
    return 1_000
  }
  // Simulate thinking by adding a random delay of ~0.5s
  if (game.botActionInProgress || games.next?.botActionInProgress) {
    return 200 + Math.random() * 600
  }
  if (isPendingBotDecision(game)) {
    return 100 + Math.random() * 300
  }
  if (game.currentTurn?.phase === 'ACTION_EXECUTION') {
    return 200
  }
  return 200
}

function isNewBlockOrChallenge(game: Game<'client'> | null, prevGame: Game<'client'> | null = null): boolean {
  if (!game?.currentTurn || !prevGame?.currentTurn) {
    return false
  }
  const isNewBlock = !!game.currentTurn.opponentResponses?.block && !prevGame?.currentTurn.opponentResponses?.block
  const isBotBlocker = !!game.currentTurn.opponentResponses?.block?.startsWith('bot-')
  const isNewChallenge =
    !!game.currentTurn.opponentResponses?.challenge && !prevGame?.currentTurn.opponentResponses?.challenge
  const isBotChallenger = !!game.currentTurn.opponentResponses?.challenge?.startsWith('bot-')
  return (isNewBlock && isBotBlocker) || (isNewChallenge && isBotChallenger)
}

function isChallengeDefenseCardVisible(game: Game<'client'> | null = null): boolean {
  const { phase } = game?.currentTurn || {}
  if (phase !== 'REPLACING_CHALLENGE_DEFENSE_CARD') {
    return false
  }
  const allCards = game?.players.flatMap(player => player.influence) || []
  return allCards.some(card => card.isChallengeDefenseCard)
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
