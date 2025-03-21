import React, { useMemo, useRef, useState, useEffect } from 'react'
import { GameStatus, Player, TurnPhase } from '~/types'
import { PlayingCard } from './PlayingCard'
import { PlayerNameTag } from './PlayerNameTag'
import { useDrawerHeight, useIsDrawerOpen } from './Drawer'
import { AnimatePresence, LayoutGroup } from 'framer-motion'
import classNames from 'classnames'
import HowToPlay from './HowToPlay'
import _ from 'lodash'

export interface PlayerHandProps extends Player<'client'> {
  status: GameStatus
  phase?: TurnPhase | null
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ id: playerId, influence, status, phase, ...nameTagProps }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isDrawerOpen = useIsDrawerOpen()
  const drawerHeight = useDrawerHeight()
  const [sectionHeight, setSectionHeight] = useState<number>()

  useEffect(() => {
    const sectionEl = ref.current
    if (!sectionEl) return
    const onResize = _.debounce(() => {
      setSectionHeight(sectionEl.clientHeight)
    }, 500)
    onResize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const translateAmount = useMemo(() => {
    if (!isDrawerOpen || !drawerHeight || !ref.current || !sectionHeight) {
      return 0
    }

    const offset = arePlayerCardsVisible(phase) ? DRAWER_OFFSET_WITH_CARDS : DRAWER_OFFSET_WITHOUT_CARDS

    const maxOffset = sectionHeight - window.innerHeight + 1

    return Math.max(Math.min(0, sectionHeight - drawerHeight - offset), maxOffset)
  }, [phase, isDrawerOpen, drawerHeight, sectionHeight])

  return (
    <section
      ref={ref}
      className='grid grid-rows-[auto_auto] px-4 pb-4 flex-none bg-nord-0 transition-transform duration-500 ease-in-out container-type-inline-size z-[60] relative border-t border-nord-3'
      style={{
        transform: `translateY(${translateAmount.toFixed(2)}px)`,
        boxShadow: sectionHeight ? `0 ${2 * sectionHeight}px 0 ${2 * sectionHeight}px var(--nord-0)` : undefined
      }}
    >
      {status === 'IN_PROGRESS' && (
        <div className='absolute right-0 bottom-[100%] flex items-center justify-center'>
          <svg
            viewBox='0 0 128 32'
            width={160}
            height={40}
            style={
              {
                '--notch-background': 'var(--nord-0)',
                '--notch-border': 'var(--nord-3)'
              } as React.CSSProperties
            }
            className='-scale-y-100 absolute -left-6 bottom-0 -z-10 skew-x-[-30deg]'
          >
            <use href='#notch-path' />
          </svg>
          <div className='my-[2px] mr-1'>
            <HowToPlay />
          </div>
        </div>
      )}
      <PlayerNameTag
        id={playerId}
        {...nameTagProps}
        className='my-1.5'
        size='lg'
        bgColor='nord-0'
        isActiveGame={status === 'IN_PROGRESS'}
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
                isFaceDown={status === 'WAITING'}
                isAnimated={status === 'IN_PROGRESS'}
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
