import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Game, GameStatus, Player, TurnPhase } from '~/types'
import { PlayingCard } from './PlayingCard'
import { useGame } from '~/context/CoupContext'
import { PlayerNameTag } from './PlayerNameTag'
import { useDrawerHeight, useIsDrawerOpen } from './Drawer'
import { AnimatePresence, LayoutGroup } from 'framer-motion'
import classNames from 'classnames'
import HowToPlay from './HowToPlay'

export interface PlayerHandProps extends Player<'client'> {
  game: Game<'client'>
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ id: playerId, game, influence, ...nameTagProps }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isDrawerOpen = useIsDrawerOpen()
  const drawerHeight = useDrawerHeight()

  const translateAmount = useMemo(() => {
    if (!isDrawerOpen || !drawerHeight || !ref.current) {
      return 0
    }

    const elHeight = ref.current.clientHeight

    const offset = arePlayerCardsVisible(game.currentTurn?.phase)
      ? DRAWER_OFFSET_WITH_CARDS
      : DRAWER_OFFSET_WITHOUT_CARDS

    const maxOffset = elHeight - window.innerHeight + 1

    return Math.max(Math.min(0, ref.current.clientHeight - drawerHeight - offset), maxOffset)
  }, [game.currentTurn?.phase, isDrawerOpen, drawerHeight])

  return (
    <section
      ref={ref}
      className='grid grid-rows-[auto_auto] px-4 pb-4 flex-none bg-nord-0 transition-transform duration-500 ease-in-out container-type-inline-size z-50 relative'
      style={{
        transform: `translateY(${translateAmount.toFixed(2)}px)`,
        boxShadow: '0px 100vh 0px 0px var(--nord-0)'
      }}
    >
      <div className='absolute right-0 bottom-[calc(100%-1px)] flex items-center justify-center'>
        <svg
          viewBox='0 0 128 32'
          width={160}
          height={40}
          style={{ '--notch-background': 'var(--nord-0)', '--notch-border': 'var(--nord-3)' } as React.CSSProperties}
          className='-scale-y-100 absolute -left-6 bottom-0 -z-10 skew-x-[-30deg]'
        >
          <use href='#notch-path' />
        </svg>
        <div className='mb-[1px]'>
          <HowToPlay />
        </div>
      </div>
      <PlayerNameTag
        id={playerId}
        {...nameTagProps}
        className='my-1.5'
        size='lg'
        bgColor='nord-0'
        isActiveGame={game.status === 'IN_PROGRESS'}
      />
      <AnimatePresence>
        <div
          className={classNames('h-[64cqi] grid items-center gap-4', {
            'grid-cols-2': influence.length < 3,
            'grid-cols-4': influence.length > 2
          })}
        >
          {influence.map((card, i) => {
            return (
              <PlayingCard
                key={card.id}
                isFaceDown={game.status === 'WAITING'}
                isAnimated={game.status === 'IN_PROGRESS'}
                animationDelay={i * 0.08}
                {...card}
              />
            )
          })}
        </div>
      </AnimatePresence>
    </section>
  )
}

const DRAWER_OFFSET_WITH_CARDS = 164
const DRAWER_OFFSET_WITHOUT_CARDS = 40

function arePlayerCardsVisible(phase: TurnPhase | null = null) {
  if (!phase) return true
  return [
    'AWAITING_OPPONENT_RESPONSES',
    'AWAITING_ACTIVE_RESPONSE_TO_BLOCK',
    'AWAITING_TARGET_BLOCK_RESPONSE'
  ].includes(phase)
}
