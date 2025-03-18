import React from 'react'
import classNames from 'classnames'
import { NordColor, Player } from '~/types'
import { CoinStack } from './CoinStack'
import { Sprite } from './Sprite'

interface PlayerNameTagProps extends Omit<Player<'client'>, 'influence'> {
  textColor?: NordColor
  size?: 'xs' | 'sm' | 'base' | 'lg'
  iconSize?: 'xs' | 'sm' | 'base' | 'lg'
  bgColor?: NordColor
  className?: string
  userClassName?: string
  cardCount?: number
  isHost?: boolean
  isBot?: boolean
  isActiveGame?: boolean
}

export const PlayerNameTag: React.FC<PlayerNameTagProps> = ({
  id,
  username,
  coins,
  textColor = 'nord-4',
  size = 'base',
  iconSize = 'xs',
  bgColor = 'nord-1',
  cardCount,
  isHost = false,
  isBot = id.startsWith('bot-'),
  className,
  userClassName,
  isActiveGame = false
}) => {
  return (
    <div
      className={classNames(
        `text-${textColor} text-${size} flex justify-between items-center relative gap-4 w-full`,
        className
      )}
    >
      <span className={classNames('inline-flex items-center font-bold gap-1.5 overflow-hidden', userClassName)}>
        {isBot ? <Sprite id='robot' size={iconSize} /> : null}
        <span className='flex-auto overflow-hidden text-ellipsis whitespace-nowrap'>
          {username}
          {isHost && (
            <span className='ml-2 font-normal' style={{ fontSize: 'smaller' }}>
              (host)
            </span>
          )}
        </span>
      </span>
      <div className='flex items-center gap-1 flex-row-reverse'>
        {cardCount != null && (
          <div className='flex flex-row-reverse justify-start min-w-9'>
            {Array.from({ length: cardCount }).map((_, i) => (
              <Sprite key={`card-${i}`} id='card' color='nord-10' size={size} className='-mr-1.5' />
            ))}
            {Array.from({ length: 2 - cardCount }).map((_, i) => (
              <Sprite key={`card-${i}`} id='card' color='nord-3' size={size} className='-mr-1.5' />
            ))}
          </div>
        )}
        <CoinStack count={coins} size={size} color='nord-14' bgColor={bgColor} watchChanges={isActiveGame} />
      </div>
    </div>
  )
}
