import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { useCoupContext } from '~/context/CoupContext'
import type { ActionType, Player, TargetedActionType, UntargetedActionType } from '~/types'
import { Button } from './Button'
import { Drawer, DrawerContent, useDrawerOpenAtom } from './Drawer'
import { ACTION_REQUIREMENTS } from '~/utils/action'
import { SpriteId } from './Sprite'
import { action } from '../routes/_index'
import { DrawerTrigger } from './DrawerTrigger'

const SHARED_STYLES = 'transition-transform duration-200 ease-in-out w-full grid gap-3 grid-cols-1'

function getSpriteFromActionType(actionType: ActionType): SpriteId | undefined {
  switch (actionType) {
    case 'STEAL':
      return 'steal'
    case 'EXCHANGE':
      return 'exchange'
    case 'ASSASSINATE':
      return 'sword'
    case 'COUP':
      return 'skull'
  }
}

function getCoinGainAmountFromActionType(actionType: ActionType): 1 | 2 | 3 | undefined {
  switch (actionType) {
    case 'INCOME':
      return 1
    case 'FOREIGN_AID':
      return 2
    case 'TAX':
      return 3
  }
}

function isTargetedAction(actionType: ActionType): actionType is TargetedActionType {
  return ['STEAL', 'ASSASSINATE', 'COUP'].includes(actionType)
}

const ALL_ACTIONS: ActionType[] = ['INCOME', 'FOREIGN_AID', 'TAX', 'EXCHANGE', 'STEAL', 'ASSASSINATE', 'COUP']

interface ActionControlsProps {
  targets: Player<'client'>[]
  coins: number
}

export const ActionControls: React.FC<ActionControlsProps> = ({ targets, coins: playerCoins }) => {
  const { performTargetedAction, performUntargetedAction, isLoading } = useCoupContext()
  const [targetedAction, setTargetedAction] = useState<TargetedActionType>()
  const forceCoup = playerCoins >= 10

  return (
    <>
      <Drawer dismissible>
        <DrawerContent className='p-4'>
          <div className='relative overflow-x-hidden'>
            <div
              className={classNames(SHARED_STYLES, 'h-[460px]', {
                'translate-x-[-100%]': targetedAction
              })}
            >
              <div className='px-2'>
                <h3 className='text-xl font-bold'>It's your turn</h3>
                <p className='text-base text-nord-4'>Select an available action</p>
              </div>

              {ALL_ACTIONS.map(actionType => {
                const { coinCost } = ACTION_REQUIREMENTS[actionType]
                let isDisabled = coinCost > Math.max(playerCoins, 0) || (forceCoup && actionType !== 'COUP')
                return (
                  <Button
                    key={actionType}
                    size='lg'
                    variant='primary'
                    onClick={() => {
                      if (isTargetedAction(actionType)) {
                        setTargetedAction(actionType)
                      } else {
                        performUntargetedAction(actionType)
                      }
                    }}
                    coinStack={getCoinGainAmountFromActionType(actionType)}
                    sprite={getSpriteFromActionType(actionType)}
                    coinCost={coinCost || undefined}
                    disabled={isDisabled}
                    isLoading={isLoading}
                  >
                    {actionType.replace('_', ' ')}
                  </Button>
                )
              })}
            </div>

            <div
              className={classNames(SHARED_STYLES, 'absolute top-0 left-0 right-0', {
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
                {targets.map(target => {
                  const unrevealedCardCount = target.influence.reduce<number>(
                    (ct, card) => ct + Number(!card.isRevealed),
                    0
                  )
                  return (
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
                      disabled={unrevealedCardCount < 1 || (targetedAction === 'STEAL' && target.coins < 1)}
                      nameTag={{
                        ...target,
                        cardCount: unrevealedCardCount,
                        className: 'text-lg'
                      }}
                      isLoading={isLoading}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <DrawerTrigger size='lg' heading="It's your turn" label='Start' />
    </>
  )
}
