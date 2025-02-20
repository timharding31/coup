import React from 'react'
import cn from 'classnames'
import { NordColor, Player } from '~/types'
import CoinStack from './CoinStack'
import { Sprite } from './Sprite'

interface PlayerNameTagProps extends Omit<Player<'client'>, 'influence'> {
  textColor?: NordColor
  bgColor?: NordColor
  className?: string
  cardCount?: number
  isHost?: boolean
}

export const PlayerNameTag: React.FC<PlayerNameTagProps> = ({
  username,
  coins,
  textColor = 'nord-4',
  bgColor = 'nord-1',
  cardCount,
  isHost = false,
  className
}) => {
  return (
    <div className={cn(`text-${textColor} flex justify-between items-center relative gap-4 w-full px-1`, className)}>
      <span
        className={cn('overflow-hidden whitespace-nowrap text-ellipsis font-bold', {
          'font-normal line-through': cardCount === 0
        })}
      >
        {username}
        {isHost && (
          <span className='font-normal ml-2' style={{ fontSize: 'smaller' }}>
            (host)
          </span>
        )}
      </span>
      <div className='flex items-center gap-1 flex-row-reverse'>
        {cardCount == null ? null : cardCount > 0 ? (
          <div className='flex flex-row-reverse justify-start min-w-9'>
            {Array.from({ length: cardCount }).map((_, i) => (
              <Sprite key={`card-${i}`} id='card' color='nord-8' size='base' className='-mr-1.5' />
            ))}
          </div>
        ) : null}
        <CoinStack count={coins} size='base' color='nord-14' bgColor={bgColor} />
      </div>
    </div>
  )
}
