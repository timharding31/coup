import React from 'react'
import type { CardType } from '~/types'

interface LoseInfluenceControlsProps {
  onSelectCard: (card: CardType) => void
  availableCards: CardType[]
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
          <button key={card} onClick={() => onSelectCard(card)} className='card-button'>
            Reveal {card}
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
