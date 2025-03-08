import React from 'react'
import cn from 'classnames'
import { Link } from '@remix-run/react'
import { usePlayers } from '~/context/CoupContext'
import { IdentityPopover } from './IdentityPopover'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

export const Header: React.FC<HeaderProps> = ({ className, ...rest }) => {
  const { myself = null } = usePlayers() || {}
  return (
    <header
      className={cn(
        'relative z-50 flex items-center justify-between gap-2 bg-nord-0 p-1 pl-6 border-b border-nord-3 nord-shadow',
        className
      )}
      {...rest}
    >
      <Link to='/'>
        <h1 className='text-3xl'>polar coup</h1>
      </Link>
      {myself && <IdentityPopover {...myself} />}
    </header>
  )
}
