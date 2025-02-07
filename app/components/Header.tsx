import React from 'react'
import styles from './styles.css'
import { Button } from './Button'
import { Link } from '@remix-run/react'
import { useGame } from '~/hooks/socket'

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
  const game = useGame()
  return (
    <header className='p-2 flex items-center justify-between gap-2 bg-nord-0 nord-shadow'>
      <Link to='/' className='flex items-center'>
        <Button variant='primary' size='sm'>
          ←
        </Button>
        <h1 className='text-3xl'>coup</h1>
      </Link>
      <div className='ml-2 text-base'>
        pin: <strong>{game?.pin}</strong>
      </div>
    </header>
  )
}
