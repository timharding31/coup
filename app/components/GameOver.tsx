import React, { useMemo, useRef } from 'react'
import { Game } from '~/types'
import { Sprite } from './Sprite'
import { PlayerNameTag } from './PlayerNameTag'
import { GameTableDialog } from './GameTableDialog'

interface GameOverProps {
  playerId: string
  game: Game<'client'>
}

export const GameOver: React.FC<GameOverProps> = ({
  playerId,
  game: { id: gameId, winnerId, status, players, eliminationOrder }
}) => {
  const allPlayers = useMemo(() => new Map(players.map(player => [player.id, player])), [players])
  const losersRef = useRef(eliminationOrder?.reverse().filter(id => id !== winnerId) || [])

  const winner = winnerId ? allPlayers.get(winnerId) : null

  if (status !== 'COMPLETED') {
    return null
  }

  const cardCount = winner?.influence.reduce<number>((ct, card) => ct + Number(!card.isRevealed), 0) || 0

  return (
    <GameTableDialog
      heading='Game Over'
      className='gap-1'
      actions={{
        url: `/api/games/${gameId}/leave?playerId=${playerId}`,
        variant: 'secondary',
        children: 'Exit'
      }}
    >
      {winner ? (
        <div className='w-full max-w-md flex-auto flex flex-col items-stretch'>
          <Sprite id='crown' size={120} color='nord-13' className='h-[120px]' />
          <h2 className='text-center text-lg -mt-2'>Winner</h2>
          <div className='w-full rounded-full px-4 pb-1 pt-[6px] bg-nord-12 text-lg mt-2 grid grid-cols-[auto_1fr] gap-1'>
            <span>🥇</span>
            <PlayerNameTag {...winner} cardCount={cardCount} textColor='nord-0' bgColor='nord-0' />
          </div>
          {eliminationOrder != null && (
            <ul className='mt-2 pb-4 list-reset flex flex-col items-stretch gap-2'>
              {losersRef.current.slice(0, 2).map((loserId, i) => {
                const loser = allPlayers.get(loserId)
                return loser ? (
                  <li key={loser.id} className='grid grid-cols-[auto_1fr] gap-1 px-4'>
                    <span>{['🥈', '🥉'][i]}</span>
                    <PlayerNameTag {...loser} cardCount={0} textColor='nord-4' bgColor='nord-1' />
                  </li>
                ) : null
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className='pt-16 text-center text-lg flex-auto'>The host left the game</div>
      )}
    </GameTableDialog>
  )
}
