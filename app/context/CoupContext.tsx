import { createContext, useEffect, useCallback, useState, useMemo, useRef, useContext } from 'react'
import { redirect } from '@remix-run/react'
import { ref, onValue } from 'firebase/database'
import {
  Game,
  TargetedActionType,
  UntargetedActionType,
  Player,
  TurnPhase,
  NordColor,
  PlayerMessage,
  CardType
} from '~/types'
import { getActionFromType } from '~/utils/action'
import { getFirebaseDatabase } from '~/utils/firebase.client'
import { getPlayerActionMessages, prepareGameForClient } from '~/utils/game'
import _ from 'lodash'

export interface CoupContextType {
  game: Game<'client'>
  error: string | null
  players: {
    myself: Player<'client'>
    actor: Player<'client'>
    blocker?: Player<'client'>
    challenger?: Player<'client'>
    target?: Player<'client'>
  }
  playerMessages: Map<string, PlayerMessage>
  startGame: () => Promise<void>
  leaveGame: () => Promise<void>
  performTargetedAction: (actionType: TargetedActionType, targetPlayerId: string) => Promise<void>
  performUntargetedAction: (actionType: UntargetedActionType) => Promise<void>
  selectCard: (cardId: string) => Promise<void>
  sendResponse: (response: 'accept' | 'challenge' | 'block', blockCard?: CardType) => Promise<void>
  exchangeCards: (selectedCardIds: string[]) => Promise<void>
  updatePlayer: (update: Partial<Player>) => Promise<void>
}

interface CoupContextProviderProps extends React.PropsWithChildren {
  gameId: string
  playerId: string
  game: Game<'client'>
}

export const CoupContext = createContext<CoupContextType | null>(null)

const MESSAGE_DELAY_MS = 500

