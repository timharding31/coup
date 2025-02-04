import { createContext, useContext, useEffect, useCallback, useState, ReactNode } from 'react'
import { useNavigate } from '@remix-run/react'
import { io } from 'socket.io-client'
import type { Game, Action, CoupSocket, ActionType, CardType, TargetedActionType, UntargetedActionType } from '~/types'
import { getActionFromType } from '~/utils/action'

export interface GameSocketContextType {
  game: Game | null
  error: string | null
  isConnected: boolean
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
  game: Game | null
}

export const GameSocketContext = createContext<GameSocketContextType | null>(null)

export function GameSocketProvider({
  children,
  socketUrl,
  gameId,
  playerId,
  game: initialGame
}: GameSocketProviderProps) {
  const navigate = useNavigate()
  const [socket, setSocket] = useState<CoupSocket.Client | null>(null)
  const [game, setGame] = useState<Game | null>(initialGame)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [timerExpiresAt, setTimerExpiresAt] = useState<number | null>(null)

  useEffect(() => {
    const socket: CoupSocket.Client = io(socketUrl, {
      auth: { playerId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    socket.onAny(console.log)

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('joinGameRoom', { gameId, playerId })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('reconnectSuccess', ({ game }) => {
      setGame(game)
      setIsConnected(true)
    })

    socket.on('turnTimerStarted', ({ expiresAt }) => {
      setTimerExpiresAt(expiresAt)
    })

    socket.on('turnTimerEnded', () => {
      setTimerExpiresAt(null)
    })

    socket.on('gameStateChanged', ({ game }) => {
      setGame(game)
    })

    socket.on('error', ({ message }) => {
      setError(message)
    })

    socket.on('gameEnded', () => {
      navigate('/')
    })

    setSocket(socket)

    return () => {
      socket.emit('leaveGameRoom', { gameId, playerId })
      socket.disconnect()
    }
  }, [gameId, playerId, navigate, socketUrl])

  const performTargetedAction = useCallback(
    (actionType: TargetedActionType, targetPlayerId: string) => {
      socket?.emit('gameAction', { gameId, playerId, action: getActionFromType(playerId, actionType, targetPlayerId) })
    },
    [socket, gameId, playerId]
  )

  const performUntargetedAction = useCallback(
    (actionType: UntargetedActionType) => {
      socket?.emit('gameAction', { gameId, playerId, action: getActionFromType(playerId, actionType, undefined) })
    },
    [socket, gameId, playerId]
  )

  const sendResponse = useCallback(
    (response: 'accept' | 'challenge' | 'block') => {
      socket?.emit('playerResponse', { gameId, playerId, response })
    },
    [socket, gameId, playerId]
  )

  const selectCard = useCallback(
    (cardId: string) => {
      socket?.emit('selectCard', { gameId, playerId, cardId })
    },
    [socket, gameId, playerId]
  )

  const exchangeCards = useCallback(
    (selectedCardIds: string[]) => {
      socket?.emit('exchangeCards', { gameId, playerId, selectedCardIds })
    },
    [socket, gameId, playerId]
  )

  const startGame = useCallback(() => {
    socket?.emit('startGame', { gameId, playerId })
  }, [socket, gameId, playerId])

  // const getRemainingTime = useCallback(() => {
  //   if (!timerExpiresAt) return 0
  //   const remaining = timerExpiresAt - Date.now()
  //   return Math.max(0, remaining)
  // }, [timerExpiresAt])

  return (
    <GameSocketContext.Provider
      value={{
        game,
        error,
        isConnected,
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
