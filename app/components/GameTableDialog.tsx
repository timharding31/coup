import React, { useEffect, useRef } from 'react'
import classNames from 'classnames'
import { Button, ButtonProps } from './Button'
import { Form } from '@remix-run/react'

interface BaseDialogButtonProps extends Pick<ButtonProps, 'variant' | 'disabled' | 'children' | 'sprite'> {}

interface FormDialogButtonProps extends BaseDialogButtonProps {
  url: string
  onClick?: never
}
interface ButtonDialogButtonProps extends BaseDialogButtonProps {
  url?: never
  onClick: () => void
}

type DialogButtonProps = FormDialogButtonProps | ButtonDialogButtonProps

interface GameTableDialogProps extends React.PropsWithChildren {
  heading: string
  actions: DialogButtonProps | DialogButtonProps[] | null
  className?: string
}

export const GameTableDialog: React.FC<GameTableDialogProps> = ({ heading, actions, className, children }) => {
  const actionsList = !actions ? [] : Array.isArray(actions) ? actions : [actions]
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
        <div
          className={classNames('sticky bottom-0 pt-2 pb-6 empty:hidden grid grid-rows-1 grid-cols-1 gap-2', {
            'grid-cols-[2fr_3fr]': actionsList.length > 1
          })}
        >
          {actionsList.map(({ url, onClick, ...action }, i) => (
            <div key={i}>
              {url ? (
                <Form action={url} method='POST'>
                  <Button size='lg' className='w-full' {...action} type='submit' />
                </Form>
              ) : (
                <Button size='lg' {...action} className='w-full' onClick={onClick} type='button' />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
