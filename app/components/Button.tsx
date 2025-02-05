import { darken, lighten } from 'polished'
import React, { useState, useEffect, useRef } from 'react'
import { useMergedRefs } from '~/hooks/useMergedRefs'

export const variantStyles = {
  neutral:
    'bg-gray-600 text-white hover:bg-gray-700 hover:nord-shadow hover:-translate-y-0.5 active:bg-gray-800 active:translate-y-0 disabled:bg-gray-300',
  neutralOutline:
    'bg-white border-2 border-gray-600 text-gray-600 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-gray-300 disabled:text-gray-400',

  amber:
    'bg-amber-500 text-white hover:bg-amber-600 hover:nord-shadow hover:-translate-y-0.5 active:bg-amber-700 active:translate-y-0 disabled:bg-amber-200',
  amberOutline:
    'bg-white border-2 border-amber-500 text-amber-500 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-amber-200 disabled:text-amber-300',

  black:
    'bg-black text-white hover:bg-neutral-900 hover:nord-shadow hover:-translate-y-0.5 active:bg-neutral-950 active:translate-y-0 disabled:bg-neutral-400',
  blackOutline:
    'bg-white border-2 border-black text-black hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-neutral-400 disabled:text-neutral-500',

  blue: 'bg-blue-600 text-white hover:bg-blue-700 hover:nord-shadow hover:-translate-y-0.5 active:bg-blue-800 active:translate-y-0 disabled:bg-blue-300',
  blueOutline:
    'bg-white border-2 border-blue-600 text-blue-600 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-blue-300 disabled:text-blue-400',

  rose: 'bg-rose-500 text-white hover:bg-rose-600 hover:nord-shadow hover:-translate-y-0.5 active:bg-rose-700 active:translate-y-0 disabled:bg-rose-200',
  roseOutline:
    'bg-white border-2 border-rose-500 text-rose-500 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-rose-200 disabled:text-rose-300',

  purple:
    'bg-purple-600 text-white hover:bg-purple-700 hover:nord-shadow hover:-translate-y-0.5 active:bg-purple-800 active:translate-y-0 disabled:bg-purple-300',
  purpleOutline:
    'bg-white border-2 border-purple-600 text-purple-600 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-purple-300 disabled:text-purple-400',

  red: 'bg-floral-red text-white hover:grayscale-25 hover:nord-shadow hover:-translate-y-0.5 active:bg-red-950 active:translate-y-0 disabled:bg-red-300',
  redOutline:
    'bg-white border-2 border-floral-red text-floral-red hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-red-300 disabled:text-red-400',

  emerald:
    'bg-emerald-600 text-white hover:bg-emerald-700 hover:nord-shadow hover:-translate-y-0.5 active:bg-emerald-800 active:translate-y-0 disabled:bg-emerald-300',
  emeraldOutline:
    'bg-white border-2 border-emerald-600 text-emerald-600 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-emerald-300 disabled:text-emerald-400',

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
    'bg-nord-11 text-white hover:bg-nord-11-dark hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-11-dark active:translate-y-0 disabled:bg-[#cf717a]',
  warning:
    'bg-nord-13 text-nord-0 hover:bg-nord-13-dark hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-13-dark active:translate-y-0 disabled:bg-[#fbdb9b]'
}

// Size styles remain the same
export const sizeStyles = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8',
  icon: 'h-10 w-10'
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

function getSpriteViewBox(sprite: SpriteId) {
  const DEFAULT_VIEWBOX = '-32 -32 64 64'
  const ALT_VIEWBOX = '0 0 256 256'

  switch (sprite) {
    case 'sword':
    case 'skull':
    case 'shield':
    case 'steal':
    case 'lock':
    case 'challenge':
    case 'exchange':
      return DEFAULT_VIEWBOX

    case 'token-1':
    case 'token-2':
    case 'token-3':
    case 'check':
      return ALT_VIEWBOX
  }
}

const Sprite: React.FC<{ sprite: SpriteId; size: keyof typeof sizeStyles }> = props => {
  const size = props.size === 'lg' ? 32 : 24

  let viewBox: string

  switch (props.sprite) {
    case 'sword':
    case 'skull':
    case 'shield':
    case 'steal':
    case 'lock':
    case 'challenge':
    case 'exchange':
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
    <span className='relative flex items-center justify-center h-full w-auto'>
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
  sprite?: SpriteId | null
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
    case 'neutral':
      progressColor = 'bg-gray-700'
      break
    case 'amber':
      progressColor = 'bg-amber-600'
      break
    case 'black':
      progressColor = 'bg-neutral-900'
      break
    case 'blue':
      progressColor = 'bg-blue-700'
      break
    case 'rose':
      progressColor = 'bg-rose-600'
      break
    case 'purple':
      progressColor = 'bg-purple-700'
      break
    case 'red':
      progressColor = 'bg-red-900'
      break
    case 'emerald':
      progressColor = 'bg-emerald-700'
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
  ({ className = '', variant = 'neutral', size = 'default', timeoutAt, sprite = null, ...props }, forwardedRef) => {
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
        {sprite && <Sprite sprite={props.disabled ? 'lock' : sprite} size={size} />}
        <span className='relative'>{props.children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'
