import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Game, GameStatus, Player, TurnPhase } from '~/types'
import { PlayingCard } from './PlayingCard'
import { useGame } from '~/context/CoupContext'
import { PlayerNameTag } from './PlayerNameTag'
import { useDrawerHeight } from './Drawer'
import { AnimatePresence, LayoutGroup } from 'framer-motion'

export interface PlayerHandProps extends Player<'client'> {
  game: Game<'client'>
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ id: playerId, game, influence, ...nameTagProps }) => {
  const ref = useRef<HTMLDivElement>(null)
  const drawerHeight = useDrawerHeight()

  const translateAmount = useMemo(() => {
    if (!drawerHeight || !ref.current) {
      return 0
    }

    const elHeight = ref.current.clientHeight

    const offset = arePlayerCardsVisible(game.currentTurn?.phase)
      ? DRAWER_OFFSET_WITH_CARDS
      : DRAWER_OFFSET_WITHOUT_CARDS

    const maxOffset = elHeight - window.innerHeight + 1

    return Math.max(Math.min(0, ref.current.clientHeight - drawerHeight - offset), maxOffset)
  }, [game.currentTurn?.phase, drawerHeight])

  return (
    <div
      ref={ref}
      className='grid grid-rows-[auto_auto] px-6 pb-4 flex-none bg-nord-0 border-t border-nord-3 transition-transform duration-500 ease-in-out z-50'
      style={{
        transform: `translateY(${translateAmount.toFixed(2)}px)`,
        boxShadow: '0px 300px 0px 0px var(--nord-0)'
      }}
    >
      <PlayerNameTag id={playerId} {...nameTagProps} className='text-lg my-2' bgColor='nord-0' />
      <div className='grid grid-cols-2 gap-4'>
        <AnimatePresence>
          {influence.slice(0, 2).map((card, i) => {
            return (
              <PlayingCard
                key={card.id}
                isFaceDown={game.status === 'WAITING'}
                layoutId={`player-${playerId}-card-${card.id}`}
                // isAnimated={game.status === 'IN_PROGRESS'}
                // animationDelay={i * 0.08}
                {...card}
              />
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

const DRAWER_OFFSET_WITH_CARDS = 164
const DRAWER_OFFSET_WITHOUT_CARDS = 40

function arePlayerCardsVisible(phase: TurnPhase | null = null) {
  return !phase || ['AWAITING_OPPONENT_RESPONSES', 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK'].includes(phase)
}
