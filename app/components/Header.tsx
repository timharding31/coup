import React from 'react'
import classNames from 'classnames'
import { Link } from '@remix-run/react'
import { usePlayers } from '~/context/CoupContext'
import { IdentityPopover } from './IdentityPopover'
import { Player } from '~/types'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  player?: Player<'server' | 'client'>
}

export const Header: React.FC<HeaderProps> = ({ className, player, ...rest }) => {
  const myself = usePlayers()?.myself || player || null
  return (
    <header
      className={classNames(
        'relative z-40 flex items-center justify-between gap-2 bg-nord-0 p-1 pl-6 border-b border-nord-3',
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
