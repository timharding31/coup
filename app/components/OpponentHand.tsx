import React, { useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { PlayingCard } from './PlayingCard'
import { useGame, usePlayerMessage } from '~/context/CoupContext'
import { Player } from '~/types'
import { PlayerNameTag } from './PlayerNameTag'
import { TooltipGameMessage } from './GameMessage'
import { MessageData } from '~/utils/messages'
import _, { set } from 'lodash'
import { useDeckCoordinatesAtom } from '~/hooks/useDeckCoordinates'

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

  const [deckCoordinates] = useDeckCoordinatesAtom()

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
        {influence.map(card => (
          <PlayingCard key={card.id} isFaceDown={!game || game.status === 'WAITING'} {...card} />
        ))}
      </ul>
    </div>
  )
}
