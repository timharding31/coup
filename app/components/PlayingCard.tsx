import React, { useCallback } from 'react'
import cn from 'classnames'
import { motion } from 'framer-motion'
import { Card, CardType } from '~/types'

export const colorSchemes: Record<CardType, string> = {
  [CardType.AMBASSADOR]: 'bg-gradient-to-br from-amber-200 to-amber-600',
  [CardType.ASSASSIN]: 'bg-gradient-to-br from-emerald-900 to-black',
  [CardType.CAPTAIN]: 'bg-gradient-to-br from-slate-600 to-gray-800',
  [CardType.CONTESSA]: 'bg-gradient-to-br from-rose-400 to-orange-800',
  [CardType.DUKE]: 'bg-gradient-to-br from-cyan-600 to-purple-800'
}

export const textColors: Record<CardType, string> = {
  [CardType.AMBASSADOR]: 'text-amber-900',
  [CardType.ASSASSIN]: 'text-emerald-400',
  [CardType.CAPTAIN]: 'text-slate-300',
  [CardType.CONTESSA]: 'text-teal-100',
  [CardType.DUKE]: 'text-purple-900'
}

interface PlayingCardProps extends Card<'client'> {
  layoutId?: string
  isFaceDown?: boolean
  isAnimated?: boolean
  animationDelay?: number
  isExiting?: boolean
  onAnimationComplete?: () => void
}

const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
  mass: 0.8,
  duration: 0.3
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  id,
  layoutId = `card-${id}`,
  type: character,
  isFaceDown,
  isRevealed,
  isAnimated = false,
  animationDelay,
  onAnimationComplete
}) => {
  // Optimize card rendering based on face state
  const RenderedCard = useCallback(() => {
    if (!character || isFaceDown) {
      return <FaceDownCard />
    }

    return (
      <div
        className={cn('card-container', {
          'rotate-180 grayscale-[80%] transform-origin-center': isRevealed
        })}
      >
        <div className={`rounded-card nord-shadow w-full h-full relative ${colorSchemes[character]}`}>
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
    )
  }, [character, isFaceDown, isRevealed])

  return isAnimated ? (
    <motion.div
      layout
      layoutId={layoutId}
      transition={{ ...springTransition, delay: animationDelay }}
      onAnimationComplete={onAnimationComplete}
    >
      <RenderedCard />
    </motion.div>
  ) : (
    <RenderedCard />
  )
}

// Simplified FaceDownCard component that works better with animations
export const FaceDownCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div className={cn('card-container', className)} {...props}>
      <div className='w-full h-full relative rounded-card nord-shadow'>
        <svg className='absolute inset-0 w-full h-full bg-nord-10 text-nord-9' viewBox='0 0 404 539'>
          <use href='#card-back' />
        </svg>
      </div>
    </div>
  )
}
