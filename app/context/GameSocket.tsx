import { createContext, useContext, useEffect, useCallback, useState, ReactNode } from 'react'
import { useNavigate } from '@remix-run/react'
import { io } from 'socket.io-client'
import type { Game, Action, CoupSocket, ActionType, CardType } from '~/types'
import { getActionFromType } from '~/utils/action'

export interface GameSocketContextType {
  game: Game | null
  error: string | null
  startGame: () => void
  performAction: (actionType: ActionType) => void
  selectCard: (cardType: CardType) => void
  sendResponse: (response: 'accept' | 'challenge' | 'block', blockingCard?: CardType) => void
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

  useEffect(() => {
    const socket: CoupSocket.Client = io(socketUrl, {
      auth: { playerId }
    })

    socket.on('connect', () => {
      socket.emit('joinGameRoom', { gameId, playerId })
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

  const performAction = useCallback(
    (actionType: ActionType) => {
      socket?.emit('gameAction', { gameId, playerId, action: getActionFromType(playerId, actionType) })
    },
    [socket, gameId, playerId]
  )

  const sendResponse = useCallback(
    (response: 'accept' | 'challenge' | 'block', blockingCard?: CardType) => {
      socket?.emit('playerResponse', { gameId, playerId, response, blockingCard })
    },
    [socket, gameId, playerId]
  )

  const selectCard = useCallback(
    (cardType: CardType) => {
      socket?.emit('selectCard', { gameId, playerId, cardType })
    },
    [socket, gameId, playerId]
  )

  const startGame = useCallback(() => {
    socket?.emit('startGame', { gameId, playerId })
  }, [socket, gameId, playerId])

  return (
    <GameSocketContext.Provider value={{ game, error, startGame, performAction, sendResponse, selectCard }}>
      {children}
    </GameSocketContext.Provider>
  )
}
