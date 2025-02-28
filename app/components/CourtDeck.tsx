import React, { useState, useEffect, useRef } from 'react'
import cn from 'classnames'

const OFFSET_X = 2
const OFFSET_Y = 4
interface CourtDeckProps {
  deckCount: number
}

export const CourtDeck: React.FC<CourtDeckProps> = ({ deckCount }) => {
  const [isShuffling, setIsShuffling] = useState(false)
  const prevDeckCountRef = useRef(deckCount)

  const cardStyles = useRef(
    Array.from({ length: 15 }).map(
      (_, i) =>
        ({
          '--l': `${i * OFFSET_X}px`,
          '--t': `${Math.random() * OFFSET_Y * [-1, 1][Math.round(Math.random())]}px`,
          '--yaw': `${Math.random() * 4 * [-1, 1][Math.round(Math.random())]}deg`
        }) as React.CSSProperties
    )
  )

  // Detect changes in deckCount to trigger animation
  useEffect(() => {
    if (prevDeckCountRef.current !== deckCount) {
      setIsShuffling(true)

      const timer = setTimeout(() => {
        setIsShuffling(false)
      }, 1_000)

      // Update ref for next comparison
      prevDeckCountRef.current = deckCount

      // Clean up timer
      return () => clearTimeout(timer)
    }
  }, [deckCount])

  return (
    <div
      className={cn('relative w-[12cqi] aspect-[3/4]')}
      style={{
        transform: `translateX(calc(-${(OFFSET_X * deckCount) / 2}px))`
      }}
    >
      {Array.from({ length: deckCount }).map((_, i) => (
        <div
          key={`court-deck-${i}`}
          className={cn('card-container court-deck-card', {
            shuffling: isShuffling
          })}
          style={{
            ...cardStyles.current[i],
            animationDelay: `${i * 30}ms` // Stagger animation for each card
          }}
        >
          <svg className='w-full bg-nord-10 text-nord-9 rounded-card' viewBox='0 0 404 539'>
            <use href='#card-back' />
          </svg>
        </div>
      ))}
    </div>
  )
}
