import React, { useState } from 'react'
import type { Card } from '~/types'
import { Button, ButtonProps } from './Button'
import { Drawer, DrawerContent } from './Drawer'
import { PlayingCard } from './PlayingCard'
import { motion, AnimatePresence } from 'framer-motion'

interface CardSelectorProps {
  heading: string
  subheading?: string
  cards: Card<'client'>[]
  onSubmit: (cardIds: string[]) => void
  buttonText: string
  intent?: Extract<ButtonProps['variant'], 'danger' | 'success' | 'primary'>
  minCards?: number
  maxCards?: number
}

export const CardSelector: React.FC<CardSelectorProps> = ({
  heading,
  subheading,
  cards,
  onSubmit,
  buttonText,
  intent = 'primary',
  minCards = 1,
  maxCards = 1
}) => {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])

  const toggleCard = (cardId: string) => {
    setSelectedCardIds(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId)
      }
      if (prev.length >= maxCards) {
        return prev
      }
      return [...prev, cardId]
    })
  }

  const canSubmit = selectedCardIds.length >= minCards && selectedCardIds.length <= maxCards

  return (
    <Drawer defaultOpen>
      <DrawerContent className='p-4'>
        <AnimatePresence mode='wait'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='grid gap-4'
          >
            <div className='px-2'>
              <h3 className='text-xl font-bold'>{heading}</h3>
              {subheading && <p className='text-base'>{subheading}</p>}
            </div>

            <div className='flex justify-center gap-4 px-4'>
              {cards.map(card => (
                <div
                  key={card.id}
                  className={`relative cursor-pointer transition-transform ${
                    selectedCardIds.includes(card.id) ? 'scale-95' : ''
                  }`}
                  style={{ width: `${100 / Math.min(4, cards.length)}%`, maxWidth: '180px' }}
                  onClick={() => toggleCard(card.id)}
                >
                  <PlayingCard {...card} />
                  {selectedCardIds.includes(card.id) && (
                    <div
                      className={`absolute inset-0 ${intent === 'primary' ? 'bg-nord-6' : intent === 'danger' ? 'bg-nord-11' : 'bg-nord-13'} rounded-lg flex items-center justify-center bg-opacity-50`}
                    >
                      <div className='w-8 h-8 rounded-full bg-white/90 flex items-center justify-center'>✓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              size='lg'
              variant={intent}
              onClick={() => onSubmit(selectedCardIds)}
              disabled={!canSubmit}
              className='w-full mt-4'
            >
              {buttonText}
            </Button>
          </motion.div>
        </AnimatePresence>
      </DrawerContent>
    </Drawer>
  )
}
