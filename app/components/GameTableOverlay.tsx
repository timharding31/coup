import React, { useEffect, useRef } from 'react'
import cn from 'classnames'
import { Button, ButtonProps } from './Button'

interface GameTableOverlayProps extends React.PropsWithChildren {
  heading: string
  buttonProps: Pick<ButtonProps, 'variant' | 'onClick' | 'disabled' | 'children' | 'sprite'> | null
  className?: string
}

export const GameTableOverlay: React.FC<GameTableOverlayProps> = ({ heading, buttonProps, className, children }) => {
  return (
    <div className='absolute inset-0' role='dialog' aria-labelledby='overlay-heading' tabIndex={-1}>
      <div
        className={cn(
          'flex flex-col items-stretch w-full h-full px-6 bg-ui overflow-y-scroll no-scrollbar relative',
          className
        )}
      >
        <h2 id='overlay-heading' className='text-2xl text-center pt-6 pb-2'>
          {heading}
        </h2>
        {children}
        {buttonProps && (
          <div className='sticky bottom-0 pt-2 pb-6 bg-ui'>
            <Button size='lg' className='w-full' {...buttonProps} />
          </div>
        )}
      </div>
    </div>
  )
}
