import React from 'react'
import { ActionType, NordColor } from '~/types'
import { CoinStack } from './CoinStack'
import { Sprite, SpriteId } from './Sprite'
import cn from 'classnames'

const ACTION_COUNTS: { [K in Extract<ActionType, 'INCOME' | 'FOREIGN_AID' | 'TAX'>]: number } = {
  INCOME: 1,
  FOREIGN_AID: 2,
  TAX: 3
}

const ACTION_SPRITES: { [K in Exclude<ActionType, 'INCOME' | 'FOREIGN_AID' | 'TAX'>]: SpriteId } = {
  EXCHANGE: 'exchange',
  STEAL: 'steal',
  ASSASSINATE: 'sword',
  COUP: 'skull'
}

interface ActionIconProps {
  action: ActionType
  size?: 'sm' | 'base' | 'lg'
  color?: NordColor
  bgColor?: NordColor
}

export const ActionIcon: React.FC<ActionIconProps> = ({
  action,
  color = 'nord-0',
  bgColor = 'nord-6',
  size = 'sm'
}) => {
  switch (action) {
    case 'INCOME':
    case 'FOREIGN_AID':
    case 'TAX':
      return <CoinStackWithMargin count={ACTION_COUNTS[action]} color={color} bgColor={bgColor} size={size} />

    case 'EXCHANGE':
    case 'STEAL':
    case 'ASSASSINATE':
    case 'COUP':
      return <SpriteWithMargin id={ACTION_SPRITES[action]} color={color} size={size} />
  }
}

interface SpriteWithMarginProps {
  id: SpriteId
  color: NordColor
  size: 'sm' | 'base' | 'lg'
}

export const SpriteWithMargin: React.FC<SpriteWithMarginProps> = ({ id, color, size }) => {
  return (
    <Sprite
      id={id}
      size={size}
      color={color}
      className={cn({
        'mr-4': size === 'lg',
        'mr-3': size === 'base',
        'mr-0.5': size === 'sm'
      })}
    />
  )
}

interface CoinStackWithMarginProps {
  count: number
  size?: 'sm' | 'base' | 'lg'
  color: NordColor
  bgColor: NordColor
}

export const CoinStackWithMargin: React.FC<CoinStackWithMarginProps> = ({ count, color, bgColor, size = 'base' }) => {
  return (
    <CoinStack
      count={count}
      color={color}
      bgColor={bgColor}
      className={cn({
        '-ml-[4px]': count === 1,
        '-ml-[8px]': count === 2,
        '-ml-[12px]': count === 3,
        'mr-3': size === 'lg',
        'mr-2': size === 'base',
        'mr-1': size === 'sm'
      })}
      size={size === 'lg' ? 'base' : size === 'base' ? 'sm' : 'xs'}
    />
  )
}
