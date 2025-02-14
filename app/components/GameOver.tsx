import React from 'react'
import styles from './styles.css'
import { Game } from '~/types'
import { Sprite } from './Sprite'
import { PlayerNameTag } from './PlayerNameTag'

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
        <div className='flex flex-col items-stretch flex-1'>
          <div className='flex items-baseline justify-between gap-2 flex-wrap'>
            <h2 className='text-2xl'>Game Over</h2>
          </div>

          <div className='w-full max-w-md flex-auto flex flex-col items-stretch pt-12 px-8'>
            <Sprite id='crown' size={144} color='nord-13' className='h-[144px]' />
            <div className='w-full rounded-full px-4 py-1 bg-nord-11 text-xl'>
              <PlayerNameTag {...winner} cardCount={cardCount} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
