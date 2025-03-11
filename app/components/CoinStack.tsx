import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Sprite, SpriteProps, SpriteSize } from './Sprite'
import { NordColor } from '~/types'
import cn from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import _ from 'lodash'

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
  const ref = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new ResizeObserver(
      _.debounce(() => {
        const el = ref.current
        if (!el) return
        setRect(el.getBoundingClientRect())
      }, 50)
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (watchChanges && count !== prevCountRef.current) {
      const diff = count - prevCountRef.current
      setChangeAmount(diff)
      setShowAnimation(true)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setShowAnimation(true)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setShowAnimation(false)
        }, 1_000)
      }, 50)

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
    <div ref={ref}>
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
      <AnimatePresence>
        {showAnimation && (
          <CoinStackChange
            changeAmount={changeAmount}
            className='fixed z-50'
            style={!rect ? {} : { top: `${rect.top - 20}px`, left: `${rect.right - 24}px` }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface CoinStackChangeProps extends React.HTMLAttributes<HTMLDivElement> {
  changeAmount: number
}

const CoinStackChange: React.FC<CoinStackChangeProps> = ({ changeAmount, ...rest }) => {
  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.1 }}
      style={rest.style}
      className={rest.className}
    >
      <div
        className={cn('text-[14px] text-right whitespace-nowrap w-[24px] leading-[24px] font-robotica font-normal', {
          'text-nord-14': changeAmount > 0,
          'text-nord-11': changeAmount < 0
        })}
      >
        {changeAmount > 0 ? '+' : ''}
        {changeAmount}
      </div>
    </motion.div>,
    document.getElementById('root')!
  )
}

export default CoinStack
