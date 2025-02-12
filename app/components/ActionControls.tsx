import React, { useState } from 'react'
import { useGameSocket } from '~/hooks/socket'
import type { Player, TargetedActionType } from '~/types'
import { Button } from './Button'
import { Drawer, DrawerContent } from './Drawer'
import cn from 'classnames'

const SHARED_STYLES = 'transition-transform duration-200 ease-in-out w-full grid gap-4 grid-cols-1'

interface ActionControlsProps {
  targets: Player<'client'>[]
  coins: number
}

export const ActionControls: React.FC<ActionControlsProps> = ({ targets, coins }) => {
  const { performTargetedAction, performUntargetedAction } = useGameSocket()
  const [targetedAction, setTargetedAction] = useState<TargetedActionType>()
  const forceCoup = coins >= 10

  return (
    <Drawer defaultOpen>
      <DrawerContent className='p-4'>
        <div className='relative overflow-x-hidden'>
          <div
            className={cn(SHARED_STYLES, {
              'translate-x-[-100%]': targetedAction
            })}
          >
            <div className='px-2'>
              <h3 className='text-xl'>It's your turn</h3>
              <p className='text-base'>Select an available action:</p>
            </div>

            <Button
              size='lg'
              variant='primary'
              onClick={() => {
                performUntargetedAction('INCOME')
              }}
              sprite='token-1'
              disabled={forceCoup}
            >
              INCOME
            </Button>
            <Button
              size='lg'
              variant='primary'
              onClick={() => {
                performUntargetedAction('FOREIGN_AID')
              }}
              sprite='token-2'
              disabled={forceCoup}
            >
              FOREIGN AID
            </Button>
            <Button
              size='lg'
              variant='primary'
              onClick={() => {
                performUntargetedAction('TAX')
              }}
              sprite='token-3'
              disabled={forceCoup}
            >
              TAX
            </Button>
            <Button
              size='lg'
              variant='primary'
              onClick={() => performUntargetedAction('EXCHANGE')}
              sprite='exchange'
              disabled={forceCoup}
            >
              EXCHANGE
            </Button>
            <Button
              size='lg'
              variant='primary'
              onClick={() => setTargetedAction('STEAL')}
              sprite='steal'
              disabled={forceCoup}
            >
              STEAL
            </Button>
            <Button
              size='lg'
              variant='primary'
              onClick={() => setTargetedAction('ASSASSINATE')}
              sprite='sword'
              disabled={coins < 3 || forceCoup}
            >
              ASSASSINATE
            </Button>
            <Button
              size='lg'
              variant='primary'
              onClick={() => setTargetedAction('COUP')}
              sprite='skull'
              disabled={coins < 7}
            >
              COUP
            </Button>
          </div>

          <div
            className={cn(SHARED_STYLES, 'absolute top-0 left-0 right-0', {
              'translate-x-[100%]': !targetedAction
            })}
          >
            <div className='flex items-center mb-4'>
              <Button
                variant='primary'
                size='sm'
                sprite='arrow-left'
                onClick={() => setTargetedAction(undefined)}
                className='mr-2'
              />
              <h3 className='text-xl'>
                {targetedAction}
                {targetedAction === 'STEAL' ? ' from' : ''} which player?
              </h3>
            </div>
            <div className='grid gap-4 grid-cols-1'>
              {targets.map(target => (
                <Button
                  key={`target-${target.id}`}
                  size='lg'
                  variant='secondary'
                  className='w-full'
                  onClick={() => {
                    if (targetedAction) {
                      performTargetedAction(targetedAction, target.id)
                    }
                  }}
                >
                  {target.username} ({target.coins} coins)
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
