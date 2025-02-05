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
    <>
      <ul>
        <li className='inline-flex items-center gap-1'>
          {isCurrentPlayer && <span className='inline-block rounded-full bg-nord-13 w-2 h-2' />}
          Username: {username}
        </li>
        <li>Coins: {coins}</li>
      </ul>
      <div className={`grid grid-cols-${influence.length} gap-2`}>
        {influence.map(card => (
          <PlayingCard key={card.id} isFaceDown={!game || game.status === 'WAITING'} {...card} />
        ))}
      </div>
    </>
  )
}
