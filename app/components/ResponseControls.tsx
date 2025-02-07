import React from 'react'
import type { Action, CardType } from '~/types'
import { BlockControls } from './BlockControls'
import { ChallengeControls } from './ChallengeControls'
import { Drawer, DrawerContent } from './Drawer'
import { Button } from './Button'
import { useGameSocket } from '~/hooks/socket'

interface ResponseControlsProps {
  onResponse: (type: 'accept' | 'challenge' | 'block') => void
  action: Action
  availableResponses: {
    canAccept: boolean
    canChallenge: boolean
    canBlock: boolean
  }
}

export const ResponseControls: React.FC<ResponseControlsProps> = ({ onResponse, action, availableResponses }) => {
  const { turn } = useGameSocket()

  const opponentAction = turn?.phase === 'WAITING_FOR_BLOCK_RESPONSE' ? `BLOCK` : action.type.replace('_', ' ')

  return (
    <Drawer defaultOpen>
      <DrawerContent className='px-4 py-6'>
        <div className='grid gap-4 grid-cols-1'>
          {availableResponses.canAccept && (
            <Button
              size='lg'
              variant='success'
              onClick={() => onResponse('accept')}
              sprite='check'
              timeoutAt={turn?.timeoutAt}
            >
              Accept {opponentAction}
            </Button>
          )}
          {availableResponses.canBlock && (
            <Button
              size='lg'
              variant='warning'
              onClick={() => onResponse('block')}
              sprite='shield'
              timeoutAt={turn?.timeoutAt}
            >
              Block {action.type.replace('_', ' ')}
            </Button>
          )}
          {availableResponses.canChallenge && (
            <Button
              size='lg'
              variant='danger'
              onClick={() => onResponse('challenge')}
              sprite='challenge'
              timeoutAt={turn?.timeoutAt}
            >
              Challenge {opponentAction}
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
