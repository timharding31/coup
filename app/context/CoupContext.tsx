import { createContext, useEffect, useCallback, useState, useMemo, useRef, useContext } from 'react'
import { redirect, useFetcher, useNavigate } from '@remix-run/react'
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
import { isBotActionInProgress, prepareGameForClient } from '~/utils/game'
import { isEqual } from '~/utils'
import { useMessages } from '~/hooks/useMessages'
import { getPlayerActionMessages, MessageData } from '~/utils/messages'
import { useThrottledGameCallback } from '~/hooks/useThrottledGameCallback'

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
  performTargetedAction: (actionType: TargetedActionType, targetPlayerId: string) => void
  performUntargetedAction: (actionType: UntargetedActionType) => void
  selectCard: (cardId: string) => void
  sendResponse: (response: 'accept' | 'challenge' | 'block', blockCard?: CardType) => void
  exchangeCards: (selectedCardIds: string[]) => void
  isBotActionInProgress: boolean
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
  const [error, setError] = useState<string | null>(null)
  const turnPhaseRef = useRef<TurnPhase | null>(null)
  const opponentResponsesRef = useRef<OpponentBlockResponse | OpponentChallengeResponse | null>(null)
  const respondedPlayersRef = useRef<string[]>([])
  const { messages: playerMessages, updateMessages, clearPlayerMessages } = useMessages()

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

  const fetcher = useFetcher()

  const performTargetedAction = useCallback(
    (actionType: TargetedActionType, targetPlayerId: string) => {
      fetcher.submit(
        {
          type: 'ACTION',
          playerId,
          action: getActionFromType(playerId, actionType, targetPlayerId)
        } as Record<string, any>,
        {
          action: `/api/games/${gameId}/turns`,
          method: 'POST',
          encType: 'application/json'
        }
      )
    },
    [gameId, playerId, fetcher]
  )

  const performUntargetedAction = useCallback(
    (actionType: UntargetedActionType) => {
      fetcher.submit(
        {
          type: 'ACTION',
          playerId,
          action: getActionFromType(playerId, actionType)
        } as Record<string, any>,
        {
          action: `/api/games/${gameId}/turns`,
          method: 'POST',
          encType: 'application/json'
        }
      )
    },
    [gameId, playerId, fetcher]
  )

  const sendResponse = useCallback(
    (response: 'accept' | 'challenge' | 'block', blockCard: CardType | null = null) => {
      fetcher.submit(
        {
          type: 'RESPONSE',
          playerId,
          response,
          blockCard
        },
        {
          action: `/api/games/${gameId}/turns`,
          method: 'POST',
          encType: 'application/json'
        }
      )
    },
    [gameId, playerId, fetcher]
  )

  const selectCard = useCallback(
    (cardId: string) => {
      fetcher.submit(
        {
          type: 'SELECT',
          playerId,
          cardId
        },
        {
          action: `/api/games/${gameId}/cards`,
          method: 'POST',
          encType: 'application/json'
        }
      )
    },
    [gameId, playerId, fetcher]
  )

  const exchangeCards = useCallback(
    (cardIds: string[]) => {
      fetcher.submit(
        {
          type: 'EXCHANGE',
          playerId,
          cardIds
        },
        {
          action: `/api/games/${gameId}/cards`,
          method: 'POST',
          encType: 'application/json'
        }
      )
    },
    [gameId, playerId, fetcher]
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

  const areBotsResponding = useMemo(() => {
    return isBotActionInProgress({
      actor: actor.id,
      phase: game.currentTurn?.phase,
      respondedPlayers: game.currentTurn?.respondedPlayers,
      players: game.players
    })
  }, [actor, game.currentTurn?.phase, game.currentTurn?.respondedPlayers, game.players])

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
        players: { myself, actor, blocker, challenger, target, all: game.players },
        playerMessages,
        isLoading: fetcher.state === 'submitting',
        isBotActionInProgress: areBotsResponding
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
