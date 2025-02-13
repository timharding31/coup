import { createContext, useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { toast } from 'react-toastify'
import { redirect } from '@remix-run/react'
import { ref, onValue } from 'firebase/database'
import { Game, TargetedActionType, UntargetedActionType, Player, TurnPhase } from '~/types'
import { getActionFromType } from '~/utils/action'
import { getFirebaseDatabase } from '~/utils/firebase.client'
import { getTurnPhaseMessage, prepareGameForClient } from '~/utils/game'
import { DataSnapshot } from 'firebase-admin/database'
import _ from 'lodash'

export interface GameSocketContextType {
  game: Game<'client'>
  error: string | null
  startGame: () => void
  performTargetedAction: (actionType: TargetedActionType, targetPlayerId: string) => void
  performUntargetedAction: (actionType: UntargetedActionType) => void
  selectCard: (cardId: string) => void
  sendResponse: (response: 'accept' | 'challenge' | 'block') => void
  exchangeCards: (selectedCardIds: string[]) => void
  myself: Player<'client'>
  actor: Player<'client'>
  blocker?: Player<'client'>
  challenger?: Player<'client'>
  target?: Player<'client'>
}

interface GameSocketProviderProps extends React.PropsWithChildren {
  socketUrl: string
  gameId: string
  playerId: string
  game: Game<'client'>
}

export const GameSocketContext = createContext<GameSocketContextType | null>(null)

const THROTTLE_DELAY_MS = 500
const DELAY_BETWEEN_TOASTS_MS = 1_000

export function GameSocketProvider({
  children,
  gameId,
  playerId,
  game: initialGame
}: Omit<GameSocketProviderProps, 'socketUrl'>) {
  const [game, setGame] = useState(initialGame)
  const [error, setError] = useState<string | null>(null)
  const turnPhaseRef = useRef<TurnPhase | null>(null)

  // These refs help with debouncing the toast updates:
  const lastToastTimeRef = useRef(Date.now())
  const pendingToastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const db = getFirebaseDatabase()
    if (!db) return

    const gameRef = ref(db, `games/${gameId}`)

    const throttledOnSnapshotCallback = _.throttle((snapshot: any): void => {
      const game = snapshot.val() as Game<'server'> | null
      if (game) {
        const preparedGame = prepareGameForClient(game, playerId)
        setGame(preparedGame)
        const turnPhase = game.currentTurn?.phase || null
        if (turnPhase !== turnPhaseRef.current) {
          const turnPhaseMessage: string = getTurnPhaseMessage(preparedGame)
          const now = Date.now()
          const delayForToast = Math.max(0, DELAY_BETWEEN_TOASTS_MS - (now - lastToastTimeRef.current))

          // Clear any pending update so that only the latest turn phase message is shown
          if (pendingToastTimeoutRef.current) {
            clearTimeout(pendingToastTimeoutRef.current)
          }

          pendingToastTimeoutRef.current = setTimeout(() => {
            const toastContent = <p className='text-nord-6 text-sm font-bold font-robotica'>{turnPhaseMessage}</p>

            if (!toast.isActive('TURN_PHASE_TOAST')) {
              toast(toastContent, {
                toastId: 'TURN_PHASE_TOAST',
                autoClose: 10_000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
              })
            } else {
              toast.update('TURN_PHASE_TOAST', {
                render: toastContent,
                autoClose: 10_000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
              })
            }
            lastToastTimeRef.current = Date.now()
            pendingToastTimeoutRef.current = null
          }, delayForToast)

          turnPhaseRef.current = turnPhase
        }
      }
    }, THROTTLE_DELAY_MS)

    const unsubscribe = onValue(gameRef, throttledOnSnapshotCallback)

    return () => {
      unsubscribe()
      throttledOnSnapshotCallback.cancel()
      if (pendingToastTimeoutRef.current) clearTimeout(pendingToastTimeoutRef.current)
    }
  }, [gameId, playerId])

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
      const targetedAction = getActionFromType(playerId, actionType, targetPlayerId)
      performAction(targetedAction)
    },
    [gameId, playerId]
  )

  const performUntargetedAction = useCallback(
    (actionType: UntargetedActionType) => {
      const untargetedAction = getActionFromType(playerId, actionType)
      performAction(untargetedAction)
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

  const actor = useMemo(() => game.players[game.currentPlayerIndex], [game.players, game.currentPlayerIndex])

  const myself = useMemo(() => game.players.find(p => p.id === playerId), [game.players, playerId])

  const blocker = useMemo(
    () => game.players.find(p => p.id === game.currentTurn?.opponentResponses?.block),
    [game.players, game.currentTurn?.opponentResponses]
  )

  const challenger = useMemo(
    () => game.players.find(p => p.id === game.currentTurn?.challengeResult?.challengerId),
    [game.players, game.currentTurn?.challengeResult]
  )

  const target = useMemo(
    () => game.players.find(p => p.id === game.currentTurn?.action.targetPlayerId),
    [game.players, game.currentTurn?.action]
  )

  if (!myself) {
    throw redirect('/')
  }

  return (
    <GameSocketContext.Provider
      value={{
        game,
        error,
        startGame,
        performTargetedAction,
        performUntargetedAction,
        sendResponse,
        selectCard,
        exchangeCards,
        myself,
        actor,
        blocker,
        challenger,
        target
      }}
    >
      {children}
    </GameSocketContext.Provider>
  )
}
