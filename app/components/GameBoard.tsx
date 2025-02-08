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
import { GameTable } from './GameTable'
import { Header } from './Header'
import { ExchangeReturnControls } from './ExchangeReturnControls'
import { CardSelector } from './CardSelector'

interface GameBoardProps {
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerId }) => {
  const { game, turn, startGame, sendResponse, selectCard, exchangeCards } = useGameSocket()

  const gameState = useMemo(() => deriveGameState(game, turn, playerId), [game, turn, playerId])

  if (!game) {
    return null
  }

  const currentPlayer = game.players[game?.currentPlayerIndex ?? 0]
  const myIndex = game.players.findIndex(p => p.id === playerId)
  const myself = game.players[myIndex]
  const playerCards = myself?.influence || []

  if (!myself) {
    return null
  }

  return (
    <GameTable playerId={playerId} isActionMenuOpen={gameState.shouldShowActionControls}>
      <Header />

      {game.status === 'WAITING' && myself.id === game.hostId && (
        <div className='absolute z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]'>
          <Button type='button' variant='success' onClick={startGame} disabled={game.players.length < 2}>
            Start Game
          </Button>
        </div>
      )}

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
        <CardSelector
          cards={playerCards}
          intent={
            gameState.isDefendingChallenge &&
            playerCards.some(card => card.type === game.currentTurn?.action.requiredCharacter)
              ? 'success'
              : 'danger'
          }
          onSubmit={([cardId]) => selectCard(cardId)}
          heading={gameState.isDefendingChallenge ? 'You have been challenged' : `Lose Influence`}
          subheading={gameState.isDefendingChallenge ? 'Select card to reveal or lose' : `Select a card to lose`}
          buttonText='Confirm'
        />
      )}

      {gameState.shouldShowExchangeReturn && (
        <CardSelector
          cards={playerCards}
          intent='primary'
          heading='Exchange'
          subheading='Select cards to RETURN to the deck'
          onSubmit={exchangeCards}
          minCards={2}
          maxCards={2}
          buttonText='Confirm'
        />
      )}
    </GameTable>
  )
}

interface GameStateConditions {
  canStartGame: boolean
  shouldShowActionControls: boolean
  shouldShowResponseControls: boolean
  shouldShowBlockResponseControls: boolean
  shouldShowCardSelection: boolean
  shouldShowExchangeReturn: boolean
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
      shouldShowExchangeReturn: false,
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
      shouldShowExchangeReturn: false,
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
      !turn.respondedPlayers?.includes(playerId) &&
      (!turn.action.targetPlayerId || turn.action.targetPlayerId === playerId),

    shouldShowBlockResponseControls:
      currentPlayer?.id === playerId &&
      turn?.phase === 'WAITING_FOR_BLOCK_RESPONSE' &&
      !turn.respondedPlayers?.includes(playerId),

    shouldShowCardSelection: isDefendingChallenge || isFailedChallenger || isTargetedPlayer,

    shouldShowExchangeReturn: currentPlayer?.id === playerId && turn?.phase === 'WAITING_FOR_EXCHANGE_RETURN',

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
