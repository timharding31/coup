import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'
import { useIsHydrated } from '../hooks/useIsHydrated'
import { Sprite } from './Sprite'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

interface DialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  return (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === DialogTrigger) {
            return React.cloneElement(child as React.ReactElement<DialogTriggerProps>, {
              onClick: () => onOpenChange(true)
            })
          }
          if (child.type === DialogContent) {
            return open ? child : null
          }
          return child
        }
        return child
      })}
    </>
  )
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className, ...props }) => {
  const isHydrated = useIsHydrated()

  return isHydrated
    ? createPortal(
        <div className='fixed left-max top-0 bottom-0 right-max z-100 flex items-center justify-center' role='dialog'>
          <div className={classNames('bg-nord-1 p-6 overflow-y-auto max-h-[100%]', className)} {...props}>
            {children}
          </div>
          <div className='z-10 absolute top-0 right-0'>
            <button
              className='appearance-none w-8 aspect-square flex items-center justify-center bg-transparent'
              onClick={() => {
                dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
              }}
            >
              <Sprite id='plus' className='rotate-45' size='sm' color='nord-6' />
            </button>
          </div>
        </div>,
        document.body
      )
    : null
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className, ...props }) => {
  return (
    <h2 className={classNames('text-xl font-bold', className)} {...props}>
      {children}
    </h2>
  )
}

export const DialogTrigger: React.FC<DialogTriggerProps & React.HTMLAttributes<HTMLElement>> = ({
  asChild = false,
  children,
  ...props
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      ...props
    })
  }

  return (
    <button type='button' {...props}>
      {children}
    </button>
  )
}
