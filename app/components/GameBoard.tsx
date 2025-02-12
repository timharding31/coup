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
import { GameLobbyControls } from './GameLobbyControls'

interface GameBoardProps {
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerId }) => {
  const { game, startGame, sendResponse, selectCard, exchangeCards } = useGameSocket()

  const {
    myself,
    actor,
    target,
    blocker,
    challenger,
    isStartGameButtonVisible,
    isActionMenuOpen,
    isResponseMenuOpen,
    isBlockResponseMenuOpen,
    isChallengeDefenseMenuOpen,
    isBlockChallengeDefenseMenuOpen,
    isChallengePenaltyMenuOpen,
    isTargetSelectionMenuOpen,
    isExchangeReturnMenuOpen,
    isChallengeDefenseSuccessful,
    actionResponseLabel
  } = useMemo(() => deriveGameState(game, playerId), [game, playerId])

  if (!game || !myself) {
    return null
  }

  const turn = game.currentTurn

  return (
    <GameTable
      playerId={playerId}
      isActionMenuOpen={isActionMenuOpen}
      dialogNode={<GameLobbyControls game={game} playerId={playerId} startGame={startGame} />}
    >
      <Header />
      {isActionMenuOpen ? (
        <ActionControls targets={game.players.filter(p => p.id !== playerId)} coins={myself.coins} />
      ) : isResponseMenuOpen ? (
        <ResponseControls
          onResponse={sendResponse}
          heading={`${actor?.username} chose to ${turn!.action.type}${turn!.action.type === 'STEAL' ? ' from' : ''}${target?.id === playerId ? ' you' : target ? ` ${target.username}` : ''}`}
          subheading='How will you respond?'
          timeoutAt={turn!.timeoutAt}
          availableResponses={{
            canAccept: true,
            canBlock: turn!.action.canBeBlocked,
            canChallenge: turn!.action.canBeChallenged
          }}
          label={actionResponseLabel}
        />
      ) : isBlockResponseMenuOpen ? (
        <ResponseControls
          onResponse={sendResponse}
          heading={`${blocker?.username} BLOCKED your attempt to ${turn!.action.type}`}
          subheading='How will you respond?'
          timeoutAt={turn!.timeoutAt}
          availableResponses={{
            canAccept: true,
            canBlock: false,
            canChallenge: true
          }}
          label={actionResponseLabel}
        />
      ) : isChallengeDefenseMenuOpen ? (
        <CardSelector
          heading={`Your ${turn!.action.type} was CHALLENGED by ${challenger?.username}`}
          subheading={`Select a card to ${isChallengeDefenseSuccessful ? 'reveal and replace' : 'lose'}`}
          cards={myself.influence || []}
          intent={isChallengeDefenseSuccessful ? 'success' : 'danger'}
          onSubmit={([cardId]) => selectCard(cardId)}
        />
      ) : isBlockChallengeDefenseMenuOpen ? (
        <CardSelector
          heading={`Your BLOCK was CHALLENGED by ${actor?.username}`}
          subheading={`Select a card to ${isChallengeDefenseSuccessful ? 'reveal and replace' : 'lose'}`}
          cards={myself.influence || []}
          intent={isChallengeDefenseSuccessful ? 'success' : 'danger'}
          onSubmit={([cardId]) => selectCard(cardId)}
        />
      ) : isChallengePenaltyMenuOpen ? (
        <CardSelector
          heading='Your CHALLENGE was unsuccessful'
          subheading='Select a card to lose'
          cards={myself.influence || []}
          intent='danger'
          onSubmit={([cardId]) => selectCard(cardId)}
        />
      ) : isTargetSelectionMenuOpen ? (
        <CardSelector
          heading={`You have been ${turn!.action.type}${turn!.action.type === 'ASSASSINATE' ? 'D' : 'ED'} by ${actor?.username}`}
          subheading='Select a card to lose'
          cards={myself.influence || []}
          intent='danger'
          onSubmit={([cardId]) => selectCard(cardId)}
        />
      ) : isExchangeReturnMenuOpen ? (
        <CardSelector
          subheading='Select two cards to RETURN to the deck'
          heading='EXCHANGE'
          cards={myself.influence || []}
          intent='primary'
          onSubmit={exchangeCards}
          minCards={2}
          maxCards={2}
        />
      ) : null}
    </GameTable>
  )
}

