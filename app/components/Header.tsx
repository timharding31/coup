import React from 'react'
import { Link } from '@remix-run/react'
import { Button } from './Button'
import { Slide, ToastContainer } from 'react-toastify'

export const Header: React.FC = () => {
  return (
    <header className='relative p-2 pl-0 flex items-center justify-between gap-2 bg-nord-0 z-52'>
      <Link to='/' className='flex items-center'>
        <Button variant='primary' size='sm' sprite='arrow-left' />
        <h1 className='text-4xl'>coup</h1>
      </Link>
    </header>
  )
}
