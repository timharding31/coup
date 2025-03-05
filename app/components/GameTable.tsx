import React from 'react'
import cn from 'classnames'
import { CoupContextType } from '~/context/CoupContext'
import { OpponentHand } from './OpponentHand'
import { useDrawerHeight } from './Drawer'
import { CourtDeck } from './CourtDeck'

interface GameTableProps extends Pick<CoupContextType, 'game' | 'players'>, React.PropsWithChildren {
  playerId: string
}

export const GameTable: React.FC<React.PropsWithChildren<GameTableProps>> = ({ playerId, game, players, children }) => {
  const { myself, actor, blocker, challenger } = players

  const drawerHeight = useDrawerHeight()

  const myIndex = game.players.findIndex(p => p.id === playerId)
  const opponents = game.players.slice(myIndex + 1).concat(game.players.slice(0, myIndex))

  if (!myself) {
    return null
  }

  let opponentRows = [0, 1, 1, 2, 2, 3, 3][opponents.length]

  return (
    <div className='relative flex flex-col h-full flex-auto'>
      <div className={`px-4 py-2 flex-auto grid grid-cols-4 grid-rows-${opponentRows} gap-x-8 gap-y-4 min-h-0`}>
        {game.status === 'IN_PROGRESS' && (
          <>
            {opponents.map((opponent, index) => (
              <OpponentHand
                key={opponent.id}
                {...opponent}
                isActor={actor?.id === opponent.id}
                isBlocker={blocker?.id === opponent.id}
                isChallenger={challenger?.id === opponent.id}
                className={cn('col-span-2', getOpponentClasses(index, opponents.length))}
              />
            ))}
          </>
        )}
      </div>
      {children}
      {!!drawerHeight && (
        <div className='absolute top-0 right-0 bottom-0 left-0 bg-nord--1/50 z-60 pointer-events-none' />
      )}
    </div>
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
        'col-start-3 row-start-3' // bottom right
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