interface GameState {
  myself?: Player<'client'>
  actor?: Player<'client'>
  target?: Player<'client'>
  blocker?: Player<'client'>
  challenger?: Player<'client'>
  isStartGameButtonVisible: boolean
  isActionMenuOpen: boolean
  isResponseMenuOpen: boolean
  isBlockResponseMenuOpen: boolean
  isChallengeDefenseMenuOpen: boolean
  isBlockChallengeDefenseMenuOpen: boolean
  isChallengePenaltyMenuOpen: boolean
  isTargetSelectionMenuOpen: boolean
  isExchangeReturnMenuOpen: boolean
  isChallengeDefenseSuccessful: boolean
  actionResponseLabel: string
}

function deriveGameState(game: Game<'client'>, playerId: string): GameState {
  const turn = game.currentTurn

  const actor = game.players[game.currentPlayerIndex]
  const target = game.players.find(p => p.id === turn?.action.targetPlayerId)
  const blocker = game.players.find(p => p.id === turn?.opponentResponses?.block)
  const challenger = game.players.find(p => p.id === turn?.challengeResult?.challengerId)
  const myself = game.players.find(p => p.id === playerId)

  const playerCards = myself?.influence || []

  const isActor = actor.id === myself?.id
  const isBlocker = turn ? blocker?.id === myself?.id : false
  const isChallenger = turn ? challenger?.id === myself?.id : false
  const isTarget = turn ? target?.id === myself?.id : false

  const isStartGameButtonVisible = game.status === 'WAITING' && myself?.id === game.hostId
  const isActionMenuOpen = isActor && game.status === 'IN_PROGRESS' && (!turn || !turn.action)
  const isResponseMenuOpen =
    !isActor && turn?.phase === 'AWAITING_OPPONENT_RESPONSES' && !turn.respondedPlayers?.includes(myself?.id || '')
  const isBlockResponseMenuOpen = isActor && turn?.phase === 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK'
  const isChallengeDefenseMenuOpen = isActor && turn?.phase === 'AWAITING_ACTOR_DEFENSE'
  const isBlockChallengeDefenseMenuOpen = isBlocker && turn?.phase === 'AWAITING_BLOCKER_DEFENSE'
  const isChallengePenaltyMenuOpen = isChallenger && turn?.phase === 'AWAITING_CHALLENGE_PENALTY_SELECTION'
  const isTargetSelectionMenuOpen = isTarget && turn?.phase === 'AWAITING_TARGET_SELECTION'
  const isExchangeReturnMenuOpen = isActor && turn?.phase === 'AWAITING_EXCHANGE_RETURN'

  let isChallengeDefenseSuccessful = false
  if (isChallengeDefenseMenuOpen) {
    isChallengeDefenseSuccessful = playerCards.some(p => p.type === turn.action.requiredCharacter)
  } else if (isBlockChallengeDefenseMenuOpen) {
    isChallengeDefenseSuccessful = playerCards.some(p => p.type && (turn.action.blockableBy || []).includes(p.type))
  }

  let actionResponseLabel = ''
  if (isResponseMenuOpen) {
    actionResponseLabel = turn.action.type.replace('_', ' ').toUpperCase()
  } else if (isBlockResponseMenuOpen) {
    actionResponseLabel = 'BLOCK'
  }

  return {
    actor,
    target,
    blocker,
    challenger,
    myself,
    isStartGameButtonVisible,
    isActionMenuOpen,
    isResponseMenuOpen,
    isBlockResponseMenuOpen,
    isChallengeDefenseMenuOpen,
    isBlockChallengeDefenseMenuOpen,
    isChallengePenaltyMenuOpen,
    isTargetSelectionMenuOpen,
    isExchangeReturnMenuOpen,
    isChallengeDefenseSuccessful,
    actionResponseLabel
  }
}
