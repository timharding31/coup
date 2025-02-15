import React from 'react'
import { PlayingCard } from './PlayingCard'
import { useGame, usePlayerMessage } from '~/context/CoupContext'
import { Player } from '~/types'
import { PlayerNameTag } from './PlayerNameTag'

interface OpponentHandProps extends Player<'client'> {
  isActor?: boolean
  isBlocker?: boolean
  isChallenger?: boolean
}

export const OpponentHand: React.FC<OpponentHandProps> = ({
  isActor = false,
  isBlocker = false,
  isChallenger = false,
  influence,
  ...nameTagProps
}) => {
  const game = useGame()

  const opponentMessage = usePlayerMessage(nameTagProps.id)
  const isPopoverOpen = game?.status === 'IN_PROGRESS' && opponentMessage
  const bgColor = opponentMessage?.color ? opponentMessage.color : isActor ? 'nord-15' : 'transparent'
  const textColor = ['nord-15', 'nord-14', 'nord-13', 'nord-12'].includes(bgColor) ? 'nord-0' : 'nord-6'

  return (
    <div className='relative flex flex-col items-center justify-center gap-2'>
      <PlayerNameTag {...nameTagProps} bgColor='nord-1' />

      <div className={`flex-auto w-full grid grid-cols-${Math.max(2, influence.length)} gap-2`}>
        {influence.map(card => (
          <PlayingCard key={card.id} isFaceDown={!game || game.status === 'WAITING'} {...card} />
        ))}
      </div>

      {isPopoverOpen && (
        <div className='tooltip-content z-20'>
          <span
            className={`whitespace-nowrap w-fit text-center absolute bottom-[100%] left-[50%] -mb-1 translate-x-[-50%] px-3 py-0 rounded-md text-${textColor} bg-${bgColor}`}
          >
            {opponentMessage.message}
          </span>
        </div>
      )}
    </div>
  )
}
