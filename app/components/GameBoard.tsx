import { useEffect, useMemo, useState } from 'react'
import { useGameSocket } from '~/hooks/socket'
import { ActionControls } from './ActionControls'
import { ResponseControls } from './ResponseControls'
import { LoseInfluenceControls } from './LoseInfluenceControls'
import { GameTimer } from './GameTimer'
import { Link } from '@remix-run/react'
import { CardType, Game, Player, TurnState } from '~/types'
import { PlayerHand } from './PlayerHand'
import { OpponentHand } from './OpponentHand'
import { Button } from './Button'

interface GameBoardProps {
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerId }) => {
  const { game, turn, startGame, sendResponse, selectCard } = useGameSocket()

  const gameState = useMemo(() => deriveGameState(game, turn, playerId), [game, turn, playerId])

  const [isActionMenuOpen, setIsActionMenuOpen] = useState(gameState.shouldShowActionControls)
  useEffect(() => {
    if (gameState.shouldShowActionControls) setIsActionMenuOpen(true)
  }, [gameState.shouldShowActionControls])

  if (!game) return null

  const currentPlayer = game.players[game?.currentPlayerIndex ?? 0]
  const myIndex = game.players.findIndex(p => p.id === playerId)
  const myself = game.players[myIndex]
  const playerCards = myself?.influence || []

  const opponents = game.players.slice(myIndex + 1).concat(game.players.slice(0, myIndex))

  return (
    <div className='w-screen grid grid-cols-1'>
      <div>PIN: {game.pin}</div>

      {gameState.canStartGame && <Button onClick={startGame}>Start Game</Button>}

      {gameState.shouldShowActionControls && (
        <ActionControls targets={game.players.filter(p => p.id !== playerId)} coins={currentPlayer?.coins || 0} />
      )}

      {gameState.shouldShowResponseControls && (
        <ResponseControls
          onResponse={sendResponse}
          action={turn!.action}
          availableResponses={gameState.availableResponses}
        />
      )}

      {gameState.shouldShowBlockResponseControls && (
        <ResponseControls
          onResponse={sendResponse}
          action={turn!.action}
          availableResponses={{
            canAccept: true,
            canBlock: false,
            canChallenge: true
          }}
        />
      )}

      {gameState.shouldShowCardSelection && (
        <LoseInfluenceControls
          onSelectCard={selectCard}
          availableCards={playerCards}
          reason={gameState.cardSelectionMessage}
          isDefendingChallenge={gameState.isDefendingChallenge}
        />
      )}

      {turn?.timeoutAt && <GameTimer timeoutAt={turn.timeoutAt} />}

      <div className='grid grid-cols-3'>
        {opponents.map((player, i) => (
          <OpponentHand key={`oppo-${i}`} {...player} />
        ))}
      </div>
      {myself != null && <PlayerHand {...myself} />}
    </div>
  )
}

interface GameStateConditions {
  canStartGame: boolean
  shouldShowActionControls: boolean
  shouldShowResponseControls: boolean
  shouldShowBlockResponseControls: boolean
  shouldShowCardSelection: boolean
  availableResponses: {
    canAccept: boolean
    canBlock: boolean
    canChallenge: boolean
  }
  cardSelectionMessage: string | null
  isDefendingChallenge: boolean
}

function deriveGameState(game: Game<'client'> | null, turn: TurnState | null, playerId: string): GameStateConditions {
  if (!game || game.status !== 'IN_PROGRESS') {
    return {
      canStartGame: game?.hostId === playerId && game.status === 'WAITING',
      shouldShowActionControls: false,
      shouldShowResponseControls: false,
      shouldShowBlockResponseControls: false,
      shouldShowCardSelection: false,
      availableResponses: { canAccept: false, canBlock: false, canChallenge: false },
      cardSelectionMessage: null,
      isDefendingChallenge: false
    }
  }

  const currentPlayer = game.players[game.currentPlayerIndex]

  if (!turn || !turn.action || turn.phase === 'WAITING_FOR_ACTION') {
    return {
      canStartGame: false,
      shouldShowActionControls: currentPlayer?.id === playerId,
      shouldShowResponseControls: false,
      shouldShowBlockResponseControls: false,
      shouldShowCardSelection: false,
      availableResponses: { canAccept: false, canBlock: false, canChallenge: false },
      cardSelectionMessage: null,
      isDefendingChallenge: false
    }
  }

  // Determine if player needs to reveal a card
  const isDefendingActionChallenge =
    turn?.phase === 'WAITING_FOR_DEFENSE_REVEAL' && turn.action.playerId === playerId && !turn.blockingPlayer
  const isDefendingBlockChallenge = turn?.phase === 'WAITING_FOR_DEFENSE_REVEAL' && turn.blockingPlayer === playerId

  const isDefendingChallenge = isDefendingActionChallenge || isDefendingBlockChallenge

  const isFailedChallenger =
    turn?.phase === 'WAITING_FOR_CHALLENGE_PENALTY' && turn.challengeResult?.challengingPlayer === playerId

  const isTargetedPlayer = turn?.phase === 'WAITING_FOR_TARGET_REVEAL' && turn.action.targetPlayerId === playerId

  return {
    canStartGame: false,

    shouldShowActionControls: false,

    shouldShowResponseControls:
      currentPlayer?.id !== playerId &&
      turn?.phase === 'WAITING_FOR_REACTIONS' &&
      !turn.respondedPlayers?.includes(playerId),

    shouldShowBlockResponseControls:
      currentPlayer?.id === playerId &&
      turn?.phase === 'WAITING_FOR_BLOCK_RESPONSE' &&
      !turn.respondedPlayers?.includes(playerId),

    shouldShowCardSelection: isDefendingChallenge || isFailedChallenger || isTargetedPlayer,

    isDefendingChallenge,

    cardSelectionMessage: isDefendingChallenge
      ? `Your ${isDefendingBlockChallenge ? `BLOCK of ${currentPlayer.username}'s ${turn.action.type}` : turn.action.type} has been challenged!`
      : isFailedChallenger
        ? 'Your challenge was unsuccessful!'
        : isTargetedPlayer
          ? `${currentPlayer.username}'s ${turn.action.type} was successful!`
          : null,

    availableResponses: turn
      ? {
          canAccept: true,
          canBlock: turn.action.canBeBlocked,
          canChallenge: turn.action.canBeChallenged
        }
      : {
          canAccept: false,
          canBlock: false,
          canChallenge: false
        }
  }
}
