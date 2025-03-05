import React, { useEffect, useState } from 'react'
import cn from 'classnames'
import { MessageData, MessageType } from '~/utils/messages'
import { motion, AnimatePresence } from 'framer-motion'
import { NordColor } from '~/types'

const MESSAGE_STYLE: Record<MessageType, string> = {
  info: 'bg-nord-6 text-nord-0',
  challenge: 'bg-nord-11 text-nord-6',
  block: 'bg-nord-13 text-nord-0',
  failure: 'bg-nord-11-dark text-nord-6',
  success: 'bg-nord-14 text-nord-0'
}

const BG_STRIPE_COLOR: Record<MessageType, NordColor> = {
  info: 'nord-4',
  challenge: 'nord-11-dark',
  block: 'nord-13-dark',
  failure: 'nord-11-darkest',
  success: 'nord-14-dark'
}

const LoadingBackground: React.FC<{ type?: MessageType }> = ({ type = 'success' }) => {
  return (
    <div className={cn('absolute inset-0 overflow-hidden rounded-md -z-10', MESSAGE_STYLE[type])}>
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
}

// Custom target tag with highlighted styling
const TargetTag = ({ name }: { name: string }) => {
  return (
    <motion.span
      className='inline-flex items-center ml-1 px-2 pt-1 pb-0 rounded-lg bg-nord-1 text-nord-6 font-robotica border border-nord-0 mb-[1px] tracking-wide'
      initial={{ x: 10, opacity: 0, skewX: 0 }}
      animate={{ x: 0, opacity: 1, skewX: -4 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 15,
        delay: 0.2
      }}
    >
      {name.replace('🤖 ', '🤖')}
    </motion.span>
  )
}

interface GameMessageProps {
  message: MessageData
  className?: string
}

export const GameMessage = ({ message, className = '' }: GameMessageProps) => {
  const { text, type, isWaiting, target = null, delayMs = 0 } = message
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])

  useEffect(() => {
    // Auto-hide after 5 seconds if it's not a waiting message
    if (!isWaiting) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 5_000)

      return () => clearTimeout(timer)
    }
  }, [isWaiting])

  // Split text into individual characters for staggered animation
  const textArray = text.split('')

  // Custom spring presets based on message type
  const springPresets = {
    info: { type: 'spring', stiffness: 200, damping: 15 },
    challenge: { type: 'spring', stiffness: 300, damping: 10 },
    block: { type: 'spring', stiffness: 400, damping: 8 },
    failure: { type: 'spring', stiffness: 300, damping: 5 },
    success: { type: 'spring', stiffness: 200, damping: 10 }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.span
          className={cn(
            'relative w-fit text-center px-3 py-1 rounded-md shadow-lg overflow-hidden leading-4',
            MESSAGE_STYLE[type],
            className,
            { 'bg-transparent': isWaiting }
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
          transition={springPresets[type]}
          layout
        >
          {isWaiting && <LoadingBackground type={type} />}

          {/* Message text with staggered character animation */}
          <motion.div className='inline-block font-bold'>
            {textArray.map((char, index) => (
              <motion.span
                key={index}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 15,
                  delay: index * 0.02, // Stagger effect
                  mass: 0.6
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>

          {target && <TargetTag name={target} />}

          {/* Flash effect overlay */}
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
    <div className='tooltip-content absolute -left-2 -right-2 top-10 flex items-center justify-center z-10'>
      <GameMessage key={props.message.text} {...props} />
    </div>
  )
}
