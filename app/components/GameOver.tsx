import React, { useMemo, useRef } from 'react'
import { Game, Player } from '~/types'
import { Sprite } from './Sprite'
import { PlayerNameTag } from './PlayerNameTag'
import { Button } from './Button'
import { Link } from '@remix-run/react'
import { GameTableOverlay } from './GameTableOverlay'

interface GameOverProps {
  game: Game<'client'>
}

export const GameOver: React.FC<GameOverProps> = ({ game: { winnerId, status, players, eliminationOrder } }) => {
  const allPlayers = useMemo(() => new Map(players.map(player => [player.id, player])), [players])
  const losersRef = useRef(eliminationOrder?.reverse().filter(id => id !== winnerId) || [])

  const winner = winnerId && allPlayers.get(winnerId)

  if (status !== 'COMPLETED' || !winner) {
    return null
  }

  const cardCount = winner.influence.reduce<number>((ct, card) => ct + Number(!card.isRevealed), 0)

  return (
    <GameTableOverlay heading='Game Over' className='gap-1'>
      <div className='w-full max-w-md flex-auto flex flex-col items-stretch px-8'>
        <Sprite id='crown' size={120} color='nord-13' className='h-[120px]' />
        <h2 className='text-center text-lg -mt-2'>Winner</h2>
        <div className='w-full rounded-full px-4 pb-1 pt-[6px] bg-nord-12 text-xl'>
          <PlayerNameTag {...winner} cardCount={cardCount} textColor='nord-0' bgColor='nord-0' />
        </div>
        {eliminationOrder && (
          <ul className='mt-6 pr-2 pb-4 pl-1 list-reset flex flex-col items-stretch gap-2'>
            {losersRef.current.slice(0, 2).map((loserId, i) => {
              const loser = allPlayers.get(loserId)
              return loser ? (
                <li key={loser.id} className='flex items-baseline justify-between gap-1'>
                  <span className='text-nord-4 text-xs'>#{i + 2}.&nbsp;</span>
                  <PlayerNameTag {...loser} className='inline-flex flex-auto' textColor='nord-4' bgColor='nord-1' />
                </li>
              ) : null
            })}
          </ul>
        )}
      </div>

      <Link to='/' className='contents'>
        <Button size='lg' variant='secondary' className='sticky bottom-0'>
          Exit
        </Button>
      </Link>
    </GameTableOverlay>
  )
}
