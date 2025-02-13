import React from 'react'
import { Link } from '@remix-run/react'
import { Button } from './Button'
import { Slide, ToastContainer } from 'react-toastify'

export const Header: React.FC = () => {
  return (
    <header className='relative px-2 h-16 flex items-center justify-between gap-2 bg-nord-0 z-52'>
      <Link to='/' className='flex items-center'>
        <Button variant='primary' size='sm' sprite='arrow-left' />
        <h1 className='text-3xl'>coup</h1>
      </Link>
      {/* <ToastContainer
        position='top-center'
        autoClose={30_000}
        hideProgressBar={true}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
        transition={Slide}
        toastClassName='bg-nord--1 p-2'
        className='absolute top-[52px] left-0 right-0 z-51'
      /> */}
    </header>
  )
}
