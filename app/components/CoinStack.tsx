import React, { useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { Sprite, SpriteProps, SpriteSize } from './Sprite'
import { NordColor } from '~/types'

const HORIZONTAL_OFFSET: Record<SpriteSize, number> = {
  sm: 3,
  base: 4,
  lg: 6
}

interface CoinStackProps {
  count: number
  size?: SpriteSize
  color?: SpriteProps['color']
  bgColor?: NordColor
  className?: string
  watchChanges?: boolean
}

const CoinStack: React.FC<CoinStackProps> = ({
  count = 0,
  size = 'base',
  color = 'nord-14',
  bgColor = 'nord-0',
  className,
  watchChanges = false
}) => {
  const [showAnimation, setShowAnimation] = useState(false)
  const [changeAmount, setChangeAmount] = useState(0)
  const prevCountRef = useRef(count)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (watchChanges && count !== prevCountRef.current) {
      const diff = count - prevCountRef.current
      setChangeAmount(diff)
      setShowAnimation(true)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setShowAnimation(false)
      }, 2000)

      prevCountRef.current = count
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [count, watchChanges])

  const safeCount = Math.min(Math.max(0, count), 12)
  const offset = HORIZONTAL_OFFSET[size]

  return (
    <div className='relative'>
      <div
        className={cn('flex flex-row-reverse justify-center', className, {
          'gap-1': size === 'lg',
          'gap-0.5': size !== 'lg'
        })}
      >
        {count > 0 && (
          <span
            className={cn(
              `text-shadow-1 font-robotica translate-y-[0.125em] text-${size} text-${color} inline-block w-[1em] text-center no-underline`,
              {
                'leading-[18px]': size === 'sm',
                'leading-6': size === 'base',
                'leading-8': size === 'lg'
              }
            )}
            style={
              {
                '--text-shadow-color': `var(--${bgColor})`
              } as React.CSSProperties
            }
          >
            {count}
          </span>
        )}
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

      {showAnimation && (
        <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 font-robotica font-normal rounded-full shadow-lg z-10 aspect-square grid place-content-center animate-coin-change'>
          <span className='text-sm text-center inline-block w-[28px] whitespace-nowrap translate-y-[0.125em] text-nord-4'>
            {changeAmount > 0 ? '+' : ''}
            {changeAmount}
          </span>
          <div className='-z-10 absolute inset-0 rounded-full bg-nord-0'>
            <Sprite id='chip' size={28} color={changeAmount > 0 ? 'nord-14-dark' : 'nord-11'} className='scale-95' />
          </div>
        </div>
      )}
    </div>
  )
}

export default CoinStack
