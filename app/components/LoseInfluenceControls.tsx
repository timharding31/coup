import React from 'react'
import type { Card, CardType } from '~/types'

interface LoseInfluenceControlsProps {
  onSelectCard: (cardId: string) => void
  availableCards: Card<'client'>[]
  reason: string | null
  isDefendingChallenge: boolean
}

export const LoseInfluenceControls: React.FC<LoseInfluenceControlsProps> = ({
  onSelectCard,
  availableCards,
  reason,
  isDefendingChallenge
}) => {
  return (
    <div className='lose-influence-controls'>
      <h3>{reason}</h3>
      <p>{isDefendingChallenge ? 'Select card to prove challenge or reveal' : 'Select card to reveal'}</p>
      <div className='card-selection'>
        {availableCards
          .filter(card => !card.isRevealed)
          .map(card => (
            <button key={card.id} onClick={() => onSelectCard(card.id)} className='card-button'>
              {card.type}
            </button>
          ))}
      </div>
    </div>
  )
}
