import React, { useMemo, useRef } from 'react'
import { CoupContextType, useGame, usePlayers } from '~/context/CoupContext'
import { OpponentHand } from './OpponentHand'
import { PlayerHand } from './PlayerHand'
import useMeasure from 'react-use-measure'
import { Header } from './Header'
import { useDrawerHeight } from './Drawer'

const DRAWER_OFFSET_WITH_CARDS = 172
const DRAWER_OFFSET_WITHOUT_CARDS = 48

interface GameTableProps extends Pick<CoupContextType, 'game' | 'players'>, React.PropsWithChildren {
  playerId: string
}

export const GameTable: React.FC<React.PropsWithChildren<GameTableProps>> = ({ playerId, game, players, children }) => {
  const { myself, actor, blocker, challenger } = players

  const myIndex = game.players.findIndex(p => p.id === playerId)
  const opponents = game.players.slice(myIndex + 1).concat(game.players.slice(0, myIndex))

  const playerHandRef = useRef<HTMLDivElement>(null)
  const drawerHeight = useDrawerHeight()

  const translateAmount = useMemo(() => {
    if (!drawerHeight || !playerHandRef.current) {
      return 0
    }

    let offset: number
    if (
      !game.currentTurn?.phase ||
      ['AWAITING_OPPONENT_RESPONSES', 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK'].includes(game.currentTurn.phase)
    ) {
      // Player needs to see their cards to make a decision
      offset = DRAWER_OFFSET_WITH_CARDS
    } else {
      // Don't need cards to be visible because they're also rendered inside the Drawer
      offset = DRAWER_OFFSET_WITHOUT_CARDS
    }

    return Math.min(0, playerHandRef.current.clientHeight - drawerHeight - offset)
  }, [game.currentTurn?.phase, drawerHeight])

  if (!myself) {
    return null
  }

  return (
    <>
      <Header />
      <div className={`relative p-2 flex-auto grid grid-cols-4 grid-rows-[auto_auto_auto] gap-4`}>
        {opponents.map((opponent, index) => (
          <div key={opponent.id} className={`col-span-2 ${getOpponentClasses(index, opponents.length)}`}>
            <OpponentHand
              {...opponent}
              isActor={actor?.id === opponent.id}
              isBlocker={blocker?.id === opponent.id}
              isChallenger={challenger?.id === opponent.id}
            />
          </div>
        ))}
        {children}
        {!!drawerHeight && (
          <div className='absolute top-0 right-0 bottom-0 left-0 bg-nord--1/50 z-60 pointer-events-none' />
        )}
      </div>
      <div
        ref={playerHandRef}
        className='transition-transform duration-500 ease-in-out flex-none bg-nord-0'
        style={{
          transform: `translateY(${translateAmount.toFixed(2)}px)`,
          boxShadow: '0px 300px 0px 0px var(--nord-0)'
        }}
      >
        <PlayerHand {...myself} />
      </div>
    </>
  )
}

function getOpponentClasses(index: number, total: number) {
  switch (total) {
    case 5:
      return [
        'row-start-3', // bottom left
        'row-start-2', // middle left
        'col-start-2 row-start-1', // top center
        'col-start-3 row-start-2', // middle right
        'col-start-3 row-start-3' // bottom right
      ][index]

    case 4:
      return [
        'row-start-3', // bottom left
        'row-start-2', // middle left
        'col-start-3 row-start-2', // middle right
        'col-start-3 row-start-1' // bottom right
      ][index]

    case 3:
      return [
        'row-start-2', // middle left
        'col-start-2', // top center
        'col-start-3 row-start-2' // middle right
      ][index]

    case 2:
      return [
        'row-start-2', // middle left
        'col-start-3 row-start-2' // middle right
      ][index]

    case 1:
      return 'col-start-2 row-start-1'

    default:
      return ''
  }
}
