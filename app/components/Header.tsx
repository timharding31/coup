import React from 'react'
import { Link, LinkProps } from '@remix-run/react'
import { Button } from './Button'
import { usePlayers } from '~/context/CoupContext'
import { IdentityPopover } from './IdentityPopover'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  showIdentityPopoverTrigger?: boolean
}

export const Header: React.FC<HeaderProps> = ({ 
  showIdentityPopoverTrigger = true, 
  className = '',
  ...rest 
}) => {
  const { myself = null } = usePlayers() || {}
  return (
    <header 
      className={`relative flex items-center justify-between gap-2 bg-nord-0 p-1 pl-6 border-b border-nord-3 ${className}`}
      {...rest}
    >
      <Link to='/' className='flex items-end'>
        {/* <Button variant='primary' size='sm' sprite='arrow-left' /> */}
        <h1 className='text-3xl'>polar coup</h1>
      </Link>
      {showIdentityPopoverTrigger && myself && <IdentityPopover {...myself} />}
    </header>
  )
}
