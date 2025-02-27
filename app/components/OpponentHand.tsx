import React from 'react'
import { PlayingCard } from './PlayingCard'
import { useGame, usePlayerMessage } from '~/context/CoupContext'
import { Player } from '~/types'
import { PlayerNameTag } from './PlayerNameTag'
import { TooltipGameMessage } from './GameMessage'
import { MessageData } from '~/store/messageStore'

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
  const message: MessageData | null = usePlayerMessage(nameTagProps.id)
  const isPopoverOpen = game?.status === 'IN_PROGRESS' && message

  return (
    <div className='relative flex flex-col items-center justify-center gap-2'>
      <PlayerNameTag {...nameTagProps} bgColor='nord-1' />

      <div className={`flex-auto w-full grid grid-cols-${Math.max(2, influence.length)} gap-2`}>
        {influence.map(card => (
          <PlayingCard key={card.id} isFaceDown={!game || game.status === 'WAITING'} {...card} />
        ))}
      </div>

      {isPopoverOpen && <TooltipGameMessage message={message} />}
    </div>
  )
}
