import React, { useMemo, useRef } from 'react'
import { Game, Player } from '~/types'
import { Sprite } from './Sprite'
import { PlayerNameTag } from './PlayerNameTag'
import { Button } from './Button'
import { Link } from '@remix-run/react'

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
    <div className='absolute top-0 right-0 bottom-0 left-0 bg-nord-0/50 p-2'>
      <div className='flex flex-col w-full h-full p-6 bg-ui rounded-xl nord-shadow overflow-y-scroll no-scrollbar ring-nord-0 ring-1 relative'>
        <div className='flex flex-col items-stretch flex-auto gap-0 sm:gap-6'>
          <h2 className='text-2xl text-center'>Game Over</h2>

          <div className='w-full max-w-md flex-auto flex flex-col items-stretch px-8'>
            <Sprite id='crown' size={120} color='nord-13' className='h-[120px]' />
            <h2 className='text-center text-lg -mt-2'>Winner</h2>
            <div className='w-full rounded-full px-4 py-1 bg-nord-12 text-xl'>
              <PlayerNameTag {...winner} cardCount={cardCount} textColor='nord-1' bgColor='nord-1' />
            </div>
            {eliminationOrder && (
              <ul className='mt-6 pr-2 pb-4 pl-1 list-reset flex flex-col items-stretch gap-2'>
                {losersRef.current.slice(0, 2).map((loserId, i) => {
                  const loser = allPlayers.get(loserId)
                  return loser ? (
                    <li key={loser.id} className='flex items-baseline justify-between gap-1'>
                      <span className='text-nord-4 text-xs'>#{i + 2}.&nbsp;</span>
                      <PlayerNameTag
                        {...loser}
                        cardCount={0}
                        className='inline-flex flex-auto'
                        textColor='nord-4'
                        bgColor='nord-1'
                      />
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
        </div>
      </div>
    </div>
  )
}
