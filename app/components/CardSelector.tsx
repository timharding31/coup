import React, { useState } from 'react'
import type { Card } from '~/types'
import { Button, ButtonProps } from './Button'
import { Drawer, DrawerContent } from './Drawer'
import { PlayingCard } from './PlayingCard'

interface CardSelectorProps {
  heading: React.ReactNode
  subheading?: React.ReactNode
  cards: Card<'client'>[]
  onSubmit: (cardIds: string[]) => void
  intent?: Extract<ButtonProps['variant'], 'danger' | 'success' | 'primary'>
  minCards?: number
  maxCards?: number
  selectedCardIds?: string[]
  isLoading?: boolean
}

export const CardSelector: React.FC<CardSelectorProps> = ({
  heading,
  subheading,
  cards,
  onSubmit,
  intent = 'primary',
  minCards = 1,
  maxCards = 1,
  selectedCardIds: initialSelectedCardIds,
  isLoading
}) => {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>(() => {
    if (initialSelectedCardIds) {
      return initialSelectedCardIds
    }
    const unrevealedCards = cards.filter(card => !card.isRevealed)
    if (unrevealedCards.length === 1) {
      return [unrevealedCards[0].id]
    }
    return []
  })

  const toggleCard = (cardId: string) => {
    setSelectedCardIds(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId)
      }
      if (prev.length >= maxCards) {
        return prev.concat(cardId).slice(1)
      }
      return prev.concat(cardId)
    })
  }

  const canSubmit = selectedCardIds.length >= minCards && selectedCardIds.length <= maxCards

  const bgClassName = {
    primary: 'bg-nord-6',
    success: 'bg-nord-14',
    danger: 'bg-nord-11',
    warning: 'bg-nord-13'
  }[intent]

  return (
    <Drawer open>
      <DrawerContent className='p-4'>
        <div className='grid gap-4'>
          <div className='px-2'>
            <h3 className='text-xl font-bold'>{heading}</h3>
            {subheading && <p className='text-base text-nord-4'>{subheading}</p>}
          </div>

          <div className='flex justify-center gap-2'>
            {cards.map((card, i) => {
              if (card.isRevealed) {
                return null
              }
              return (
                <button
                  key={card.id}
                  type='button'
                  className={`appearance-none relative cursor-pointer transition-transform ${
                    selectedCardIds.includes(card.id) ? 'scale-95' : ''
                  }`}
                  style={{ width: `${100 / Math.min(4, cards.length)}%`, maxWidth: '180px' }}
                  onClick={() => toggleCard(card.id)}
                >
                  <PlayingCard {...card} />
                  {selectedCardIds.includes(card.id) && (
                    <div
                      className={`absolute inset-0 ${bgClassName} rounded-lg flex items-center justify-center bg-opacity-50`}
                    >
                      <div className='w-8 h-8 rounded-full bg-nord-6 flex items-center justify-center font-bold text-nord-0'>
                        ✓
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <Button
            size='lg'
            variant={intent}
            onClick={() => onSubmit(selectedCardIds)}
            disabled={!canSubmit}
            className='w-full mt-4'
            isLoading={isLoading}
          >
            Confirm
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
