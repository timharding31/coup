import React, { useState, useEffect, useRef } from 'react'
import cn from 'classnames'
import { useMergedRefs } from '~/hooks/useMergedRefs'
import { Sprite, SpriteId } from './Sprite'
import CoinStack from './CoinStack'
import { PlayerNameTag } from './PlayerNameTag'

export const variantStyles = {
  // Nord
  primary:
    'bg-nord-0 text-nord-6 hover:bg-nord--1 hover:nord-shadow hover:-translate-y-0.5 active:bg-nord--1 active:translate-y-0 disabled:bg-nord-3',
  // Frost
  secondary:
    'bg-nord-8 text-nord-0 hover:bg-nord-9 hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-9 active:translate-y-0 disabled:bg-nord-3',
  // Nord Outline
  tertiary:
    'bg-nord-6 text-nord-0 border-2 border-nord-0 hover:bg-nord-5 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:bg-nord-3',
  success:
    'bg-nord-14 text-nord-0 hover:bg-nord-14-dark hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-14-dark active:translate-y-0 disabled:bg-[#b3ce9c]',
  danger:
    'bg-nord-11 text-nord-6 hover:bg-nord-11-dark hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-11-dark active:translate-y-0 disabled:bg-[#cf717a]',
  warning:
    'bg-nord-13 text-nord-0 hover:bg-nord-13-dark hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-13-dark active:translate-y-0 disabled:bg-[#fbdb9b]'
}

// Size styles remain the same
export const sizeStyles = {
  base: 'h-10 px-6 py-2 text-sm',
  sm: 'h-9 px-4 text-base',
  lg: 'h-11 pl-8 pr-4 text-lg'
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
  timeoutAt?: number
  sprite?: SpriteId | 'arrow-left' | null
  coinStack?: 1 | 2 | 3
  nameTag?: React.ComponentProps<typeof PlayerNameTag>
}

const TimerBackground = ({ timeoutAt, variant }: { timeoutAt: number; variant: keyof typeof variantStyles }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!timeoutAt || timeoutAt <= Date.now()) {
      return
    }

    const updateProgress = () => {
      const total = 20_000 // 20 seconds in milliseconds
      const now = Date.now()
      const remainingTime = timeoutAt - now
      const elapsedTime = total - remainingTime
      const calculated = (elapsedTime / total) * 100
      setProgress(Math.min(100, Math.max(0, calculated)))
    }

    updateProgress()
    const interval = setInterval(updateProgress, 1_000)
    return () => clearInterval(interval)
  }, [timeoutAt])

  let progressColor

  switch (variant) {
    case 'success':
      progressColor = 'bg-nord-14-dark'
      break
    case 'warning':
      progressColor = 'bg-nord-13-dark'
      break
    case 'danger':
      progressColor = 'bg-nord-11-dark'
      break
    case 'primary':
      progressColor = 'bg-nord-1'
      break
    case 'secondary':
      progressColor = 'bg-nord-9'
      break
    case 'tertiary':
      progressColor = 'bg-nord-5'
      break
    default:
      progressColor = 'bg-gray-700'
      break
  }

  if (timeoutAt <= Date.now()) {
    return null
  }

  return (
    <div className='absolute inset-0'>
      <div
        className={`absolute inset-0 ${progressColor} transition-transform duration-1000 ease-linear`}
        data-progress={progress}
        style={{
          transformOrigin: 'left center',
          transform: `scaleX(${1 - progress / 100})` // Removed the 1 - since we want it to progress from 0 to 1
        }}
      />
    </div>
  )
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'base',
      timeoutAt,
      sprite = null,
      coinStack = null,
      children = null,
      nameTag = null,
      ...props
    },
    forwardedRef
  ) => {
    const innerRef = useRef<HTMLButtonElement>(null)
    const isOutline = variant.endsWith('Outline')
    const hasIcon = sprite || coinStack
    const isDisabled = props.disabled

    const getContentGapClass = () => {
      if ((sprite || isDisabled) && size === 'lg') return 'gap-4'
      if ((sprite || isDisabled) && (size === 'base' || size === 'sm')) return 'gap-3'
      if (coinStack && !isDisabled && size === 'lg') return 'gap-3'
      if (coinStack && !isDisabled && (size === 'base' || size === 'sm')) return 'gap-2'
      return ''
    }

    const getCoinStackMargin = () => {
      if (!coinStack) return ''
      const margins = {
        1: '-ml-[4px]',
        2: '-ml-[8px]',
        3: '-ml-[12px]'
      }
      return margins[coinStack as keyof typeof margins] || ''
    }

    const classes = cn(
      // Base classes
      'relative flex items-center transition-all duration-200 focus-visible:outline-none',
      'disabled:pointer-events-none disabled:opacity-50 font-bold rounded-xl',

      // Variant and size styles
      variantStyles[variant],
      sizeStyles[size],

      // Layout classes
      {
        'overflow-hidden': timeoutAt,
        'justify-start': hasIcon,
        'justify-center': !hasIcon && !nameTag
      },

      getContentGapClass(),
      className
    )

    return (
      <button className={classes} ref={useMergedRefs(forwardedRef, innerRef)} {...props}>
        {timeoutAt && !isOutline && <TimerBackground timeoutAt={timeoutAt} variant={variant} />}

        {isDisabled && hasIcon ? (
          <Sprite id='lock' size={size} />
        ) : coinStack ? (
          <CoinStack count={coinStack} color='nord-6' className={getCoinStackMargin()} />
        ) : sprite ? (
          <Sprite
            id={sprite === 'arrow-left' ? 'arrow' : sprite}
            className={sprite === 'arrow-left' ? 'rotate-180 z-50' : 'z-50'}
            size={size}
          />
        ) : null}

        {nameTag ? (
          <PlayerNameTag {...nameTag} />
        ) : children ? (
          <span
            className={cn('relative font-sansation font-bold', {
              'translate-y-[0.125em]': false,
              'flex flex-auto': hasIcon,
              'leading-[2.25rem]': size === 'sm',
              'leading-[2.5rem]': size === 'base',
              'leading-[2.75rem]': size === 'lg'
            })}
          >
            {children}
          </span>
        ) : null}
      </button>
    )
  }
)

Button.displayName = 'Button'
