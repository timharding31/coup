import { useEffect, useState } from 'react'
import { CoupContextType } from '~/context/CoupContext'
import { ActionControls } from './ActionControls'
import { ResponseControls } from './ResponseControls'
import { CardSelector } from './CardSelector'
import { getResponseMenuProps } from '~/utils/game'
import { TimeoutProgressBar } from './TimeoutProgressBar'

export interface GameControlsProps
  extends Pick<CoupContextType, 'game' | 'players' | 'sendResponse' | 'selectCard' | 'exchangeCards' | 'isLoading'> {}

export const GameControls: React.FC<GameControlsProps> = ({
  game,
  players,
  sendResponse,
  selectCard,
  exchangeCards,
  isLoading
}) => {
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined
    if (!game.currentTurn?.phase) {
      timeout = setTimeout(() => {
        setIsActionMenuVisible(true)
      }, 1_000)
    }
    return () => {
      clearTimeout(timeout)
      setIsActionMenuVisible(false)
    }
  }, [game.currentTurn?.phase])

  const { myself, actor, target, blocker, challenger } = players

  if (!myself.influence.some(card => !card.isRevealed)) {
    // No controls for dead players
    return null
  }

  if (myself.id === actor.id && !game.currentTurn?.action && isActionMenuVisible) {
    return <ActionControls targets={game.players.filter(p => p.id !== myself.id)} coins={myself.coins} />
  }

  if (!game.currentTurn || game.botActionInProgress) {
    return null
  }

  const { phase, action, timeoutAt, respondedPlayers = [], opponentResponses, challengeResult } = game.currentTurn
  const { blockableBy = [] } = action
  const { challengedCaracter } = challengeResult || {}

  const { heading = '', subheading } = getResponseMenuProps(game, myself)

  switch (phase) {
    case 'ACTION_EXECUTION':
    case 'ACTION_FAILED':
    case 'TURN_COMPLETE':
      return null

    case 'AWAITING_OPPONENT_RESPONSES': {
      // Only unresponded, non-actors can respond to action
      if (respondedPlayers.includes(myself.id)) {
        return null
      }
      if (actor.id !== myself.id) {
        return (
          <ResponseControls
            onResponse={sendResponse}
            heading={heading}
            subheading={subheading}
            timeoutAt={timeoutAt}
            availableResponses={{
              canAccept: true,
              canBlock: action.canBeBlocked && (action.type === 'FOREIGN_AID' || target?.id === myself.id),
              canChallenge: action.canBeChallenged
            }}
            label={action.requiredCharacter || action.type.replace('_', ' ')}
            blockableBy={blockableBy}
            isLoading={isLoading}
          />
        )
      }
      return <TimeoutProgressBar timeoutAt={timeoutAt} />
    }

    case 'AWAITING_TARGET_BLOCK_RESPONSE':
      // Only target can respond to block
      if (target?.id !== myself.id) {
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
            canBlock: true,
            canChallenge: false
          }}
          label={action.requiredCharacter || action.type.replace('_', ' ')}
          blockableBy={blockableBy}
          isLoading={isLoading}
        />
      )

    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK': {
      // Only actor can respond to block
      if (!blocker) {
        return null
      }
      if (actor.id === myself.id) {
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
            label={opponentResponses?.claimedCard || 'BLOCK'}
            blockableBy={blockableBy}
            isLoading={isLoading}
          />
        )
      }
      if (blocker.id === myself.id) {
        return <TimeoutProgressBar timeoutAt={timeoutAt} />
      }
      break
    }

    case 'AWAITING_ACTOR_DEFENSE': {
      // Only actor can defend action challenge
      if (!challenger || actor.id !== myself.id) {
        return null
      }
      const defenseCard = myself.influence.find(c => !c.isRevealed && c.type === challengedCaracter)
      return (
        <CardSelector
          heading={heading}
          subheading={defenseCard ? subheading : 'Choose a card to lose'}
          cards={myself.influence}
          intent={defenseCard ? 'success' : 'danger'}
          onSubmit={([cardId]) => selectCard(cardId)}
          selectedCardIds={defenseCard ? [defenseCard.id] : []}
          isLoading={isLoading}
        />
      )
    }

    case 'AWAITING_BLOCKER_DEFENSE': {
      // Only blocker can defend block-challenge
      if (!blocker || blocker.id !== myself.id) {
        return null
      }
      const defenseCard = myself.influence.find(c => !c.isRevealed && c.type === challengedCaracter)
      return (
        <CardSelector
          heading={heading}
          subheading={defenseCard ? subheading : 'Choose a card to lose'}
          cards={myself.influence}
          intent={defenseCard ? 'success' : 'danger'}
          onSubmit={([cardId]) => selectCard(cardId)}
          selectedCardIds={defenseCard ? [defenseCard.id] : []}
          isLoading={isLoading}
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
          isLoading={isLoading}
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
          isLoading={isLoading}
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
          isLoading={isLoading}
        />
      )
    }
  }
}
