import React from 'react'
import { Link } from '@remix-run/react'
import { Button } from './Button'
import { Popover, Transition } from '@headlessui/react'
import { usePlayers } from '~/context/CoupContext'

export const Header: React.FC = () => {
  const { myself = null } = usePlayers() || {}
  return (
    <header className='relative flex items-center justify-between gap-2 bg-nord-0 p-1'>
      <Link to='/' className='flex items-center'>
        <Button variant='primary' size='sm' sprite='arrow-left' />
        <h1 className='text-4xl'>coup</h1>
      </Link>
      {myself && (
        <Popover className='relative'>
          <Popover.Button as={Button} variant='primary' size='sm' sprite='avatar' color='nord-6' />

          <Transition
            enter='transition duration-200 ease-out'
            enterFrom='scale-95 opacity-0'
            enterTo='scale-100 opacity-100'
            leave='transition duration-100 ease-in'
            leaveFrom='scale-100 opacity-100'
            leaveTo='scale-95 opacity-0'
          >
            <Popover.Panel className='fixed z-50 rounded-b-md w-48 right-max top-12 bg-nord-0 shadow-lg ring-1 ring-nord--1 ring-opacity-5 focus:outline-none origin-top-right'>
              <div className='p-6 pt-3'>
                <div className='mb-8'>
                  <span className='text-xs text-nord-4'>Username</span>
                  <p className='text-lg text-nord-6 font-bold'>{myself.username}</p>
                </div>
                <Link to='/logout' className='contents'>
                  <Button size='sm' variant='secondary' className='w-full'>
                    Logout
                  </Button>
                </Link>
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>
      )}
    </header>
  )
}
