import React from 'react'
import { Button, ButtonProps } from './Button'
import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'

interface DrawerTriggerProps extends Pick<ButtonProps, 'variant' | 'size'> {
  heading: React.ReactNode
  label: React.ReactNode
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const DrawerTrigger: React.FC<DrawerTriggerProps> = ({
  isOpen,
  setIsOpen,
  heading,
  label,
  variant = 'primary',
  size = 'base'
}) => {
  return (
    <>
      {isOpen ? null : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='fixed left-max right-max bottom-0 aspect-[138/100] z-[60] grid place-content-center backdrop-blur-[1px]'
        >
          <motion.div
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
            className='bg-nord-4 rounded-xl flex flex-col items-stretch p-1 mx-auto mb-[14cqi] h-auto w-72 max-w-[90cqi]'
          >
            <h4 className={classNames('text-lg mt-2 font-bold font-sansation text-center text-nord-0')}>{heading}</h4>
            <Button
              type='button'
              onClick={() => setIsOpen(prev => !prev)}
              variant={variant}
              size={size}
              className='mt-2'
            >
              {label}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
