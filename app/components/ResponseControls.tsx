import React from 'react'
import type { Action, CardType } from '~/types'
import { Drawer, DrawerContent } from './Drawer'
import { Button } from './Button'
import { useCoupContext } from '~/context/CoupContext'

interface ResponseControlsProps {
  onResponse: (type: 'accept' | 'challenge' | 'block', blockCard?: CardType) => void
  timeoutAt: number
  heading: React.ReactNode
  subheading?: React.ReactNode
  availableResponses: {
    canAccept: boolean
    canChallenge: boolean
    canBlock: boolean
  }
  blockableBy: CardType[]
  label: string
  isLoading?: boolean
}

export const ResponseControls: React.FC<ResponseControlsProps> = ({
  onResponse,
  timeoutAt,
  heading,
  subheading,
  availableResponses,
  blockableBy,
  label,
  isLoading
}) => {
  return (
    <Drawer open>
      <DrawerContent className='p-4'>
        <div className='px-2 mb-4'>
          <h3 className='text-xl font-bold'>{heading}</h3>
          {subheading && <p className='text-base text-nord-4'>{subheading}</p>}
        </div>
        <div className='grid gap-4 grid-cols-1'>
          {availableResponses.canAccept && (
            <Button
              size='lg'
              variant='success'
              onClick={() => onResponse('accept')}
              sprite='check'
              timeoutAt={timeoutAt}
              isLoading={isLoading}
            >
              Accept {label}
            </Button>
          )}
          {availableResponses.canBlock && (
            <>
              {blockableBy.map(card => (
                <Button
                  key={card}
                  size='lg'
                  variant='warning'
                  onClick={() => onResponse('block', card)}
                  sprite='shield'
                  timeoutAt={timeoutAt}
                  isLoading={isLoading}
                >
                  Block {label}
                  <span className='absolute -right-1 text-[11px]'>(claim {card})</span>
                </Button>
              ))}
            </>
          )}
          {availableResponses.canChallenge && (
            <Button
              size='lg'
              variant='danger'
              onClick={() => onResponse('challenge')}
              sprite='challenge'
              timeoutAt={timeoutAt}
              isLoading={isLoading}
            >
              Challenge {label}
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
