import React, { useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { PlayingCard } from './PlayingCard'
import { useGame, usePlayerMessage } from '~/context/CoupContext'
import { Player } from '~/types'
import { PlayerNameTag } from './PlayerNameTag'
import { TooltipGameMessage } from './GameMessage'
import { MessageData } from '~/utils/messages'
import { AnimatePresence } from 'framer-motion'
import _ from 'lodash'

interface OpponentHandProps extends Player<'client'> {
  isActor?: boolean
  isBlocker?: boolean
  isChallenger?: boolean
  isExchanging?: boolean
  className?: string
}

export const OpponentHand: React.FC<OpponentHandProps> = ({
  id: playerId,
  isActor = false,
  isBlocker = false,
  isChallenger = false,
  isExchanging = false,
  influence,
  className,
  ...nameTagProps
}) => {
  const game = useGame()
  const message: MessageData | null = usePlayerMessage(playerId)
  const [maxWidth, setMaxWidth] = useState<number>()

  const cardsListRef = useRef<HTMLUListElement>(null)

  // Optimize resize handling with ResizeObserver
  useEffect(() => {
    if (!cardsListRef.current) return

    const resizeObserver = new ResizeObserver(
      _.debounce(() => {
        const el = cardsListRef.current
        if (el) setMaxWidth(el.clientWidth)
      }, 100)
    )

    resizeObserver.observe(cardsListRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const isBot = playerId.startsWith('bot-')
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
          <PlayerNameTag id={playerId} {...nameTagProps} size='sm' bgColor='nord-1' isBot={isBot} />
        </div>
        {isPopoverOpen && <TooltipGameMessage message={message} />}
      </div>

      <AnimatePresence>
        <ul
          ref={cardsListRef}
          className='list-reset mx-auto flex-auto max-w-full max-h-[65cqi] aspect-[20/13] items-center grid gap-2'
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            aspectRatio: `${influence.length * 10} / 13`
          }}
        >
          {influence.map((card, i) => {
            return (
              <PlayingCard
                key={card.id}
                isFaceDown={!game || game.status === 'WAITING'}
                isAnimated
                animationDelay={i * 0.08}
                {...card}
              />
            )
          })}
        </ul>
      </AnimatePresence>
    </div>
  )
}

function isEqual<T extends { id: string }>(a: T[], b: T[], equalFn: (a: T, b: T) => boolean = (a, b) => a.id === b.id) {
  return a.length === b.length && a.every((v, i) => equalFn(v, b[i]))
}

function shuffle<T extends { id: string }>(arr: T[]) {
  const shuffled = arr.slice()
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
