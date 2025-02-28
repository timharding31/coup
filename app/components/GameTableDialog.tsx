import React, { useEffect, useRef } from 'react'
import cn from 'classnames'
import { Button, ButtonProps } from './Button'

interface DialogButtonProps extends Pick<ButtonProps, 'variant' | 'onClick' | 'disabled' | 'children' | 'sprite'> {}

interface GameTableDialogProps extends React.PropsWithChildren {
  heading: string
  actions: { primary: DialogButtonProps; secondary?: DialogButtonProps } | null
  className?: string
}

export const GameTableDialog: React.FC<GameTableDialogProps> = ({ heading, actions, className, children }) => {
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
        {actions && (
          <div className='sticky bottom-0 pt-2 pb-6 bg-ui'>
            {actions.secondary ? (
              <div className='w-full grid grid-cols-[1fr_2fr] gap-2'>
                <Button size='lg' {...actions.secondary} />
                <Button size='lg' {...actions.primary} />
              </div>
            ) : (
              <Button size='lg' className='w-full' {...actions.primary} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
