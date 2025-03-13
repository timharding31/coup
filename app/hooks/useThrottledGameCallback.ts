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
  if (isChallengeDefenseCardVisible(game) && !isChallengeDefenseCardVisible(nextGame)) {
    return 2_500
  }
  if (isActiveExchangeReturn(game) && !isActiveExchangeReturn(nextGame)) {
    return 1_000
  }

  // Simulate thinking by adding a random delay of ~0.5s
  if (game.botActionInProgress) {
    return 200 + Math.random() * 600
  }

  return 0
}

function isChallengeDefenseCardVisible(game: Game<'client'> | null): boolean {
  const { phase } = game?.currentTurn || {}
  if (phase! == 'REPLACING_CHALLENGE_DEFENSE_CARD') {
    return false
  }
  const allCards = game?.players.flatMap(player => player.influence) || []
  return allCards.some(card => card.isChallengeDefenseCard)
}

function isActiveExchangeReturn(game: Game<'client'> | null): boolean {
  const { phase } = game?.currentTurn || {}
  if (phase !== 'AWAITING_EXCHANGE_RETURN') {
    return false
  }
  const allPlayers = game?.players || []
  return allPlayers.some(player => player.influence.length > 2)
}
