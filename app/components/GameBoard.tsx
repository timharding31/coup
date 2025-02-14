import { useMemo } from 'react'
import { CoupContextType, useCoupContext } from '~/context/CoupContext'
import { ActionControls } from './ActionControls'
import { ResponseControls } from './ResponseControls'
import { GameTable } from './GameTable'
import { Header } from './Header'
import { CardSelector } from './CardSelector'
import { GameLobbyControls } from './GameLobbyControls'

interface GameBoardProps {
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerId }) => {
  const { game, players, sendResponse, selectCard, exchangeCards } = useCoupContext()
  const { myself, actor } = players

  const isActionMenuOpen = useMemo(() => {
    if (game.status !== 'IN_PROGRESS') return false
    if (actor.id !== playerId) return false
    return !game.currentTurn || !game.currentTurn.action
  }, [playerId, actor.id, game.status, game.currentTurn])

  return (
    <GameTable playerId={playerId} isActionMenuOpen={isActionMenuOpen}>
      <GameLobbyControls game={game} playerId={playerId} />
      {isActionMenuOpen ? (
        <ActionControls targets={game.players.filter(p => p.id !== myself.id)} coins={myself.coins} />
      ) : (
        <GameControls
          game={game}
          players={players}
          sendResponse={sendResponse}
          selectCard={selectCard}
          exchangeCards={exchangeCards}
        />
      )}
    </GameTable>
  )
}

interface GameControlsProps
  extends Pick<CoupContextType, 'game' | 'players' | 'sendResponse' | 'selectCard' | 'exchangeCards'> {}

const GameControls: React.FC<GameControlsProps> = ({ game, players, sendResponse, selectCard, exchangeCards }) => {
  const { myself, actor, target, blocker, challenger } = players

  if (game.status !== 'IN_PROGRESS' || !game.currentTurn) {
    return null
  }

  const { phase, action, timeoutAt, respondedPlayers = [] } = game.currentTurn

  switch (phase) {
    case 'ACTION_DECLARED':
    case 'ACTION_EXECUTION':
    case 'ACTION_FAILED':
    case 'TURN_COMPLETE':
      return null

    case 'AWAITING_OPPONENT_RESPONSES': {
      // Only unresponded, non-actors can respond to action
      if (actor.id === myself.id || respondedPlayers.includes(myself.id)) {
        return null
      }
      const actionMessage = `${actor.username} chose to ${action.verb.present}${target?.id === myself.id ? ' YOU' : target ? ` ${target.username}` : ''}`
      return (
        <ResponseControls
          onResponse={sendResponse}
          heading={actionMessage}
          subheading='How will you respond?'
          timeoutAt={timeoutAt}
          availableResponses={{
            canAccept: true,
            canBlock: action.canBeBlocked,
            canChallenge: action.canBeChallenged
          }}
          label={action.type.replace('_', ' ')}
        />
      )
    }

    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK': {
      // Only actor can respond to block
      if (!blocker || actor.id !== myself.id) {
        return null
      }
      return (
        <ResponseControls
          onResponse={sendResponse}
          heading={`${blocker.username} BLOCKED your attempt to ${action.type}`}
          subheading='How will you respond?'
          timeoutAt={timeoutAt}
          availableResponses={{
            canAccept: true,
            canBlock: false,
            canChallenge: true
          }}
          label='BLOCK'
        />
      )
    }

    case 'AWAITING_ACTOR_DEFENSE': {
      // Only actor can defend action challenge
      if (!challenger || actor.id !== myself.id) {
        return null
      }
      const defenseCard = myself.influence.find(c => c.type === action.requiredCharacter)
      return (
        <CardSelector
          heading={`Your ${action.type} was CHALLENGED by ${challenger.username}`}
          subheading={
            defenseCard ? `Reveal your ${defenseCard.type} to get a new card from the deck` : 'Select a card to lose'
          }
          cards={myself.influence}
          intent={defenseCard ? 'success' : 'danger'}
          onSubmit={([cardId]) => selectCard(cardId)}
          selectedCardIds={defenseCard ? [defenseCard.id] : []}
        />
      )
    }

    case 'AWAITING_BLOCKER_DEFENSE': {
      // Only blocker can defend block-challenge
      if (!blocker || blocker.id !== myself.id) {
        return null
      }
      const defenseCards = myself.influence.filter(c => (action.blockableBy || []).includes(c.type!))
      return (
        <CardSelector
          heading={`Your BLOCK was CHALLENGED by ${actor?.username}`}
          subheading={
            defenseCards.length
              ? `Reveal your ${defenseCards.map(c => c.type).join(' or ')} to get a new card from the deck`
              : 'Select a card to lose'
          }
          cards={myself.influence}
          intent={defenseCards.length ? 'success' : 'danger'}
          onSubmit={([cardId]) => selectCard(cardId)}
          selectedCardIds={defenseCards.length ? defenseCards.map(c => c.id).slice(0, 1) : []}
        />
      )
    }

    case 'AWAITING_CHALLENGE_PENALTY_SELECTION': {
      // Only challenger can select penalty card
      if (!challenger || challenger.id !== myself.id) {
        return null
      }
      return (
        <CardSelector
          heading='Your CHALLENGE was unsuccessful'
          subheading='Select a card to lose'
          cards={myself.influence}
          intent='danger'
          onSubmit={([cardId]) => selectCard(cardId)}
        />
      )
    }

    case 'AWAITING_TARGET_SELECTION': {
      // Only target can select target card
      if (!target || target.id !== myself.id) {
        return null
      }
      const actionMessage =
        action.type === 'ASSASSINATE'
          ? `You were ASSASSINATED by ${actor.username}`
          : `You were COUPED by ${actor.username}`
      return (
        <CardSelector
          heading={actionMessage}
          subheading='Select a card to lose'
          cards={myself.influence}
          intent='danger'
          onSubmit={([cardId]) => selectCard(cardId)}
        />
      )
    }

    case 'AWAITING_EXCHANGE_RETURN': {
      // Only actor can exchange cards
      if (actor.id !== myself.id) {
        return null
      }
      return (
        <CardSelector
          subheading='Select two cards to RETURN to the deck'
          heading='EXCHANGE'
          cards={myself.influence}
          intent='primary'
          onSubmit={exchangeCards}
          minCards={2}
          maxCards={2}
        />
      )
    }
  }
}
