import React from 'react'
import { PlayingCard } from './PlayingCard'
import { useGame } from '~/hooks/socket'
import { Player } from '~/types'
import { PlayerNameTag } from './PlayerNameTag'

interface OpponentHandProps extends Player<'client'> {
  isCurrentPlayer?: boolean
}

export const OpponentHand: React.FC<OpponentHandProps> = ({ isCurrentPlayer = false, influence, ...nameTagProps }) => {
  const game = useGame()

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-xl transition-[scale] duration-500 ${isCurrentPlayer ? 'scale-105 outline-2 outline-offset-4 outline-nord-14 outline' : ''}`}
    >
      <PlayerNameTag {...nameTagProps} />
      <div className={`flex-auto w-full grid grid-cols-${influence.length} gap-2`}>
        {influence.map(card => (
          <PlayingCard key={card.id} isFaceDown={!game || game.status === 'WAITING'} {...card} />
        ))}
      </div>
    </div>
  )
}
