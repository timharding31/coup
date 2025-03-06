import React, { useState, useEffect, useRef, useMemo } from 'react'
import cn from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '~/types'

const OFFSET_X = 2
const OFFSET_Y = 4

interface CourtDeckProps {
  deck: Array<Card<'client'>>
}

export const CourtDeck: React.FC<CourtDeckProps> = ({ deck }) => {
  const [isShuffling, setIsShuffling] = useState(false)
  const prevDeckCountRef = useRef(deck.length)

  // Generate consistent card positions that won't change on re-render
  const cardStylesRef = useRef(
    Array.from({ length: 15 }).map(
      (_, i) =>
        ({
          '--l': `${i * OFFSET_X}px`,
          '--t': `${Math.random() * OFFSET_Y * (Math.random() > 0.5 ? 1 : -1)}px`,
          '--yaw': `${Math.random() * 4 * (Math.random() > 0.5 ? 1 : -1)}deg`
        }) as React.CSSProperties
    )
  )

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined
    if (prevDeckCountRef.current < deck.length) {
      setIsShuffling(true)

      timer = setTimeout(() => {
        setIsShuffling(false)
      }, 1_000)
    }
    prevDeckCountRef.current = deck.length
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [deck.length])

  return (
    <div
      className='relative w-[6vh] aspect-[3/4]'
      style={{
        transform: `translateX(calc(-${(OFFSET_X * deck.length) / 2}px))`
      }}
    >
      <AnimatePresence>
        {deck.map((card, i) => (
          <motion.div
            key={`court-deck-${card.id}`}
            layout
            layoutId={`card-${card.id}`}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              mass: 0.8,
              duration: 0.2
            }}
          >
            <div
              className={cn('card-container court-deck-card', {
                shuffling: isShuffling
              })}
              style={{
                ...cardStylesRef.current[i % cardStylesRef.current.length],
                animationDelay: `${i * 30}ms`, // Stagger animation for each card
                zIndex: deck.length - i // Ensure proper stacking order
              }}
            >
              <svg className='w-full bg-nord-10 text-nord-9 rounded-card' viewBox='0 0 404 539'>
                <use href='#card-back' />
              </svg>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
