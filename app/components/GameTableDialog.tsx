import React, { useEffect, useRef } from 'react'
import classNames from 'classnames'
import { Button, ButtonProps } from './Button'
import { Form } from '@remix-run/react'

interface DialogButtonProps extends Pick<ButtonProps, 'variant' | 'disabled' | 'children' | 'sprite'> {
  url: string
}

interface GameTableDialogProps extends React.PropsWithChildren {
  heading: string
  actions: DialogButtonProps | null
  className?: string
}

export const GameTableDialog: React.FC<GameTableDialogProps> = ({ heading, actions, className, children }) => {
  return (
    <div className='absolute inset-0' role='dialog' aria-labelledby='overlay-heading' tabIndex={-1}>
      <div
        className={classNames(
          'flex flex-col items-stretch w-full h-full px-6 overflow-y-scroll no-scrollbar relative',
          className
        )}
      >
        <h2 id='overlay-heading' className='text-2xl text-center pt-6 pb-2'>
          {heading}
        </h2>
        {children}
        {actions && (
          <div className='sticky bottom-0 pt-2 pb-6'>
            <Form action={actions.url} method='POST'>
              <Button size='lg' className='w-full' {...actions} type='submit' />
            </Form>
          </div>
        )}
      </div>
    </div>
  )
}
