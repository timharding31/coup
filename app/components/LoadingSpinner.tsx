import React from 'react'
import cn from 'classnames'
import { Sprite } from './Sprite'

interface LoadingSpinnerProps {
  loading?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ loading = false }) => {
  return (
    <div
      className={cn(
        'fixed top-0 left-max right-max bottom-0 flex items-center justify-center pb-12 bg-nord-0/50 transition-opacity backdrop-blur-sm',
        {
          'pointer-events-none opacity-0': !loading
        }
      )}
    >
      <Sprite id='spinner' color='nord-8' size={120} className='animate-spin' />
    </div>
  )
}
