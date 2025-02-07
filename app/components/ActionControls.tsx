import React, { useState } from 'react'
import { useGameSocket } from '~/hooks/socket'
import type { Player, TargetedActionType } from '~/types'
import { Button } from './Button'
import { Drawer, DrawerContent, DrawerTrigger } from './Drawer'
import { AnimatePresence, motion } from 'framer-motion'

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
        <AnimatePresence mode='wait'>
          {targetedAction && (
            <motion.div
              key='targets'
              className='absolute top-0 left-0 w-full grid gap-4 grid-cols-1 p-4'
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
            >
              <div className='flex items-center mb-4'>
                <Button
                  variant='primary'
                  size='sm'
                  sprite='arrow-left'
                  onClick={() => setTargetedAction(undefined)}
                  className='mr-2'
                />
                <div className='text-lg font-bold'>
                  {targetedAction}
                  {targetedAction === 'STEAL' ? ' from' : ''} which player?
                </div>
              </div>
              <div className='grid gap-4 grid-cols-1'>
                {targets.map(target => (
                  <Button
                    key={`target-${target.id}`}
                    size='lg'
                    variant='secondary'
                    className='w-full'
                    onClick={() => {
                      performTargetedAction(targetedAction, target.id)
                    }}
                  >
                    {target.username} ({target.coins} coins)
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
          <div className={`grid gap-4 grid-cols-1 ${targetedAction ? 'invisible' : ''}`}>
            <div className='px-2'>
              <h3 className='text-xl font-bold'>It's your turn</h3>
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
        </AnimatePresence>
      </DrawerContent>
    </Drawer>
  )
}
