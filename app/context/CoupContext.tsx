import { createContext, useEffect, useCallback, useState, useMemo, useRef, useContext } from 'react'
import { redirect } from '@remix-run/react'
import { ref, onValue } from 'firebase/database'
import {
  Game,
  TargetedActionType,
  UntargetedActionType,
  Player,
  TurnPhase,
  CardType,
  OpponentBlockResponse,
  OpponentChallengeResponse
} from '~/types'
import { getActionFromType } from '~/utils/action'
import { getFirebaseDatabase } from '~/utils/firebase.client'
import { prepareGameForClient } from '~/utils/game'
import { useMessageQueue } from '~/hooks/useMessageQueue'
import { getPlayerActionMessages, getResponderMessage, MessageData } from '~/utils/messages'

export interface CoupContextType {
  game: Game<'client'>
  error: string | null
  isLoading: boolean
  players: {
    myself: Player<'client'>
    actor: Player<'client'>
    blocker?: Player<'client'>
    challenger?: Player<'client'>
    target?: Player<'client'>
    all: Array<Player<'client'>>
  }
  playerMessages: Map<string, MessageData>
  startGame: () => Promise<void>
  leaveGame: () => Promise<void>
  performTargetedAction: (actionType: TargetedActionType, targetPlayerId: string) => Promise<void>
  performUntargetedAction: (actionType: UntargetedActionType) => Promise<void>
  selectCard: (cardId: string) => Promise<void>
  sendResponse: (response: 'accept' | 'challenge' | 'block', blockCard?: CardType) => Promise<void>
  exchangeCards: (selectedCardIds: string[]) => Promise<void>
  updatePlayer: (update: Partial<Player>) => Promise<void>
  addBot: () => Promise<void>
}

interface CoupContextProviderProps extends React.PropsWithChildren {
  gameId: string
  playerId: string
  game: Game<'client'>
}

export const CoupContext = createContext<CoupContextType | null>(null)

export const CoupContextProvider: React.FC<CoupContextProviderProps> = ({
  children,
  gameId,
  playerId,
  game: initialGame
}) => {
  const [game, setGame] = useState(initialGame)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const turnPhaseRef = useRef<TurnPhase | null>(null)
  const opponentResponsesRef = useRef<OpponentBlockResponse | OpponentChallengeResponse | null>(null)
  const respondedPlayersRef = useRef<string[]>([])

  // Use our new message queue hook
  const { messages: playerMessages, updateMessages, clearPlayerMessages } = useMessageQueue()

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
        const { playerId: actorId } = turn?.action || {}
        const { block: blockerId, challenge: challengerId } = opponentResponses || {}

        // Process responded players messages
        if (!isEqual(respondedPlayers, respondedPlayersRef.current)) {
          // Create a map of responder messages using our new data structure
          const responderMessages: Record<string, MessageData> = {}
          for (const playerId of respondedPlayers) {
            const message = getResponderMessage(playerId, actorId || '', turn?.phase, blockerId, challengerId)
            if (message) {
              responderMessages[playerId] = message
            }
          }
          updateMessages(responderMessages)
        }

        const wasBlockRegistered = opponentResponses?.block && !opponentResponsesRef.current?.block
        const wasChallengeRegistered = opponentResponses?.challenge && !opponentResponsesRef.current?.challenge

        if (wasBlockRegistered || wasChallengeRegistered) {
          clearPlayerMessages(respondedPlayers.filter(id => id !== blockerId && id !== challengerId))
        }

        // Process turn phase messages
        if (turn?.phase !== turnPhaseRef.current) {
          const newMessages = getPlayerActionMessages(game)
          if (newMessages) {
            updateMessages(newMessages, { clear: !turn?.phase })
          }
        }

        // There's no specific phase for replacing a card that was used as successful challenge defense, it happens automatically while the challenger selects their penalty
        if (turn?.phase === 'AWAITING_CHALLENGE_PENALTY_SELECTION') {
          const challengeDefender = players.find(
            player => player.id === (turn.opponentResponses?.block || turn.action.playerId)
          )
          if (challengeDefender) {
            const challengeDefenseCard = challengeDefender.influence.find(card => card.isChallengeDefenseCard)
            if (challengeDefenseCard?.type) {
              updateMessages({
                [challengeDefender.id]: {
                  text: 'Replacing',
                  type: 'success',
                  isWaiting: true,
                  cardType: challengeDefenseCard.type
                }
              })
            } else {
              clearPlayerMessages([challengeDefender.id])
            }
          }
        }

        turnPhaseRef.current = turn?.phase || null
        opponentResponsesRef.current = opponentResponses || null
        respondedPlayersRef.current = respondedPlayers
      }
    }

    const unsubscribe = onValue(gameRef, onSnapshotCallback)

    return () => {
      unsubscribe()
    }
  }, [gameId, playerId, updateMessages, clearPlayerMessages])

  const performAction = async (action: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/games/${gameId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, playerId })
      })
      if (!response.ok) throw new Error('Failed to perform action')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      return setIsLoading(false)
    }
  }

  const performTargetedAction = useCallback(
    async (actionType: TargetedActionType, targetPlayerId: string) => {
      setIsLoading(true)
      const targetedAction = getActionFromType(playerId, actionType, targetPlayerId)
      try {
        return await performAction(targetedAction)
      } finally {
        return setIsLoading(false)
      }
    },
    [gameId, playerId]
  )

  const performUntargetedAction = useCallback(
    async (actionType: UntargetedActionType) => {
      setIsLoading(true)
      const untargetedAction = getActionFromType(playerId, actionType)
      try {
        return await performAction(untargetedAction)
      } finally {
        return setIsLoading(false)
      }
    },
    [gameId, playerId]
  )

  const sendResponse = useCallback(
    async (response: 'accept' | 'challenge' | 'block', blockCard?: CardType) => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/games/${gameId}/responses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response, playerId, blockCard })
        })
        if (!res.ok) throw new Error('Failed to send response')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        return setIsLoading(false)
      }
    },
    [gameId, playerId]
  )

  const selectCard = useCallback(
    async (cardId: string) => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/games/${gameId}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId, playerId })
        })
        if (!res.ok) throw new Error('Failed to select card')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        return setIsLoading(false)
      }
    },
    [gameId, playerId]
  )

  const startGame = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/games/${gameId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })
      if (!res.ok) throw new Error('Failed to start game')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      return setIsLoading(false)
    }
  }, [gameId, playerId])

  const leaveGame = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/games/${gameId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })
      if (!res.ok) throw new Error('Failed to leave game')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      return setIsLoading(false)
    }
  }, [gameId, playerId])

  const exchangeCards = useCallback(
    async (cardIds: string[]) => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/games/${gameId}/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, cardIds })
        })
        if (!res.ok) throw new Error('Failed to start game')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        return setIsLoading(false)
      }
    },
    [gameId, playerId]
  )

  const updatePlayer = useCallback(
    async (update: Partial<Player>) => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/games/${gameId}/players/${playerId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...update })
        })
        if (!res.ok) throw new Error('Failed to start game')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        return setIsLoading(false)
      }
    },
    [gameId, playerId]
  )

  const addBot = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/games/${gameId}/bots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error('Failed to start game')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      return setIsLoading(false)
    }
  }, [gameId])

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
        addBot,
        players: { myself, actor, blocker, challenger, target, all: game.players },
        playerMessages,
        isLoading
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

export function usePlayerMessage(playerId: string): MessageData | null {
  const { playerMessages } = useContext(CoupContext) || {}
  return playerMessages?.get(playerId) || null
}

function isEqual<T = string>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
