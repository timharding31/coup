import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { MessageData, MessageType } from '~/utils/messages'
import { motion, AnimatePresence } from 'framer-motion'
import { ActionType, CardType, NordColor } from '~/types'
import { Sprite } from './Sprite'
import { ActionIcon, SpriteWithMargin } from './ActionIcon'

const DEFAULT_STYLE = 'bg-nord-6 text-nord-0'

const MESSAGE_STYLE: Record<Exclude<MessageType, ActionType>, string> = {
  info: DEFAULT_STYLE,
  challenge: 'bg-nord-11 text-nord-6',
  block: 'bg-nord-13 text-nord-0',
  failure: 'bg-nord-11-dark text-nord-6',
  success: 'bg-nord-14 text-nord-0'
  // INCOME: DEFAULT_STYLE,
  // FOREIGN_AID: 'bg-cyan-900 text-cyan-200',
  // TAX: characterColorSchemes['DUKE'] + ' ' + characterTextColors['DUKE'],
  // STEAL: characterColorSchemes['CAPTAIN'] + ' ' + characterTextColors['CAPTAIN'],
  // EXCHANGE: characterColorSchemes['AMBASSADOR'] + ' ' + characterTextColors['AMBASSADOR'],
  // ASSASSINATE: characterColorSchemes['ASSASSIN'] + ' ' + characterTextColors['ASSASSIN'],
  // COUP: 'bg-nord-0 text-nord-8'
}

const BG_STRIPE_COLOR: Record<Exclude<MessageType, ActionType>, NordColor> = {
  info: 'nord-4',
  challenge: 'nord-11-dark',
  block: 'nord-13-dark',
  failure: 'nord-11-darkest',
  success: 'nord-14-dark'
}

const LoadingBackground: React.FC<{ type?: MessageType }> = ({ type }) => {
  switch (type) {
    case 'info':
    case 'challenge':
    case 'block':
    case 'failure':
    case 'success':
      return (
        <div className={classNames('absolute inset-0 overflow-hidden rounded-md -z-10', MESSAGE_STYLE[type])}>
          <motion.div
            className='absolute inset-0 striped-background'
            style={
              {
                '--bg-stripe': `var(--${BG_STRIPE_COLOR[type]})`
              } as React.CSSProperties
            }
            animate={{
              x: [0, -56] // 56px is twice the stripe width (28px)
            }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'linear',
              duration: 1
            }}
          />
        </div>
      )

    default:
      throw new Error(`Invalid message type: ${type}`)
  }
}

const getTagSizeClass = (size: 'base' | 'sm' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'text-[12px]'

    case 'base':
      return 'text-[14px]'

    case 'lg':
      return 'text-[16px]'
  }
}

const CardTag: React.FC<{ type: CardType; size?: 'sm' | 'base' | 'lg' }> = ({ type, size = 'base' }) => {
  return (
    <motion.span
      className={classNames(
        'inline-flex items-center mx-1 rounded-md tracking-wide font-normal font-robotica gap-1 align-middle',
        getTagSizeClass(size)
      )}
      initial={{ x: 10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 15,
        delay: 0.2
      }}
    >
      <Sprite id='card' size='sm' color='nord-10' />
      <span className='translate-y-[0.125em]'>{type}</span>
    </motion.span>
  )
}

const TargetTag: React.FC<{ name: string; isBot?: boolean; size?: 'sm' | 'base' | 'lg' }> = ({
  name,
  isBot = true,
  size = 'base'
}) => {
  return (
    <motion.span
      className={classNames(
        'inline-flex items-center mx-1 rounded-md tracking-wide text-[14px] font-normal font-robotica gap-1 align-middle',
        getTagSizeClass(size)
      )}
      initial={{ x: 10, opacity: 0, skewX: 0 }}
      animate={{ x: 0, opacity: 1, skewX: -4 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 15,
        delay: 0.2
      }}
    >
      <Sprite id={isBot ? 'robot' : 'avatar'} size='sm' color='nord-0' />
      <span className='translate-y-[0.125em]'>{name}</span>
    </motion.span>
  )
}

interface GameMessageProps {
  message: MessageData
  size?: 'base' | 'sm' | 'lg'
  className?: string
}

export const GameMessage: React.FC<GameMessageProps> = ({ message, size = 'base', className = '' }) => {
  const { text, type, isWaiting, cardType = null, target = null, delayMs = 0, action = null, sprite = null } = message
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])

  useEffect(() => {
    // Auto-hide after 10 seconds if it's not a waiting message
    if (!isWaiting) {
      const timer = setTimeout(() => setIsVisible(false), 10_000)
      return () => clearTimeout(timer)
    }
  }, [isWaiting])

  // Split text into individual characters for staggered animation
  const textArray: React.ReactNode[] = text.split('')
  if (action) {
    textArray.unshift(<ActionIcon action={action} size='sm' color='nord-0' />)
  } else if (sprite) {
    textArray.unshift(<SpriteWithMargin id={sprite} size='sm' />)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.span
          className={classNames(
            'relative w-fit max-w-full inline-flex items-center justify-center text-center rounded-md shadow-lg overflow-hidden',
            MESSAGE_STYLE[type],
            className,
            {
              'bg-transparent': isWaiting,
              'px-2 py-0.5': size === 'sm',
              'px-3 py-1': size === 'base',
              'px-4 py-1.5': size === 'lg',
              'pl-5': action === 'INCOME' || action === 'FOREIGN_AID' || action === 'TAX'
            }
          )}
          initial={{
            opacity: 0,
            scale: 0.5,
            y: -20,
            rotateX: 90
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            rotateX: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            y: 10,
            transition: { duration: 0.3 }
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {isWaiting && <LoadingBackground type={type} />}

          <div className='flex flex-wrap items-center justify-center gap-1 max-w-full'>
            {/* Message text with staggered character animation */}
            <div
              className={classNames('inline-flex items-center font-bold leading-5 relative', {
                'text-[14px]': size === 'sm',
                'text-[16px]': size === 'base',
                'text-[20px]': size === 'lg'
              })}
            >
              {textArray.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 15,
                    delay: i * 0.02,
                    mass: 0.6
                  }}
                >
                  {char === ' ' ? <>&nbsp;</> : char}
                </motion.span>
              ))}
            </div>

            {cardType || target ? (
              <div className='inline-flex flex-wrap'>
                {cardType && <CardTag type={cardType} size={size} />}
                {target && <TargetTag name={target} size={size} />}
              </div>
            ) : null}
          </div>

          <motion.div
            className='absolute inset-0 rounded-md bg-white'
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        </motion.span>
      )}
    </AnimatePresence>
  )
}

// Tooltip wrapper for GameMessage
export const TooltipGameMessage: React.FC<GameMessageProps> = props => {
  return (
    <div className='absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center z-50 w-fit max-w-[calc(100cqi+1rem)]'>
      <GameMessage key={props.message.text} {...props} />
    </div>
  )
}
