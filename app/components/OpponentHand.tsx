import React, { useCallback, useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { PlayingCard } from './PlayingCard'
import { useGame, usePlayerMessage } from '~/context/CoupContext'
import { Card, Player } from '~/types'
import { PlayerNameTag } from './PlayerNameTag'
import { TooltipGameMessage } from './GameMessage'
import { MessageData } from '~/utils/messages'
import { AnimatePresence } from 'framer-motion'
import _ from 'lodash'

interface OpponentHandProps extends Player<'client'> {
  isActor?: boolean
  isBlocker?: boolean
  isChallenger?: boolean
  className?: string
}

export const OpponentHand: React.FC<OpponentHandProps> = ({
  isActor = false,
  isBlocker = false,
  isChallenger = false,
  influence,
  className,
  ...nameTagProps
}) => {
  const game = useGame()
  const message: MessageData | null = usePlayerMessage(nameTagProps.id)
  const [maxWidth, setMaxWidth] = useState<number>()

  const cardsRef = useRef<Card<'client'>[]>(influence)
  const [newCardIds, setNewCardIds] = useState(new Set<string>())

  useEffect(() => {
    const prevCardIds = cardsRef.current.map(card => card.id)
    const newCards = influence.filter(card => !prevCardIds.includes(card.id))
    let timer: NodeJS.Timeout | undefined
    if (newCards.length > 0) {
      setNewCardIds(new Set(newCards.map(card => card.id)))
      timer = setTimeout(() => {
        setNewCardIds(new Set())
      }, 5_000)
    }
    return () => {
      cardsRef.current = influence
      if (timer) clearTimeout(timer)
    }
  }, [influence])

  const cardsListRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!cardsListRef.current) return

    const debouncedOnResize = _.debounce(() => {
      const el = cardsListRef.current
      if (el) setMaxWidth(el.clientWidth)
    }, 500)

    debouncedOnResize()
    window.addEventListener('resize', debouncedOnResize)
    return () => {
      debouncedOnResize.cancel()
      window.removeEventListener('resize', debouncedOnResize)
    }
  }, [])

  const isPlayerDead = influence.every(card => card.isRevealed)
  const isPopoverOpen = game?.status === 'IN_PROGRESS' && !isPlayerDead && message

  // Calculate grid columns dynamically
  const gridCols = Math.max(2, influence.length)

  return (
    <div className={cn('flex flex-col items-center justify-center container-type-inline-size gap-1', className)}>
      <div className='relative self-stretch'>
        <div
          className='mx-auto w-full'
          style={(maxWidth ? { maxWidth: `${maxWidth.toFixed(2)}px` } : {}) as React.CSSProperties}
        >
          <PlayerNameTag {...nameTagProps} size='sm' bgColor='nord-1' />
        </div>
        {isPopoverOpen && <TooltipGameMessage message={message} />}
      </div>

      <ul
        ref={cardsListRef}
        className='list-reset mx-auto flex-auto max-w-full max-h-[65cqi] aspect-[20/13] items-center grid gap-2'
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          aspectRatio: `${influence.length * 10} / 13`
        }}
      >
        <AnimatePresence>
          {influence.map((card, i) => (
            <PlayingCard
              key={card.id}
              isFaceDown={!game || game.status === 'WAITING'}
              {...card}
              isAnimated={game?.status === 'IN_PROGRESS' && newCardIds.has(card.id)}
              animationDelay={i * 0.1}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
