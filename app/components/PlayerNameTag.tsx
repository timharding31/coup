import React from 'react'
import cn from 'classnames'
import { NordColor, Player } from '~/types'
import CoinStack from './CoinStack'
import { Sprite } from './Sprite'

interface PlayerNameTagProps extends Omit<Player<'client'>, 'influence'> {
  bgColor?: NordColor
  className?: string
}

export const PlayerNameTag: React.FC<PlayerNameTagProps> = ({ username, coins, bgColor = 'nord-1', className }) => {
  return (
    <div className={cn('text-nord-4 flex justify-between items-center relative gap-4 w-full', className)}>
      <span className='overflow-hidden whitespace-nowrap text-ellipsis'>{username.toUpperCase()}</span>
      <CoinStack count={coins} size='base' color='nord-14' bgColor={bgColor} />
    </div>
  )
}
