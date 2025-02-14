import React from 'react'
import cn from 'classnames'
import { Sprite, SpriteSize } from './Sprite'
import { NordColor } from '~/types'

const HORIZONTAL_OFFSET: Record<SpriteSize, number> = {
  sm: 3,
  base: 4,
  lg: 6
}

interface CoinStackProps {
  count: number
  size?: SpriteSize
  color?: NordColor
  bgColor?: NordColor
  className?: string
}

const CoinStack: React.FC<CoinStackProps> = ({
  count = 0,
  size = 'base',
  color = 'nord-14',
  bgColor = 'nord-0',
  className
}) => {
  const safeCount = Math.min(Math.max(0, count), 12)
  const offset = HORIZONTAL_OFFSET[size]

  return (
    <div
      className={cn('flex flex-row-reverse justify-center', className, {
        'gap-1': size === 'lg',
        'gap-0.5': size !== 'lg'
      })}
    >
      <span
        className={cn(
          `font-robotica translate-y-[0.125em] text-${size} text-${color} inline-block w-[1em] text-center`,
          {
            'leading-[18px]': size === 'sm',
            'leading-6': size === 'base',
            'leading-8': size === 'lg'
          }
        )}
      >
        {count}
      </span>
      <div
        className='relative'
        style={{
          height: `${SpriteSize[size]}px`,
          width: `${(safeCount - 1) * offset + SpriteSize[size]}px`
        }}
      >
        {Array.from({ length: safeCount }).map((_, index) => (
          <span
            key={index}
            className={`absolute bg-${bgColor} rounded-full`}
            style={{
              right: `${(safeCount - 1 - index) * offset}px`
            }}
          >
            <Sprite id='chip' size={size} color={color} className='scale-95' />
          </span>
        ))}
      </div>
    </div>
  )
}

export default CoinStack
