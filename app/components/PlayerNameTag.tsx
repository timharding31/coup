import React from 'react'
import { Player } from '~/types'
import { Sprite } from './Button'

interface PlayerNameTagProps extends Omit<Player<'client'>, 'influence'> {}

export const PlayerNameTag: React.FC<PlayerNameTagProps> = ({ username, coins }) => {
  return (
    <div className='bg-nord-4 rounded-xl text-nord-0 px-6 flex items-center relative gap-2 nord-shadow ring-1 ring-nord-0'>
      <span className='font-medium'>{username}</span>
      <div className='text-nord-13-dark inline-flex items-center'>
        <Sprite sprite='dollar' size='sm' />
        <span className='font-bold ml-[-6px]'>{coins}</span>
      </div>
    </div>
  )
}
