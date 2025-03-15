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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='fixed left-max right-max bottom-0 aspect-[138/100] z-[60] grid place-content-center backdrop-blur-[1px]'
    >
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
        className='rounded-xl flex flex-col items-stretch p-2 px-4 mx-auto mb-[14cqi] h-auto w-80 max-w-[90cqi] bg-dotted border border-nord-0 nord-shadow'
      >
        <h4 className={classNames('text-lg mt-3 font-normal font-sansation text-center text-nord-6')}>{heading}</h4>
        <Button type='button' onClick={() => setIsOpen(prev => !prev)} variant={variant} size={size} className='mt-3'>
          {label}
        </Button>
      </motion.div>
    </motion.div>
  )
}
