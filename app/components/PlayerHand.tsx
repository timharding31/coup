import React from 'react'
import { GameStatus, Player } from '~/types'
import { PlayingCard } from './PlayingCard'
import { useGame } from '~/hooks/socket'

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

export const PlayerHand: React.FC<PlayerHandProps> = ({ influence, coins }) => {
  const game = useGame()
  return (
    <div className='grid grid-rows-[auto_auto] px-2 pb-2'>
      <div>Coins: {coins}</div>
      <div className={`grid grid-cols-${influence.length} gap-2`}>
        {influence.map(card => (
          <PlayingCard key={card.id} isFaceDown={!game || game.status === 'WAITING'} {...card} />
        ))}
      </div>
    </div>
  )
}
