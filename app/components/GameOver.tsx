import React from 'react'
import { Game } from '~/types'
import { Sprite } from './Sprite'
import { PlayerNameTag } from './PlayerNameTag'
import { Button } from './Button'
import { Link } from '@remix-run/react'

interface GameOverProps {
  game: Game<'client'>
}

export const GameOver: React.FC<GameOverProps> = ({ game: { winnerId, status, players } }) => {
  const winner = players.find(player => player.id === winnerId)

  if (status !== 'COMPLETED' || !winner) {
    return null
  }

  const cardCount = winner.influence.reduce<number>((ct, card) => ct + Number(!card.isRevealed), 0)

  return (
    <div className='absolute top-0 right-0 bottom-0 left-0 bg-nord-0/50 p-2'>
      <div className='flex flex-col w-full h-full p-6 bg-ui rounded-xl nord-shadow overflow-y-scroll ring-nord-0 ring-1 relative'>
        <div className='flex flex-col items-stretch flex-auto gap-2 sm:gap-6'>
          <h2 className='text-2xl'>Game Over</h2>

          <div className='w-full max-w-md flex-auto flex flex-col items-stretch px-8 -mt-2'>
            <Sprite id='crown' size={120} color='nord-13' className='h-[120px]' />
            <h2 className='text-center text-lg -mt-2'>Winner</h2>
            <div className='w-full rounded-full px-4 py-1 bg-nord-12 text-xl'>
              <PlayerNameTag {...winner} cardCount={cardCount} textColor='nord-4' bgColor='nord-1' />
            </div>
          </div>

          <Link to='/' className='contents'>
            <Button size='lg' variant='secondary' className='mt-4'>
              Exit
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
