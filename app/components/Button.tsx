import { darken, lighten } from 'polished'
import React, { useState, useEffect, useRef } from 'react'
import { useMergedRefs } from '~/hooks/useMergedRefs'

export const variantStyles = {
  // Nord
  primary:
    'bg-nord-0 text-nord-6 hover:bg-nord-1 hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-2 active:translate-y-0 disabled:bg-nord-3',
  // Frost
  secondary:
    'bg-nord-8 text-nord-0 hover:bg-nord-9 hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-10 active:translate-y-0 disabled:bg-nord-3',
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
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8'
}

type SpriteId =
  | 'sword'
  | 'skull'
  | 'shield'
  | 'steal'
  | 'lock'
  | 'challenge'
  | 'exchange'
  | 'token-1'
  | 'token-2'
  | 'token-3'
  | 'check'
  | 'dollar'
  | 'arrow'

export const Sprite: React.FC<{ sprite: SpriteId; size: keyof typeof sizeStyles; dir?: 'right' | 'left' }> = props => {
  const size = props.size === 'lg' ? 32 : props.size === 'sm' ? 18 : 24

  let viewBox: string

  switch (props.sprite) {
    case 'sword':
    case 'skull':
    case 'shield':
    case 'steal':
    case 'lock':
    case 'challenge':
    case 'exchange':
    case 'arrow':
    case 'dollar':
      viewBox = '-32 -32 64 64'
      break

    case 'token-1':
    case 'token-2':
    case 'token-3':
    case 'check':
      viewBox = '0 0 256 256'
      break
  }

  return (
    <span
      className={`relative flex items-center justify-center h-full w-auto ${props.dir === 'left' ? 'rotate-180' : ''}`}
    >
      <svg width={`${size}`} height={`${size}`} viewBox={viewBox}>
        <use href={`#${props.sprite}`}></use>
      </svg>
    </span>
  )
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
  timeoutAt?: number
  sprite?: SpriteId | 'arrow-left' | null
}

const TimerBackground = ({ timeoutAt, variant }: { timeoutAt: number; variant: keyof typeof variantStyles }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!timeoutAt) {
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
    const interval = setInterval(updateProgress, 1000)
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
    { className = '', variant = 'primary', size = 'default', timeoutAt, sprite = null, children = null, ...props },
    forwardedRef
  ) => {
    const baseClasses =
      'relative inline-flex items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-bold rounded-xl'
    const isOutline = variant.endsWith('Outline')
    const innerRef = useRef<HTMLButtonElement>(null)

    return (
      <button
        className={`${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${timeoutAt ? 'overflow-hidden' : ''} ${className} ${sprite ? 'justify-start gap-4' : 'justify-center'}`}
        ref={useMergedRefs(forwardedRef, innerRef)}
        {...props}
      >
        {timeoutAt && !isOutline && <TimerBackground timeoutAt={timeoutAt} variant={variant} />}
        {sprite && (
          <Sprite
            sprite={props.disabled ? 'lock' : sprite === 'arrow-left' ? 'arrow' : sprite}
            size={size}
            dir={sprite == 'arrow-left' ? 'left' : 'right'}
          />
        )}
        {children && <span className='relative font-robotica'>{children}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
