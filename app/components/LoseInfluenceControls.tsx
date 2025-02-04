import React from 'react'
import type { Card, CardType } from '~/types'

interface LoseInfluenceControlsProps {
  onSelectCard: (cardId: string) => void
  availableCards: Card[]
  reason?: 'CHALLENGE_LOST' | 'COUP' | 'ASSASSINATE'
}

export const LoseInfluenceControls: React.FC<LoseInfluenceControlsProps> = ({
  onSelectCard,
  availableCards,
  reason
}) => {
  return (
    <div className='lose-influence-controls'>
      <h3>Lose Influence {getLoseReason(reason)}</h3>
      <div className='card-selection'>
        {availableCards.map(card => (
          <button key={card.id} onClick={() => onSelectCard(card.id)} className='card-button'>
            Reveal {card.type}
          </button>
        ))}
      </div>
    </div>
  )
}

function getLoseReason(reason = ''): string {
  switch (reason) {
    case 'CHALLENGE_LOST':
      return '(Challenge Lost)'
    case 'COUP':
      return '(Coup)'
    case 'ASSASSINATE':
      return '(Assassinated)'
    default:
      return ''
  }
}
