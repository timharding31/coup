import React from 'react'
import { useGame } from '~/hooks/socket'
import { OpponentHand } from './OpponentHand'
import { PlayerHand } from './PlayerHand'

interface GameTableProps extends React.PropsWithChildren {
  playerId: string
}

export const GameTable: React.FC<React.PropsWithChildren<GameTableProps>> = ({ playerId, children }) => {
  const game = useGame()

  if (!game) return null

  const myIndex = game.players.findIndex(p => p.id === playerId)
  const myself = game.players[myIndex]
  const currentPlayer = game.players[game.currentPlayerIndex]
  const opponents = game.players.slice(myIndex + 1).concat(game.players.slice(0, myIndex))

  if (!myself) {
    return null
  }

  return (
    <>
      <div className='flex-auto grid grid-cols-4 grid-rows-[auto_auto_auto] gap-4'>
        {opponents.map((opponent, index) => (
          <div key={opponent.id} className={`col-span-2 ${getOpponentClasses(index, opponents.length)}`}>
            <OpponentHand {...opponent} isCurrentPlayer={currentPlayer.id === opponent.id} />
          </div>
        ))}
      </div>
      <div className='flex-none'>
        <PlayerHand {...myself} />
      </div>
      {children}
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
