import React from 'react'
import classNames from 'classnames'
import { NordColor } from '~/types'

export type SpriteId =
  | 'question'
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
  | 'chip'
  | 'avatar'
  | 'card'
  | 'card-outline'
  | 'link'
  | 'crown'
  | 'pencil'
  | 'spinner'
  | 'exclamation'
  | 'loading'
  | 'plus'
  | 'robot'
  | 'target'
  | 'info'

export const SpriteSize = {
  xs: 16,
  sm: 18,
  base: 24,
  lg: 32
}
export type SpriteSize = keyof typeof SpriteSize

export interface SpriteProps {
  id: SpriteId
  size: SpriteSize | number
  className?: string
  color?: NordColor | 'purple-400' | 'emerald-400' | 'amber-400'
}

export const Sprite: React.FC<SpriteProps> = ({
  id,
  size,
  color = id === 'robot' ? 'nord-0' : undefined,
  className
}) => {
  let width = typeof size === 'number' ? size : SpriteSize[size],
    viewBox: string,
    svgClassName: string | undefined

  switch (id) {
    case 'question':
      viewBox = '0 0 36 36'
      break

    case 'link':
      viewBox = '0 0 16 16'
      break

    case 'sword':
    case 'skull':
    case 'shield':
    case 'lock':
    case 'challenge':
    case 'exchange':
    case 'arrow':
    case 'dollar':
    case 'card':
    case 'card-outline':
    case 'loading':
      viewBox = '-32 -32 64 64'
      break

    case 'token-1':
    case 'token-2':
    case 'token-3':
    case 'check':
      viewBox = '0 0 256 256'
      break

    case 'chip':
      viewBox = '0 0 200 200'
      break

    case 'avatar':
      viewBox = '-128 -104 720 720'
      break

    case 'crown':
    case 'steal':
    case 'target':
      viewBox = '0 0 512 512'
      break

    case 'pencil':
      viewBox = '0 0 700 700'
      break

    case 'spinner':
      viewBox = '0 0 100 101'
      break

    case 'exclamation':
      viewBox = '0 0 45.311 45.311'
      break

    case 'plus':
      viewBox = '0 0 45.402 45.402'
      break

    case 'robot':
      viewBox = '0 0 16 16'
      break

    case 'info':
      viewBox = '0 0 490 490'
      break
  }

  return (
    <span
      className={classNames(
        'flex items-center justify-center aspect-square',
        `w-[${width}px] text-${color}`,
        className
      )}
    >
      <svg width={width} height={width} viewBox={viewBox} className={svgClassName}>
        <use href={`#${id}`}></use>
      </svg>
    </span>
  )
}

/*

*/
