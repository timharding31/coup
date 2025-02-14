import React from 'react'
import cn from 'classnames'
import { NordColor } from '~/types'

export type SpriteId =
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

export const SpriteSize = {
  sm: 18,
  base: 24,
  lg: 32
}
export type SpriteSize = keyof typeof SpriteSize

export interface SpriteProps {
  id: SpriteId
  size: SpriteSize | number
  className?: string
  color?: NordColor
}

export const Sprite: React.FC<SpriteProps> = ({ id, size, color, className }) => {
  let width = typeof size === 'number' ? size : SpriteSize[size],
    viewBox: string,
    svgClassName: string | undefined

  switch (id) {
    case 'link':
      viewBox = '0 0 16 16'
      break

    case 'sword':
    case 'skull':
    case 'shield':
    case 'steal':
    case 'lock':
    case 'challenge':
    case 'exchange':
    case 'arrow':
    case 'dollar':
    case 'card':
    case 'card-outline':
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
      viewBox = '0 0 512 512'
      width = 14
      break

    case 'crown':
      viewBox = '0 0 512 512'
      break
  }

  return (
    <span className={cn('flex items-center justify-center aspect-square', `w-[${width}px] text-${color}`, className)}>
      <svg width={width} height={width} viewBox={viewBox} className={svgClassName}>
        <use href={`#${id}`}></use>
      </svg>
    </span>
  )
}
