import React from 'react'
import { CoupContextType } from '~/context/CoupContext'
import { OpponentHand } from './OpponentHand'
import { useDrawerHeight } from './Drawer'
import classNames from 'classnames'

interface GameTableProps extends Pick<CoupContextType, 'game' | 'players'>, React.PropsWithChildren {}

export const GameTable: React.FC<React.PropsWithChildren<GameTableProps>> = ({ game, players, children }) => {
  const { myself, actor, blocker, challenger } = players

  const drawerHeight = useDrawerHeight()

  if (!myself) {
    return null
  }

  const myIndex = game.players.findIndex(p => p.id === myself.id)
  const opponents = game.players.slice(myIndex + 1).concat(game.players.slice(0, myIndex))
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
        {game.status === 'IN_PROGRESS' && (
          <>
            {opponents.map((opponent, index) => (
              <OpponentHand
                key={opponent.id}
                {...opponent}
                isActor={actor.id === opponent.id}
                isBlocker={blocker?.id === opponent.id}
                isChallenger={challenger?.id === opponent.id}
                isExchanging={game.currentTurn?.phase === 'AWAITING_EXCHANGE_RETURN' && actor.id === opponent.id}
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
