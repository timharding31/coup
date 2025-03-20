import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { PlayingCard } from './PlayingCard'
import { useGame, usePlayerMessage } from '~/context/CoupContext'
import { Player } from '~/types'
import { PlayerNameTag } from './PlayerNameTag'
import { TooltipGameMessage } from './GameMessage'
import { MessageData } from '~/utils/messages'
import { AnimatePresence, motion } from 'framer-motion'
import _ from 'lodash'
import { Sprite } from './Sprite'

interface OpponentHandProps extends Player<'client'> {
  isActor?: boolean
  isBlocker?: boolean
  isChallenger?: boolean
  isTarget?: boolean
  className?: string
}

export const OpponentHand: React.FC<OpponentHandProps> = ({
  id: playerId,
  isActor = false,
  isBlocker = false,
  isChallenger = false,
  isTarget = false,
  influence,
  className,
  ...nameTagProps
}) => {
  const message: MessageData | null = usePlayerMessage(playerId)

  const isPlayerDead = influence.every(card => card.isRevealed)
  const isPopoverOpen = !isPlayerDead && message

  // Calculate grid columns dynamically
  const gridCols = Math.max(2, influence.length)

  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center container-type-inline-size transition-all ease-in-out duration-300 scale-100 z-50 origin-bottom',
        { 'scale-105': isActor },
        className
      )}
    >
      <div className='relative self-stretch'>
        <div className='mx-auto w-full max-w-[23vh]'>
          <PlayerNameTag
            id={playerId}
            {...nameTagProps}
            size='sm'
            bgColor='nord-1'
            textColor='nord-4'
            isActiveGame
            isBlocker={isBlocker}
            isChallenger={isChallenger}
            isTarget={isTarget}
          />
        </div>
        <AnimatePresence>
          {isActor && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, opacity: [1, 0.5, 1] }}
              exit={{ scale: 0 }}
              transition={{
                scale: { type: 'spring', damping: 15, stiffness: 200, duration: 0.2, delay: 0.5 },
                opacity: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
              }}
              className='rounded-full absolute -left-3 top-1.5 bg-nord-12 w-2 h-2'
            >
              &nbsp;
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        <motion.ul
          className={classNames(
            'relative list-reset mx-auto flex-auto max-w-full max-h-[65cqi] aspect-[20/13] items-center grid gap-2'
          )}
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            aspectRatio: `${Math.max(2, influence.length) * 10} / 13`
          }}
        >
          {influence.map((card, i) => {
            return <PlayingCard key={card.id} isAnimated animationDelay={i * 0.08} {...card} />
          })}
          {isPopoverOpen && <TooltipGameMessage message={message} />}
        </motion.ul>
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
