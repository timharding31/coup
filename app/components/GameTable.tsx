import React from 'react'
import styles from './styles.css'
import { useGameSocket } from '~/hooks/socket'
import { GameStatus } from '~/types'
import { OpponentHand } from './OpponentHand'
import { PlayerHand } from './PlayerHand'
import { Button } from './Button'

type GameTableProps = { playerId: string } & (
  | { status: Extract<GameStatus, 'WAITING'>; onStartGame: (() => void) | null }
  | { status: Exclude<GameStatus, 'WAITING'>; onStartGame?: never }
)

export const GameTable: React.FC<React.PropsWithChildren<GameTableProps>> = ({
  playerId,
  status,
  onStartGame,
  children
}) => {
  const { game } = useGameSocket()

  if (!game) return null

  const myIndex = game.players.findIndex(p => p.id === playerId)
  const myself = game.players[myIndex]
  const currentPlayer = game.players[game.currentPlayerIndex]
  const opponents = game.players.slice(myIndex + 1).concat(game.players.slice(0, myIndex))

  return (
    <div className='w-full h-full flex flex-col items-stretch justify-betweeen gap-2 relative'>
      <div className='flex-auto grid grid-cols-4 grid-rows-[auto_auto_auto] gap-4'>
        {opponents.map((opponent, index) => (
          <div key={opponent.id} className={`col-span-2 ${getOpponentClasses(index, opponents.length)}`}>
            <OpponentHand {...opponent} isCurrentPlayer={currentPlayer.id === opponent.id} />
          </div>
        ))}
      </div>
      {myself != null && (
        <div className='flex-none relative'>
          <PlayerHand {...myself} />
          {status === 'WAITING' && onStartGame && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Button type='button' variant='success' onClick={() => onStartGame()}>
                Start Game
              </Button>
            </div>
          )}
        </div>
      )}
      {children}
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
