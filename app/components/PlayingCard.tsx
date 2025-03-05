import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { Card, CardType } from '~/types'
import cn from 'classnames'
import { motion } from 'framer-motion'

const colorSchemes: Record<CardType, string> = {
  [CardType.AMBASSADOR]: 'bg-gradient-to-br from-amber-200 to-amber-600',
  [CardType.ASSASSIN]: 'bg-gradient-to-br from-emerald-900 to-black',
  [CardType.CAPTAIN]: 'bg-gradient-to-br from-slate-600 to-gray-800',
  [CardType.CONTESSA]: 'bg-gradient-to-br from-rose-400 to-orange-800',
  [CardType.DUKE]: 'bg-gradient-to-br from-cyan-600 to-purple-800'
}

const textColors: Record<CardType, string> = {
  [CardType.AMBASSADOR]: 'text-amber-900',
  [CardType.ASSASSIN]: 'text-emerald-400',
  [CardType.CAPTAIN]: 'text-slate-300',
  [CardType.CONTESSA]: 'text-teal-100',
  [CardType.DUKE]: 'text-purple-900'
}

interface PlayingCardProps extends Card<'client'> {
  isFaceDown?: boolean
  isAnimated?: boolean
  animationDelay?: number
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  id,
  type: character,
  isFaceDown,
  isRevealed,
  isAnimated = false,
  animationDelay = 0
}) => {
  const cardRef = useRef<HTMLDivElement>(null)

  const [dx, setDx] = useState<number>()
  const [dy, setDy] = useState<number>()
  const animationCalcCompleteRef = useRef(false)

  useEffect(() => {
    const card = cardRef.current

    // Skip calculation if we already have values or missing coordinates/element
    if (!card || !isAnimated || animationCalcCompleteRef.current) return

    // Set a small delay to ensure the card is properly rendered before measuring
    const courtDeck = document.getElementById('court-deck')
    const deckRect = courtDeck?.getBoundingClientRect()
    if (!deckRect) return

    const x = deckRect.left + deckRect.width / 2
    const y = deckRect.top + deckRect.height / 2

    const timer = requestAnimationFrame(() => {
      const cardRect = card.getBoundingClientRect()

      // Calculate the translation distance
      setDx(x - cardRect.left)
      setDy(y - cardRect.top)

      animationCalcCompleteRef.current = true
    })

    return () => {
      cancelAnimationFrame(timer)
      animationCalcCompleteRef.current = false
    }
  }, [isAnimated])

  // We don't need this effect anymore as the exit animation is handled directly in the motion.div

  // Let's simplify the approach to fix animation issues
  const CardWrapper = useCallback(
    ({ delay = 0, children }: React.PropsWithChildren<{ delay?: number }>) => {
      if (!isAnimated) return <>{children}</>
      if (!dx || !dy) {
        // Instead of showing nothing, render with opacity 0 until ready
        return <div className='opacity-0'>{children}</div>
      }

      return (
        <motion.div
          initial={{
            x: dx,
            y: dy,
            scale: 0.5,
            rotate: 360,
            opacity: 0.5
          }}
          animate={{
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            opacity: 1
          }}
          exit={{
            x: dx,
            y: dy,
            scale: 0.5,
            rotate: 360,
            opacity: 0,
            transition: { delay: 0 }
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 10,
            delay: delay
          }}
        >
          {children}
        </motion.div>
      )
    },
    [isAnimated, dx, dy]
  )

  if (!character || isFaceDown) {
    return (
      <CardWrapper delay={animationDelay}>
        <FaceDownCard ref={cardRef} />
      </CardWrapper>
    )
  }

  let className = 'card-container'
  if (isRevealed) {
    className += ' rotate-180 grayscale-[80%] transform-origin-center'
  }

  return (
    <CardWrapper delay={animationDelay}>
      <div ref={cardRef} className={className}>
        <div className={`rounded-card w-full h-full nord-shadow relative overflow-hidden ${colorSchemes[character]}`}>
          {/* Card corners */}
          <div className='absolute top-2 left-2 px-[4cqi] flex flex-col items-start z-10'>
            <span className={`text-[8cqi] font-bold ${textColors[character]} font-robotica`}>{character.slice()}</span>
          </div>

          {/* Mirrored name for bottom */}
          <div className='absolute bottom-2 right-2 px-[4cqi] flex flex-col items-end rotate-180 z-10 mix-blend-exclusion'>
            <span className={`text-[8cqi] font-bold ${textColors[character]} font-robotica`}>{character.slice()}</span>
          </div>

          <div className='absolute bottom-0 left-0 w-full'>
            <img
              src={`/images/${character.toLowerCase()}.png`}
              alt={character}
              className='w-full object-contain mix-blend-hard-light scale-x-[-1]'
            />
          </div>
        </div>
      </div>
    </CardWrapper>
  )
}

export const FaceDownCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <div ref={forwardedRef} className={cn('card-container', className)} {...props}>
        <div className='rounded-card w-full h-full nord-shadow relative overflow-hidden'>
          <svg className='absolute inset-0 w-full h-full bg-nord-10 text-nord-9' viewBox='0 0 404 539'>
            <use href='#card-back' />
          </svg>
        </div>
      </div>
    )
  }
)
