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
  const textColor = ['nord-15', 'nord-14', 'nord-13'].includes(bgColor) ? 'nord-0' : 'nord-6'

  return (
    <>
      {/* <TooltipProvider>
 <Tooltip open={isPopoverOpen}>
  <TooltipTrigger asChild> */}
      <div
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl duration-500 ${isPopoverOpen ? `outline-2 outline-offset-4 outline-${bgColor} outline` : ''}`}
      >
        <PlayerNameTag {...nameTagProps} />
        <div className={`flex-auto w-full grid grid-cols-${influence.length} gap-2`}>
          {influence.map(card => (
            <PlayingCard key={card.id} isFaceDown={!game || game.status === 'WAITING'} {...card} />
          ))}
        </div>
        {isPopoverOpen && (
          <div
            className={`tooltip-content flex flex-col-reverse absolute bottom-[100%] px-3 py-0 rounded-md text-${textColor}`}
            style={
              {
                marginBottom: '12px',
                '--accent-color': `var(--${bgColor})`
              } as React.CSSProperties
            }
          >
            {opponentMessage.message}
            {/* {isActor ? <>Current Player</> : isBlocker ? <>Blocker</> : isChallenger ? <>Challenger</> : null} */}
          </div>
        )}
      </div>
      {/* </TooltipTrigger>
        <TooltipContent>
          <div
            className={`tooltip-content relative px-3 py-1 font-medium rounded-md text-${textColor}`}
            style={{ '--accent-color': `var(--${bgColor})` } as React.CSSProperties}
          >
            {isActor ? <>Current Player</> : isBlocker ? <>Blocker</> : isChallenger ? <>Challenger</> : null}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider> */}
    </>
  )
}
