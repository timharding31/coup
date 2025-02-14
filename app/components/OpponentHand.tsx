import React from 'react'
import { PlayingCard } from './PlayingCard'
import { useGame, usePlayerMessages } from '~/context/CoupContext'
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

  // const isPopoverOpen = game?.status === 'IN_PROGRESS' && (isActor || isBlocker || isChallenger)
  const accentColor = isActor ? 'nord-14' : isBlocker ? 'nord-13' : isChallenger ? 'nord-11' : ''
  const popoverTextColor = isChallenger ? 'nord-5' : 'nord-0'

  const opponentMessages = usePlayerMessages(nameTagProps.id)
  const isPopoverOpen = game?.status === 'IN_PROGRESS' && opponentMessages.length > 0

  return (
    <>
      {/* <TooltipProvider>
 <Tooltip open={isPopoverOpen}>
  <TooltipTrigger asChild> */}
      <div
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl duration-500 ${isPopoverOpen ? `outline-2 outline-offset-4 outline-${accentColor} outline` : ''}`}
      >
        <PlayerNameTag {...nameTagProps} />
        <div className={`flex-auto w-full grid grid-cols-${influence.length} gap-2`}>
          {influence.map(card => (
            <PlayingCard key={card.id} isFaceDown={!game || game.status === 'WAITING'} {...card} />
          ))}
        </div>
        {isPopoverOpen && (
          <ul
            className={`tooltip-content list-reset flex flex-col-reverse absolute bottom-[100%] px-3 py-0 rounded-md text-${popoverTextColor}`}
            style={
              {
                marginBottom: '12px',
                '--accent-color': `var(--${accentColor})`
              } as React.CSSProperties
            }
          >
            {opponentMessages.reverse().map((message, index) => (
              <li key={index}>{message}</li>
            ))}
            {/* {isActor ? <>Current Player</> : isBlocker ? <>Blocker</> : isChallenger ? <>Challenger</> : null} */}
          </ul>
        )}
      </div>
      {/* </TooltipTrigger>
        <TooltipContent>
          <div
            className={`tooltip-content relative px-3 py-1 font-medium rounded-md text-${popoverTextColor}`}
            style={{ '--accent-color': `var(--${accentColor})` } as React.CSSProperties}
          >
            {isActor ? <>Current Player</> : isBlocker ? <>Blocker</> : isChallenger ? <>Challenger</> : null}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider> */}
    </>
  )
}
