import React from 'react'
import cn from 'classnames'
import { MessageData, MessageType } from '~/utils/messages'
import { WaitingEllipsis } from './WaitingEllipsis'

// Define styles for different message types
const MESSAGE_STYLE: Record<MessageType, string> = {
  info: 'bg-nord-8 text-nord-0',
  challenge: 'bg-nord-11 text-nord-6',
  block: 'bg-nord-13 text-nord-0',
  failure: 'bg-nord-11-dark text-nord-6',
  success: 'bg-nord-14 text-nord-0'
}

interface GameMessageProps {
  message: MessageData
  className?: string
}

export const GameMessage: React.FC<GameMessageProps> = ({ message, className = '' }) => {
  const { text, type, isWaiting, target = null } = message

  return (
    <span className={cn('text-center px-1 py-0 rounded-md', MESSAGE_STYLE[type], className)}>
      {text}
      {target && (
        <>
          &nbsp;<strong>@{target}</strong>
        </>
      )}
      {isWaiting && <WaitingEllipsis />}
    </span>
  )
}

// Tooltip wrapper for GameMessage
export const TooltipGameMessage: React.FC<GameMessageProps> = props => {
  return (
    <div className='tooltip-content absolute left-0 right-0 top-10 flex items-center justify-center z-10'>
      <GameMessage {...props} className={props.className} />
    </div>
  )
}
