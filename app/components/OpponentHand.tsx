import React from 'react'
import { PlayingCard } from './PlayingCard'
import { useGame, usePlayerMessage } from '~/context/CoupContext'
import { Player, PlayerMessage } from '~/types'
import { PlayerNameTag } from './PlayerNameTag'

const MESSAGE_STYLE: Record<PlayerMessage['type'], string> = {
  info: 'bg-nord-8 text-nord-0',
  challenge: 'bg-nord-11 text-nord-6',
  block: 'bg-nord-13 text-nord-0',
  failure: 'bg-nord-11-dark text-nord-6',
  success: 'bg-nord-14 text-nord-0'
}

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
            className={`whitespace-nowrap w-fit text-center px-3 py-0 rounded-md absolute bottom-[100%] left-[50%] -mb-1 translate-x-[-50%] ${MESSAGE_STYLE[opponentMessage.type]}`}
          >
            {opponentMessage.message}
          </span>
        </div>
      )}
    </div>
  )
}
