import { useState } from 'react'
import { Button } from '~/components/Button'
import { PlayingCard } from '~/components/PlayingCard'
import { CardType, Card } from '~/types'

export default function ButtonDemo() {
  const [timeoutAt] = useState(Date.now() + 20_000)

  const variants = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger']

  return (
    <div className='p-8 space-y-8'>
      <h2 className='text-xl text-nord-6 font-bold'>Buttons</h2>
      {variants.map(variant => (
        <div key={variant} className='space-y-2'>
          <div className='flex gap-4'>
            <Button variant={variant as any}>{variant}</Button>
            <Button variant={variant as any} timeoutAt={timeoutAt}>
              {variant} (w/ Timer)
            </Button>
          </div>
          <div className='flex gap-4'>
            <Button variant={variant as any} disabled>
              Disabled
            </Button>
          </div>
        </div>
      ))}
      <h2 className='mt-2 text-xl text-nord-6 font-bold'>Cards</h2>
      <div className='mt-4 px-2 grid grid-cols-2 md:grid-cols-5 gap-2'>
        {Object.values(CharacterCards).map(card => (
          <PlayingCard id={card.type} {...card} />
        ))}
        {new Array(5).fill(null).map((_, i) => (
          <PlayingCard key={`face-down-${i}`} id={`face-down-${i}`} type={null} />
        ))}
      </div>
    </div>
  )
}

const CharacterCards: Record<CardType, Omit<Card, 'id'>> = {
  [CardType.DUKE]: { type: 'DUKE', isRevealed: true },
  [CardType.ASSASSIN]: { type: 'ASSASSIN', isRevealed: true },
  [CardType.CONTESSA]: { type: 'CONTESSA', isRevealed: true },
  [CardType.CAPTAIN]: { type: 'CAPTAIN', isRevealed: true },
  [CardType.AMBASSADOR]: { type: 'AMBASSADOR', isRevealed: true }
}
