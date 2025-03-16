import { createContext, useEffect, useCallback, useState, useMemo, useRef, useContext } from 'react'
import { redirect, useNavigate } from '@remix-run/react'
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
import { useMessages } from '~/hooks/useMessages'
import { getPlayerActionMessages, MessageData } from '~/utils/messages'
import { useThrottledGameCallback } from '~/hooks/useThrottledGameCallback'
import { BotRequest, CardRequest, GameRequest, TurnRequest } from '~/types/request'

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
  performTargetedAction: (actionType: TargetedActionType, targetPlayerId: string) => Promise<void>
  performUntargetedAction: (actionType: UntargetedActionType) => Promise<void>
  selectCard: (cardId: string) => Promise<void>
  sendResponse: (response: 'accept' | 'challenge' | 'block', blockCard?: CardType) => Promise<void>
  exchangeCards: (selectedCardIds: string[]) => Promise<void>
  updatePlayer: (update: Partial<Player>) => Promise<void>
  addBot: () => Promise<void>
  removeBot: (botId: string) => Promise<void>
  startGame: () => Promise<void>
  handleRematch: () => Promise<void>
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
  const { messages: playerMessages, updateMessages, clearPlayerMessages } = useMessages()
  const navigate = useNavigate()

  const onGameCallback = useCallback(
    (game: Game<'client'>) => {
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
          if (playerId === actorId) continue
          if (playerId === challengerId) continue
          if (playerId === blockerId) continue
          responderMessages[playerId] = { text: '✓', type: 'success' }
        }
        updateMessages(responderMessages)
      }

      const wasBlockRegistered = opponentResponses?.block && !opponentResponsesRef.current?.block
      const wasChallengeRegistered = opponentResponses?.challenge && !opponentResponsesRef.current?.challenge

      if (wasBlockRegistered || wasChallengeRegistered) {
        const uninvolvedPlayers = []
        for (const player of players) {
          if (player.id === actorId) continue
          if (player.id === blockerId) continue
          if (player.id === challengerId) continue
          uninvolvedPlayers.push(player.id)
        }
        clearPlayerMessages(uninvolvedPlayers)
      }

      // Process turn phase messages
      if (turn?.phase !== turnPhaseRef.current) {
        const newMessages = getPlayerActionMessages(game)
        if (newMessages) {
          updateMessages(newMessages, { clear: !turn?.phase })
        }
      }

      turnPhaseRef.current = turn?.phase || null
      opponentResponsesRef.current = opponentResponses || null
      respondedPlayersRef.current = respondedPlayers
    },
    [setGame, updateMessages, clearPlayerMessages]
  )

  const throttledOnGameCallback = useThrottledGameCallback(onGameCallback)

  useEffect(() => {
    const db = getFirebaseDatabase()
    if (!db) return

    const gameRef = ref(db, `games/${gameId}`)

    const onSnapshotCallback = (snapshot: any): void => {
      const serverGameValue = snapshot.val() as Game<'server'> | null
      if (serverGameValue) {
        const game = prepareGameForClient(serverGameValue, playerId)
        throttledOnGameCallback(game)
      }
    }

    const unsubscribe = onValue(gameRef, onSnapshotCallback)

    return () => {
      unsubscribe()
    }
  }, [gameId, playerId, throttledOnGameCallback])

  const performAction = useCallback(
    async (action: any) => {
      setIsLoading(true)
      await handleTurnsPost('ACTION', { gameId, playerId, action }, setError).then(({ game }) => {
        if (game) throttledOnGameCallback(game)
      })
      setIsLoading(false)
    },
    [gameId, playerId]
  )

  const performTargetedAction = useCallback(
    async (actionType: TargetedActionType, targetPlayerId: string) => {
      const targetedAction = getActionFromType(playerId, actionType, targetPlayerId)
      await performAction(targetedAction)
    },
    [playerId, performAction]
  )

  const performUntargetedAction = useCallback(
    async (actionType: UntargetedActionType) => {
      const untargetedAction = getActionFromType(playerId, actionType)
      await performAction(untargetedAction)
    },
    [playerId, performAction]
  )

  const sendResponse = useCallback(
    async (response: 'accept' | 'challenge' | 'block', blockCard?: CardType) => {
      setIsLoading(true)
      await handleTurnsPost('RESPONSE', { gameId, playerId, response, blockCard }, setError).then(({ game }) => {
        if (game) throttledOnGameCallback(game)
      })
      setIsLoading(false)
    },
    [gameId, playerId]
  )

  const selectCard = useCallback(
    async (cardId: string) => {
      setIsLoading(true)
      await handleCardsPost('SELECT', { gameId, playerId, cardId }, setError).then(({ game }) => {
        if (game) throttledOnGameCallback(game)
      })
      setIsLoading(false)
    },
    [gameId, playerId]
  )

  const exchangeCards = useCallback(
    async (cardIds: string[]) => {
      setIsLoading(true)
      await handleCardsPost('EXCHANGE', { gameId, playerId, cardIds }, setError).then(({ game }) => {
        if (game) throttledOnGameCallback(game)
      })
      setIsLoading(false)
    },
    [gameId, playerId]
  )

  const updatePlayer = useCallback(
    async (update: Partial<Player>) => {
      setIsLoading(true)
      await handlePostApiRequest({
        gameId,
        playerId,
        path: `/players/${playerId}`,
        body: update,
        onError: setError
      })
      setIsLoading(false)
    },
    [gameId, playerId]
  )

  const addBot = useCallback(async () => {
    setIsLoading(true)
    await handleBotsPost('ADD', { gameId, playerId }, setError).then(({ game }) => {
      // Don't use throttledGameCallback because this happens during WAITING phase
      if (game) setGame(game)
    })
    setIsLoading(false)
  }, [gameId, playerId])

  const removeBot = useCallback(
    async (botId: string) => {
      setIsLoading(true)
      await handleBotsPost('REMOVE', { gameId, playerId, botId }, setError).then(({ game }) => {
        if (game) setGame(game)
      })
      setIsLoading(false)
    },
    [gameId, playerId]
  )

  const startGame = useCallback(async () => {
    setIsLoading(true)
    await handleGamesPost('START', { gameId, playerId }, setError).then(({ game }) => {
      if (game) setGame(game)
    })
    setIsLoading(false)
  }, [gameId, playerId])

  const handleRematch = useCallback(async () => {
    setIsLoading(true)
    await handleGamesPost('REMATCH', { gameId, playerId }, setError).then(({ game: newGame }) => {
      if (newGame) navigate(`/games/${newGame.id}`)
    })
    setIsLoading(false)
  }, [gameId, playerId])

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
        performTargetedAction,
        performUntargetedAction,
        sendResponse,
        selectCard,
        exchangeCards,
        updatePlayer,
        addBot,
        removeBot,
        startGame,
        handleRematch,
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

