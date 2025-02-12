import React from 'react'
import type { Action } from '~/types'
import { Drawer, DrawerContent } from './Drawer'
import { Button } from './Button'
import { useGameSocket } from '~/hooks/socket'

interface ResponseControlsProps {
  onResponse: (type: 'accept' | 'challenge' | 'block') => void
  timeoutAt: number
  heading: string
  subheading?: string
  availableResponses: {
    canAccept: boolean
    canChallenge: boolean
    canBlock: boolean
  }
  label: string
}

export const ResponseControls: React.FC<ResponseControlsProps> = ({
  onResponse,
  timeoutAt,
  heading,
  subheading,
  availableResponses,
  label
}) => {
  return (
    <Drawer defaultOpen>
      <DrawerContent className='p-4'>
        <div className='px-2 mb-4'>
          <h3 className='text-xl font-bold'>{heading}</h3>
          {subheading && <p className='text-base'>{subheading}</p>}
        </div>
        <div className='grid gap-4 grid-cols-1'>
          {availableResponses.canAccept && (
            <Button
              size='lg'
              variant='success'
              onClick={() => onResponse('accept')}
              sprite='check'
              timeoutAt={timeoutAt}
            >
              Accept {label}
            </Button>
          )}
          {availableResponses.canBlock && (
            <Button
              size='lg'
              variant='warning'
              onClick={() => onResponse('block')}
              sprite='shield'
              timeoutAt={timeoutAt}
            >
              Block {label}
            </Button>
          )}
          {availableResponses.canChallenge && (
            <Button
              size='lg'
              variant='danger'
              onClick={() => onResponse('challenge')}
              sprite='challenge'
              timeoutAt={timeoutAt}
            >
              Challenge {label}
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
