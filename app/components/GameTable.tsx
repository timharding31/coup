import React from 'react'
import { useGame, usePlayers } from '~/context/CoupContext'
import { OpponentHand } from './OpponentHand'
import { PlayerHand } from './PlayerHand'
import useMeasure from 'react-use-measure'
import { Player } from '~/types'
import { Header } from './Header'

interface GameTableProps extends React.PropsWithChildren {
  playerId: string
  isActionMenuOpen: boolean
}

export const GameTable: React.FC<React.PropsWithChildren<GameTableProps>> = ({
  playerId,
  isActionMenuOpen,
  children
}) => {
  const game = useGame()
  const { actor, blocker, challenger } = usePlayers() || {}

  if (!game) return null

  const myIndex = game.players.findIndex(p => p.id === playerId)
  const myself = game.players[myIndex]
  const opponents = game.players.slice(myIndex + 1).concat(game.players.slice(0, myIndex))

  const [playerHandRef, { height = 0 }] = useMeasure({ debounce: 50, scroll: false })
  const playerHandStyle = { transform: `translateY(${isActionMenuOpen ? `${(height - 660).toFixed(2)}px` : '0px'})` }

  if (!myself) {
    return null
  }

  return (
    <>
      <Header />
      <div
        className={`relative p-2 pt-10 flex-auto grid grid-cols-4 grid-rows-[auto_auto_auto] gap-4 duration-500 transition-[brightness]${isActionMenuOpen ? ' brightness-[50%]' : ''}`}
      >
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
      </div>
      <div
        ref={playerHandRef}
        className='transition-transform duration-200 ease-in-out flex-none bg-nord-0'
        style={playerHandStyle}
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
