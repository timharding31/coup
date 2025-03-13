import React from 'react'
import cn from 'classnames'
import { Link } from '@remix-run/react'
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { Button, ButtonProps } from './Button'
import { Player } from '~/types'
import { useDrawerHeight } from './Drawer'
import { AnimatePresence, motion } from 'framer-motion'

interface IdentityPopoverProps extends Player<'server' | 'client'> {
  buttonProps?: Partial<Pick<ButtonProps, 'variant' | 'size' | 'color'>>
}

export const IdentityPopover: React.FC<IdentityPopoverProps> = ({ username, buttonProps }) => {
  const { variant = 'primary', size = 'sm', color = 'nord-6' } = buttonProps || {}
  return (
    <Popover className='relative w-[50px] h-9'>
      <PopoverButton
        as={Button}
        sprite='avatar'
        variant={variant}
        size={size}
        color={color}
        className='absolute inset-0 z-10'
      />

      <PopoverPanel>
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.1 }}
            className='absolute rounded-b-md min-w-48 top-[-4px] right-[-4px] pt-12 bg-nord-0 shadow-lg ring-1 ring-nord--1 ring-opacity-5 focus:outline-none origin-top-right'
          >
            <div className='mb-2 pl-6 pr-1'>
              <span className='text-xs text-nord-4'>Username</span>
              <p className='text-lg text-nord-6 font-bold flex justify-between items-baseline'>
                {username}
                <Link to='/settings'>
                  <Button size='sm' sprite='pencil' color='nord-6' className='inline-flex' />
                </Link>
              </p>
            </div>
            <div className='p-6'>
              <Link to='/logout' className='contents'>
                <Button size='sm' variant='secondary' className='w-full'>
                  Logout
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </PopoverPanel>
    </Popover>
  )
}
