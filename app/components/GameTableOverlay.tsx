import React, { useEffect, useRef } from 'react'
import cn from 'classnames'

interface GameTableOverlayProps extends React.PropsWithChildren {
  heading: string
  className?: string
}

export const GameTableOverlay: React.FC<GameTableOverlayProps> = ({ heading, className, children }) => {
  return (
    <div className='absolute inset-0' role='dialog' aria-labelledby='overlay-heading' tabIndex={-1}>
      <div
        className={cn(
          'flex flex-col items-stretch w-full h-full px-6 py-4 bg-ui overflow-y-scroll no-scrollbar relative',
          className
        )}
      >
        <h2 id='overlay-heading' className='text-2xl text-center'>
          {heading}
        </h2>
        {children}
      </div>
    </div>
  )
}
