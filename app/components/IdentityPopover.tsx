import React from 'react'
import { Link } from '@remix-run/react'
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { Button, ButtonProps } from './Button'
import { Player } from '~/types'

interface IdentityPopoverProps extends Player<'server' | 'client'> {
  buttonProps?: Partial<Pick<ButtonProps, 'variant' | 'size' | 'color'>>
}

export const IdentityPopover: React.FC<IdentityPopoverProps> = ({ username, buttonProps }) => {
  const { variant = 'primary', size = 'sm', color = 'nord-6' } = buttonProps || {}
  return (
    <Popover className='relative w-[46px] h-9'>
      <PopoverButton
        as={Button}
        sprite='avatar'
        variant={variant}
        size={size}
        color={color}
        className='absolute inset-0 z-50'
      />

      <Transition
        enter='transition duration-200 ease-out'
        enterFrom='scale-95 opacity-0'
        enterTo='scale-100 opacity-100'
        leave='transition duration-100 ease-in'
        leaveFrom='scale-100 opacity-100'
        leaveTo='scale-95 opacity-0'
      >
        <PopoverPanel className='absolute z-40 rounded-b-md min-w-48 top-[-4px] right-[-4px] pt-12 bg-nord-0 shadow-lg ring-1 ring-nord--1 ring-opacity-5 focus:outline-none origin-top-right'>
          <div className=''>
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
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  )
}