async function handleGamesPost<T extends GameRequest>(
  method: T extends { method: infer M } ? M : never,
  body: Omit<T, 'method'>,
  onError?: (msg: string) => void
): Promise<{ game: Game<'client'> | null }> {
  try {
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, ...body })
    })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.json()
  } catch (err) {
    onError?.(err instanceof Error ? err.message : 'Unknown error occurred')
    return { game: null }
  }
}

async function handleTurnsPost<T extends TurnRequest>(
  method: T extends { method: infer M } ? M : never,
  body: Omit<T, 'method'> & { gameId: string },
  onError?: (msg: string) => void
): Promise<{ game: Game<'client'> | null }> {
  const { gameId, ...rest } = body
  try {
    const res = await fetch(`/api/games/${gameId}/turns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, ...rest })
    })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.json()
  } catch (err) {
    onError?.(err instanceof Error ? err.message : 'Unknown error occurred')
    return { game: null }
  }
}

async function handleCardsPost<T extends CardRequest>(
  method: T extends { method: infer M } ? M : never,
  body: Omit<T, 'method'> & { gameId: string },
  onError?: (msg: string) => void
): Promise<{ game: Game<'client'> | null }> {
  const { gameId, ...rest } = body
  try {
    const res = await fetch(`/api/games/${gameId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, ...rest })
    })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.json()
  } catch (err) {
    onError?.(err instanceof Error ? err.message : 'Unknown error occurred')
    return { game: null }
  }
}

async function handleBotsPost<T extends BotRequest>(
  method: T extends { method: infer M } ? M : never,
  body: Omit<T, 'method'> & { gameId: string },
  onError?: (msg: string) => void
): Promise<{ game: Game<'client'> | null }> {
  const { gameId, ...rest } = body
  try {
    const res = await fetch(`/api/games/${gameId}/bots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, ...rest })
    })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.json()
  } catch (err) {
    onError?.(err instanceof Error ? err.message : 'Unknown error occurred')
    return { game: null }
  }
}

async function handlePostApiRequest<T>({
  gameId,
  playerId,
  path,
  body,
  onCompleted,
  onError,
  errorMessage
}: {
  gameId: string
  playerId: string
  path: string
  body: T
  onCompleted?: () => void
  onError?: (msg: string) => void
  errorMessage?: string
}): Promise<any> {
  try {
    const res = await fetch(`/api/games/${gameId}` + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, ...body })
    })
    if (!res.ok) {
      throw new Error(errorMessage || '')
    }
    return res.json()
  } catch (err) {
    onError?.(err instanceof Error ? err.message : 'Unknown error occurred')
  } finally {
    onCompleted?.()
  }
}
