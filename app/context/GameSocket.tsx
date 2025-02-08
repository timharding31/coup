import { createContext, useEffect, useCallback, useState } from 'react'
import { useLocation, useMatches, useNavigate } from '@remix-run/react'
import { ref, onValue, off } from 'firebase/database'
import type { Game, TargetedActionType, UntargetedActionType, TurnState } from '~/types'
import { getActionFromType } from '~/utils/action'
import { getFirebaseDatabase } from '~/utils/firebase.client'
import { prepareGameForClient } from '~/utils/game'
import { getGameUrl } from '~/utils/url'

export interface GameSocketContextType {
  game: Game<'client'>
  turn: TurnState | null
  error: string | null
  startGame: () => void
  performTargetedAction: (actionType: TargetedActionType, targetPlayerId: string) => void
  performUntargetedAction: (actionType: UntargetedActionType) => void
  selectCard: (cardId: string) => void
  sendResponse: (response: 'accept' | 'challenge' | 'block') => void
  exchangeCards: (selectedCardIds: string[]) => void
}

interface GameSocketProviderProps extends React.PropsWithChildren {
  socketUrl: string
  gameId: string
  playerId: string
  game: Game<'client'>
}

export const GameSocketContext = createContext<GameSocketContextType | null>(null)

export function GameSocketProvider({
  children,
  gameId,
  playerId,
  game: initialGame
}: Omit<GameSocketProviderProps, 'socketUrl'>) {
  const navigate = useNavigate()
  const [game, setGame] = useState(initialGame)
  const [currentTurn, setCurrentTurn] = useState<TurnState | null>(initialGame?.currentTurn || null)
  const [error, setError] = useState<string | null>(null)

  const pathname = useLocation().pathname

  useEffect(() => {
    const db = getFirebaseDatabase()
    if (!db) return

    const gameRef = ref(db, `games/${gameId}`)
    const turnRef = ref(db, `games/${gameId}/currentTurn`)

    onValue(gameRef, snapshot => {
      const game = snapshot.val() as Game<'server'> | null
      if (game) {
        setGame(prepareGameForClient(game, playerId))
      }
    })

    onValue(turnRef, snapshot => {
      const turnData = snapshot.val() as TurnState | null
      setCurrentTurn(turnData)
    })

    return () => {
      off(gameRef)
      off(turnRef)
    }
  }, [gameId, pathname, navigate])

  const performAction = async (action: any) => {
    try {
      const response = await fetch(`/api/games/${gameId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, playerId })
      })
      if (!response.ok) throw new Error('Failed to perform action')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    }
  }

  const performTargetedAction = useCallback(
    (actionType: TargetedActionType, targetPlayerId: string) => {
      performAction(getActionFromType(playerId, actionType, targetPlayerId))
    },
    [gameId, playerId]
  )

  const performUntargetedAction = useCallback(
    (actionType: UntargetedActionType) => {
      performAction(getActionFromType(playerId, actionType, undefined))
    },
    [gameId, playerId]
  )

  const sendResponse = useCallback(
    async (response: 'accept' | 'challenge' | 'block') => {
      try {
        const res = await fetch(`/api/games/${gameId}/responses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response, playerId })
        })
        if (!res.ok) throw new Error('Failed to send response')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      }
    },
    [gameId, playerId]
  )

  const selectCard = useCallback(
    async (cardId: string) => {
      try {
        const res = await fetch(`/api/games/${gameId}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId, playerId })
        })
        if (!res.ok) throw new Error('Failed to select card')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      }
    },
    [gameId, playerId]
  )

  const startGame = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${gameId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })
      if (!res.ok) throw new Error('Failed to start game')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    }
  }, [gameId, playerId])

  const exchangeCards = useCallback(
    async (cardIds: string[]) => {
      try {
        const res = await fetch(`/api/games/${gameId}/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, cardIds })
        })
        if (!res.ok) throw new Error('Failed to start game')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      }
    },
    [gameId, playerId]
  )

  return (
    <GameSocketContext.Provider
      value={{
        game,
        turn: currentTurn,
        error,
        startGame,
        performTargetedAction,
        performUntargetedAction,
        sendResponse,
        selectCard,
        exchangeCards
      }}
    >
      {children}
    </GameSocketContext.Provider>
  )
}
