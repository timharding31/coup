import { useRef, useCallback, useEffect } from 'react'
import { Game } from '~/types'

export function useThrottledGameCallback(onGame: (value: Game<'client'>) => void) {
  const isProcessingRef = useRef(false)
  const gameUpdateTimeoutRef = useRef<NodeJS.Timeout>()
  const gameUpdatesQueueRef = useRef<Game<'client'>[]>([])

  useEffect(() => {
    return () => {
      gameUpdatesQueueRef.current = []
      isProcessingRef.current = false
      if (gameUpdateTimeoutRef.current) {
        clearTimeout(gameUpdateTimeoutRef.current)
      }
    }
  }, [onGame])

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
      onGame(game)
      gameUpdateTimeoutRef.current = undefined
      processGameUpdate()
    }, delay)
  }, [onGame])

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
  if (!game.currentTurn) {
    return 0
  }

  // Simulate thinking by adding a random delay of ~0.5s
  if (game.botActionInProgress) {
    return 200 + Math.random() * 600
  }

  // Make sure replaced card is visible for 2.5s
  if (game.currentTurn.phase === 'REPLACING_CHALLENGE_DEFENSE_CARD') {
    const { phase: nextPhase } = nextGame?.currentTurn || {}
    if (nextPhase && nextPhase !== 'REPLACING_CHALLENGE_DEFENSE_CARD') {
      return 2_500
    }
  }

  return 10
}
