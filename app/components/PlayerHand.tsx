import React from 'react'
import { Player } from '~/types'
import { PlayingCard } from './PlayingCard'
import { useGame } from '~/context/CoupContext'
import { PlayerNameTag } from './PlayerNameTag'

const GUTTER_SIZE_VW = 3

function getHeightInVw(gutterSizeInVw: number = GUTTER_SIZE_VW) {
  // Calculate card width first: (100vw - 3 * gutter) / 2
  const cardWidth = (100 - 3 * gutterSizeInVw) / 2

  // Calculate card height using inverted aspect ratio (width = 0.75 * height)
  // So height = width / 0.75
  const cardHeight = cardWidth / 0.75

  // Total height = top gutter + card height + bottom gutter
  const containerHeight = gutterSizeInVw + cardHeight

  return containerHeight.toFixed(2)
}

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
