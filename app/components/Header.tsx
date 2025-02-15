import React from 'react'
import { Link, LinkProps } from '@remix-run/react'
import { Button } from './Button'
import { usePlayers } from '~/context/CoupContext'
import { IdentityPopover } from './IdentityPopover'

interface HeaderProps {
  showIdentityPopoverTrigger?: boolean
  backButton?: LinkProps['to']
}

export const Header: React.FC<HeaderProps> = ({ backButton = '/', showIdentityPopoverTrigger = true }) => {
  const { myself = null } = usePlayers() || {}
  return (
    <header className='relative flex items-center justify-between gap-2 bg-nord-0 p-1'>
      <Link to={backButton} className='flex items-center'>
        <Button variant='primary' size='sm' sprite='arrow-left' />
        <h1 className='text-4xl'>coup</h1>
      </Link>
      {showIdentityPopoverTrigger && myself && <IdentityPopover {...myself} />}
    </header>
  )
}
