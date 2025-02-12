import React from 'react'
import { Link } from '@remix-run/react'
import { Button } from './Button'

export const Header: React.FC = () => {
  return (
    <header className='p-2 flex items-center justify-between gap-2 bg-nord-0'>
      <Link to='/' className='flex items-center'>
        <Button variant='primary' size='sm' sprite='arrow-left' />
        <h1 className='text-3xl'>coup</h1>
      </Link>
    </header>
  )
}
