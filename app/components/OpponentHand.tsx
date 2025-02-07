import React from 'react'
import styles from './styles.css'
import { PlayerHand, PlayerHandProps } from './PlayerHand'
import { PlayingCard } from './PlayingCard'
import { useGame } from '~/hooks/socket'

interface OpponentHandProps extends PlayerHandProps {
  isCurrentPlayer?: boolean
}

export const OpponentHand: React.FC<OpponentHandProps> = ({ username, influence, coins, isCurrentPlayer = false }) => {
  const game = useGame()

  return (
    <div className='flex flex-col items-center justify-center gap-2'>
      <div className='text-xl text-center relative pr-8'>
        {username}
        <span className='absolute right-0 top-[50%] translate-y-[-50%] inline-flex items-center justify-center text-nord-13'>
          <svg width='18' height='18' viewBox='-32 -32 64 64'>
            <use href='#dollar' />
          </svg>
          <span className='ml-[-4px] font-bold text-base'>{coins}</span>
        </span>
      </div>
      <div className={`flex-auto w-full grid grid-cols-${influence.length} gap-2`}>
        {influence.map(card => (
          <PlayingCard key={card.id} isFaceDown={!game || game.status === 'WAITING'} {...card} />
        ))}
      </div>
    </div>
  )
}
