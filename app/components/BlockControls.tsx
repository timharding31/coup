import React from 'react'
import type { Action, CardType } from '~/types'

interface BlockControlsProps {
  onResponse: (response: 'accept' | 'challenge' | 'block', blockingCard?: CardType) => void
  action: Action
  availableBlocks: CardType[]
}

export const BlockControls: React.FC<BlockControlsProps> = ({ onResponse, action, availableBlocks }) => {
  return (
    <div className='block-controls'>
      <h3>Block {action.type} with:</h3>
      <div className='block-options'>
        {availableBlocks.map(card => (
          <button key={card} onClick={() => onResponse('block', card)} className='block-button'>
            {card} ({getBlockDescription(card, action.type)})
          </button>
        ))}
      </div>
    </div>
  )
}

function getBlockDescription(card: CardType, actionType: string): string {
  switch (card) {
    case 'CONTESSA':
      return 'Blocks Assassination'
    case 'AMBASSADOR':
      return 'Blocks Stealing'
    case 'CAPTAIN':
      return 'Blocks Stealing'
    case 'DUKE':
      return 'Blocks Foreign Aid'
    default:
      return ''
  }
}
