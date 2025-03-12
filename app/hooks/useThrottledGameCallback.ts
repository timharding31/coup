import { useRef, useCallback, useEffect } from 'react'
import { Game } from '~/types'

export function useThrottledGameCallback(callback: (value: Game<'client'>) => void) {
  const isProcessingRef = useRef(false)
  const gameUpdateTimeoutRef = useRef<NodeJS.Timeout>()
  const gameUpdatesQueueRef = useRef<Game<'client'>[]>([])

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
    const delay = getDelayFromGame(game, nextGame)

    gameUpdateTimeoutRef.current = setTimeout(() => {
      callback(game)
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

function getDelayFromGame(game: Game<'client'>, nextGame: Game<'client'> | null = null): number {
  // Make sure replaced card is visible for 2.5s
  const { phase: currentPhase } = game.currentTurn || {}
  const { phase: nextPhase } = nextGame?.currentTurn || {}

  if (currentPhase === 'REPLACING_CHALLENGE_DEFENSE_CARD' && nextPhase !== 'REPLACING_CHALLENGE_DEFENSE_CARD') {
    return 2_500
  }
  if (currentPhase === 'AWAITING_EXCHANGE_RETURN' && nextPhase !== 'AWAITING_EXCHANGE_RETURN') {
    return 2_500
  }

  // Simulate thinking by adding a random delay of ~0.5s
  if (game.botActionInProgress) {
    return 200 + Math.random() * 600
  }

  return 0
}
