import React from 'react'
import styles from './styles.css'
import { PlayerHand, PlayerHandProps } from './PlayerHand'
import { PlayingCard } from './PlayingCard'

interface OpponentHandProps extends PlayerHandProps {}

export const OpponentHand: React.FC<OpponentHandProps> = ({ username, influence, coins }) => {
  return (
    <div>
      <div>Coins: {coins}</div>
      <div className={`grid grid-cols-${influence.length} gap-2`}>
        {influence.map(card => (
          <PlayingCard key={card.id} {...card} />
        ))}
      </div>
    </div>
  )
}
