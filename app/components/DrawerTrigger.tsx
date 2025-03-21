import React from 'react'
import { Button, ButtonProps } from './Button'
import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { useDrawerOpenAtom } from './Drawer'
import { GameMessage } from './GameMessage'

interface DrawerTriggerProps extends Pick<ButtonProps, 'variant' | 'size' | 'timeoutAt'> {
  heading: React.ReactNode
  label: React.ReactNode
  className?: string
}

export const DrawerTrigger: React.FC<DrawerTriggerProps> = ({
  heading,
  label,
  variant = 'success',
  size = 'base',
  timeoutAt,
  className
}) => {
  const [isOpen, setIsOpen] = useDrawerOpenAtom()
  return isOpen ? null : (
    <div className='fixed left-max right-max bottom-0 aspect-[138/100] z-[70] grid place-content-center'>
      <div className='drawer-trigger rounded-xl flex flex-col items-stretch mx-auto mb-[14cqi] w-fit max-w-[90cqi] bg-transparent gap-4'>
        {typeof heading === 'string' && (
          <div className='min-h-[28px] mx-auto'>
            <GameMessage message={{ type: 'info', text: heading, isWaiting: true, delayMs: 500 }} size='lg' />
          </div>
        )}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.5,
            y: -20,
            rotateX: 90
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            rotateX: 0
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
        >
          <Button
            type='button'
            onClick={() => setIsOpen(prev => !prev)}
            variant={variant}
            size={size}
            className='w-full'
            timeoutAt={timeoutAt}
          >
            {label}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