export const CoupContextProvider: React.FC<CoupContextProviderProps> = ({
  children,
  gameId,
  playerId,
  game: initialGame
}) => {
  const [game, setGame] = useState(initialGame)
  const [error, setError] = useState<string | null>(null)
  const turnPhaseRef = useRef<TurnPhase | null>(null)
  const respondedPlayersRef = useRef<string[]>([])
  const messageUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [playerMessages, setPlayerMessages] = useState(new Map<string, PlayerMessage>())
  const messageQueueRef = useRef<Array<() => void>>([])
  const processingQueueRef = useRef(false)

  // Function to process the message queue with delay between messages
  const processMessageQueue = useCallback(() => {
    if (messageQueueRef.current.length === 0) {
      processingQueueRef.current = false
      return
    }

    processingQueueRef.current = true
    const updateFn = messageQueueRef.current.shift()

    if (updateFn) {
      updateFn()
    }

    messageUpdateTimeoutRef.current = setTimeout(() => {
      messageUpdateTimeoutRef.current = null
      processMessageQueue()
    }, MESSAGE_DELAY_MS)
  }, [])

  // Function to schedule a message update
  const scheduleMessageUpdate = useCallback(
    (updateFn: () => void) => {
      messageQueueRef.current.push(updateFn)

      if (!processingQueueRef.current) {
        processMessageQueue()
      }
    },
    [processMessageQueue]
  )

  useEffect(() => {
    const db = getFirebaseDatabase()
    if (!db) return

    const gameRef = ref(db, `games/${gameId}`)

    const onSnapshotCallback = (snapshot: any): void => {
      const serverGameValue = snapshot.val() as Game<'server'> | null
      if (serverGameValue) {
        const game = prepareGameForClient(serverGameValue, playerId)
        setGame(game)

        const { currentTurn: turn, players } = game
        const { respondedPlayers = [], opponentResponses } = turn || {}
        const { block: blockerId, challenge: challengerId } = opponentResponses || {}

        // Process responded players messages with delay
        if (!_.isEqual(respondedPlayers, respondedPlayersRef.current)) {
          scheduleMessageUpdate(() => {
            for (const responderId of respondedPlayers) {
              setPlayerMessages(prev => {
                const existing = prev.get(responderId)

                const next: PlayerMessage =
                  responderId === blockerId
                    ? { message: '✗', type: 'block' }
                    : responderId === challengerId
                      ? { message: '⁉️', type: 'challenge' }
                      : { message: '✓', type: 'success' }

                return existing?.message === next.message ? prev : new Map(prev).set(responderId, next)
              })
            }
          })
        }

        // Process turn phase messages with delay
        if (turn?.phase !== turnPhaseRef.current) {
          const newMessages = getPlayerActionMessages(game)
          if (newMessages) {
            scheduleMessageUpdate(() => {
              setPlayerMessages(prev => {
                const next = turn?.phase ? new Map(prev) : new Map()
                for (const [playerId, message] of Object.entries(newMessages)) {
                  next.set(playerId, message)
                }
                return next
              })
            })
          }
        }

        // Process challenge penalty messages with delay
        if (turn?.phase === 'AWAITING_CHALLENGE_PENALTY_SELECTION') {
          scheduleMessageUpdate(() => {
            const challengeDefender = players.find(
              player => player.id === (turn.opponentResponses?.block || turn.action.playerId)
            )
            if (challengeDefender) {
              const challengeDefenseCard = challengeDefender?.influence.find(card => card.isChallengeDefenseCard)
              if (challengeDefenseCard) {
                setPlayerMessages(prev =>
                  prev.set(challengeDefender.id, { message: `Replacing ${challengeDefenseCard?.type}`, type: 'info' })
                )
              } else {
                setPlayerMessages(prev => {
                  const next = new Map(prev)
                  next.delete(challengeDefender.id)
                  return next
                })
              }
            }
          })
        }

        turnPhaseRef.current = turn?.phase || null
        respondedPlayersRef.current = respondedPlayers
      }
    }

    const unsubscribe = onValue(gameRef, onSnapshotCallback)

    return () => {
      unsubscribe()
      if (messageUpdateTimeoutRef.current) {
        clearTimeout(messageUpdateTimeoutRef.current)
      }
    }
  }, [gameId, playerId, scheduleMessageUpdate])

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
      return performAction(targetedAction)
    },
    [gameId, playerId]
  )

  const performUntargetedAction = useCallback(
    (actionType: UntargetedActionType) => {
      const untargetedAction = getActionFromType(playerId, actionType)
      return performAction(untargetedAction)
    },
    [gameId, playerId]
  )

  const sendResponse = useCallback(
    async (response: 'accept' | 'challenge' | 'block', blockCard?: CardType) => {
      try {
        const res = await fetch(`/api/games/${gameId}/responses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response, playerId, blockCard })
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

  const leaveGame = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${gameId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })
      if (!res.ok) throw new Error('Failed to leave game')
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

  const updatePlayer = useCallback(
    async (update: Partial<Player>) => {
      try {
        const res = await fetch(`/api/games/${gameId}/players/${playerId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...update })
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
    <CoupContext.Provider
      value={{
        game,
        error,
        startGame,
        leaveGame,
        performTargetedAction,
        performUntargetedAction,
        sendResponse,
        selectCard,
        exchangeCards,
        updatePlayer,
        players: { myself, actor, blocker, challenger, target },
        playerMessages
      }}
    >
      {children}
    </CoupContext.Provider>
  )
}

export function useCoupContext() {
  const value = useContext(CoupContext)
  if (!value) {
    throw new Error('useCoupContext must be used within a provider')
  }
  return value
}

export function useGame() {
  return useContext(CoupContext)?.game || null
}

export function usePlayers() {
  const { players } = useContext(CoupContext) || {}
  return players
}

export function usePlayerMessage(playerId: string): PlayerMessage | null {
  const { playerMessages } = useContext(CoupContext) || {}
  return playerMessages?.get(playerId) || null
}
