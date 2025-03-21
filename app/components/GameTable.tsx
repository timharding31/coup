import React, { useMemo } from 'react'
import { CoupContextType } from '~/context/CoupContext'
import { OpponentHand } from './OpponentHand'
import { useDrawerHeight } from './Drawer'
import classNames from 'classnames'
import HowToPlay from './HowToPlay'
import { GameStatus } from '~/types'

interface GameTableProps extends Pick<CoupContextType, 'players'>, React.PropsWithChildren {
  status: GameStatus
}

export const GameTable: React.FC<React.PropsWithChildren<GameTableProps>> = ({ status, players, children }) => {
  const { myself, actor, blocker, challenger, target } = players

  const opponents = useMemo(() => {
    const myIndex = players.all.findIndex(p => p.id === myself.id)
    return players.all.slice(myIndex + 1).concat(players.all.slice(0, myIndex))
  }, [players.all, players.myself])

  const drawerHeight = useDrawerHeight()

  if (!myself) {
    return null
  }

  const opponentsCount = opponents.length

  return (
    <main className='relative flex flex-col h-full'>
      <div
        className={classNames('px-6 py-2 flex-auto grid grid-cols-4 gap-x-8 gap-y-4 min-h-0', {
          'grid-rows-1': opponentsCount <= 2,
          'grid-rows-2': opponentsCount > 2 && opponentsCount < 5,
          'grid-rows-3': opponentsCount >= 5
        })}
      >
        {status === 'IN_PROGRESS' && (
          <>
            {opponents.map((opponent, index) => (
              <OpponentHand
                key={opponent.id}
                {...opponent}
                isActor={actor.id === opponent.id}
                isBlocker={blocker?.id === opponent.id}
                isChallenger={challenger?.id === opponent.id}
                isTarget={target?.id === opponent.id}
                className={classNames('col-span-2', getOpponentClasses(index, opponentsCount))}
              />
            ))}
          </>
        )}
      </div>
      {children}
      {!!drawerHeight && (
        <div className='absolute top-0 right-0 bottom-0 left-0 bg-nord--1/50 z-50 pointer-events-none' />
      )}
    </main>
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
        'row-start-2', // middle left
        '', // top left
        'col-start-3', // top right
        'col-start-3 row-start-2' // middle right
      ][index]

    case 3:
      return [
        'row-start-2', // middle left
        'col-start-2', // top center
        'col-start-3 row-start-2' // middle right
      ][index]

    case 2:
      return [
        'row-start-1', // top left
        'col-start-3 row-start-1' // top right
      ][index]

    case 1:
      return 'col-start-2 row-start-1'

    default:
      return ''
  }
}
