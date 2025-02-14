import React from 'react'
import cn from 'classnames'
import { NordColor, Player } from '~/types'
import CoinStack from './CoinStack'
import { Sprite } from './Sprite'

interface PlayerNameTagProps extends Omit<Player<'client'>, 'influence'> {
  bgColor?: NordColor
  className?: string
  cardCount?: number
}

export const PlayerNameTag: React.FC<PlayerNameTagProps> = ({
  username,
  coins,
  bgColor = 'nord-1',
  cardCount = null,
  className
}) => {
  return (
    <div className={cn('text-nord-4 flex justify-between items-center relative gap-4 w-full px-1', className)}>
      <span className='overflow-hidden whitespace-nowrap text-ellipsis font-bold'>{username}</span>
      <div className='flex items-center gap-1 flex-row-reverse'>
        {cardCount && (
          <div className='flex flex-row-reverse justify-start min-w-9'>
            {Array.from({ length: cardCount }).map((_, i) => (
              <Sprite key={`card-${i}`} id='card' color='nord-8' size='base' className='-mr-1.5' />
            ))}
          </div>
        )}
        <CoinStack count={coins} size='base' color='nord-14' bgColor={bgColor} />
      </div>
    </div>
  )
}
