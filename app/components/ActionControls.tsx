import React, { useState } from 'react'
import { useCoupContext } from '~/context/CoupContext'
import type { Player, TargetedActionType } from '~/types'
import { Button } from './Button'
import { Drawer, DrawerContent } from './Drawer'
import cn from 'classnames'
import { PlayerNameTag } from './PlayerNameTag'

const SHARED_STYLES = 'transition-transform duration-200 ease-in-out w-full grid gap-3 grid-cols-1'

interface ActionControlsProps {
  targets: Player<'client'>[]
  coins: number
}

export const ActionControls: React.FC<ActionControlsProps> = ({ targets, coins }) => {
  const { performTargetedAction, performUntargetedAction } = useCoupContext()
  const [targetedAction, setTargetedAction] = useState<TargetedActionType>()
  const forceCoup = coins >= 10

  return (
    <Drawer open>
      <DrawerContent className='p-4'>
        <div className='relative overflow-x-hidden'>
          <div
            className={cn(SHARED_STYLES, 'h-[460px]', {
              'translate-x-[-100%]': targetedAction
            })}
          >
            <div className='px-2'>
              <h3 className='text-xl font-bold'>It's your turn</h3>
              <p className='text-base text-nord-4'>Select an available action</p>
            </div>

            <Button
              size='lg'
              variant='primary'
              onClick={() => {
                performUntargetedAction('INCOME')
              }}
              coinStack={1}
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
              coinStack={2}
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
              coinStack={3}
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
            <div className='grid gap-4 grid-cols-1 mb-auto'>
              {targets.map(target => (
                <Button
                  key={`target-${target.id}`}
                  size='lg'
                  variant='primary'
                  className='w-full'
                  onClick={() => {
                    if (targetedAction) {
                      performTargetedAction(targetedAction, target.id)
                    }
                  }}
                  nameTag={{
                    ...target,
                    cardCount: target.influence.reduce<number>((ct, i) => ct - Number(i.isRevealed), 2) as 1 | 2,
                    className: 'text-lg'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
