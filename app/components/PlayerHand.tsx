import React from 'react'
import { Player } from '~/types'
import { PlayingCard } from './PlayingCard'
import { useGame } from '~/context/CoupContext'
import { PlayerNameTag } from './PlayerNameTag'

export interface PlayerHandProps extends Player<'client'> {}

export const PlayerHand: React.FC<PlayerHandProps> = ({ influence, ...nameTagProps }) => {
  const game = useGame()

  return (
    <div className='grid grid-rows-[auto_auto] px-4 pb-4'>
      <PlayerNameTag {...nameTagProps} className='text-lg my-3' bgColor='nord-0' />
      <div className='grid grid-cols-2 gap-4'>
        {influence.slice(0, 2).map(card => (
          <PlayingCard key={card.id} isFaceDown={!game || game.status === 'WAITING'} {...card} />
        ))}
      </div>
    </div>
  )
}
