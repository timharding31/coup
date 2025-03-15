import React from 'react'
import { Button, ButtonProps } from './Button'
import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { useDrawerOpenAtom } from './Drawer'

interface DrawerTriggerProps extends Pick<ButtonProps, 'variant' | 'size'> {
  heading: React.ReactNode
  label: React.ReactNode
  className?: string
}

export const DrawerTrigger: React.FC<DrawerTriggerProps> = ({
  heading,
  label,
  variant = 'secondary',
  size = 'base',
  className
}) => {
  const [isOpen, setIsOpen] = useDrawerOpenAtom()
  return isOpen ? null : (
    <div className='drawer-trigger-background fixed left-max right-max bottom-0 aspect-[138/100] z-[60] grid place-content-center backdrop-blur-[1px]'>
      <div className='drawer-trigger rounded-xl flex flex-col items-stretch p-4 pt-2 mx-auto mb-[14cqi] h-auto w-80 max-w-[90cqi] bg-dotted border border-nord-0'>
        <h4 className={classNames('text-base mt-3 font-normal text-center')}>{heading}</h4>
        <Button type='button' onClick={() => setIsOpen(prev => !prev)} variant={variant} size={size} className='mt-3'>
          {label}
        </Button>
      </div>
    </div>
  )
}
