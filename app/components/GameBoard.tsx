import { useEffect, useMemo, useState } from 'react'
import { CoupContextType, useCoupContext } from '~/context/CoupContext'
import { ActionControls } from './ActionControls'
import { ResponseControls } from './ResponseControls'
import { GameTable } from './GameTable'
import { Header } from './Header'
import { CardSelector } from './CardSelector'
import { GameLobbyControls } from './GameLobbyControls'
import { getResponseMenuProps } from '~/utils/game'
import { GameOver } from './GameOver'

interface GameBoardProps {
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerId }) => {
  const { game, players, sendResponse, selectCard, exchangeCards } = useCoupContext()

  return (
    <GameTable playerId={playerId} game={game} players={players}>
      <GameLobbyControls game={game} playerId={playerId} />

      <GameControls
        game={game}
        players={players}
        sendResponse={sendResponse}
        selectCard={selectCard}
        exchangeCards={exchangeCards}
      />

      <GameOver game={game} />
    </GameTable>
  )
}

interface GameControlsProps
  extends Pick<CoupContextType, 'game' | 'players' | 'sendResponse' | 'selectCard' | 'exchangeCards'> {}

const GameControls: React.FC<GameControlsProps> = ({ game, players, sendResponse, selectCard, exchangeCards }) => {
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined
    if (!game.currentTurn?.phase) {
      timeout = setTimeout(() => {
        setIsActionMenuVisible(true)
      }, 2_000)
    }
    return () => {
      clearTimeout(timeout)
      setIsActionMenuVisible(false)
    }
  }, [game.currentTurn?.phase])

  const { myself, actor, target, blocker, challenger } = players

  if (game.status !== 'IN_PROGRESS') {
    return null
  }

  if (myself.id === actor.id && !game.currentTurn?.action && isActionMenuVisible) {
    return <ActionControls targets={game.players.filter(p => p.id !== myself.id)} coins={myself.coins} />
  }

  if (!game.currentTurn) {
    return null
  }

  const { phase, action, timeoutAt, respondedPlayers = [] } = game.currentTurn

  const { heading = '', subheading } = getResponseMenuProps(game, myself)

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
      return (
        <ResponseControls
          onResponse={sendResponse}
          heading={heading}
          subheading={subheading}
          timeoutAt={timeoutAt}
          availableResponses={{
            canAccept: true,
            canBlock: action.canBeBlocked && target?.id === myself.id,
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
          heading={heading}
          subheading={subheading}
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
          heading={heading}
          subheading={defenseCard ? subheading : 'Choose a card to lose'}
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
          heading={heading}
          subheading={defenseCards.length ? subheading : 'Choose a card to lose'}
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
          heading={heading}
          subheading={subheading}
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
      return (
        <CardSelector
          heading={heading}
          subheading={subheading}
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
          heading={heading}
          subheading={subheading}
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
