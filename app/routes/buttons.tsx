import { useState } from 'react'
import { Button } from '~/components/Button'

export default function ButtonDemo() {
  const now = Math.floor(Date.now())
  const [timeoutAt] = useState(now + 20_000)
  const remainingTime = Math.max(0, timeoutAt - now)

  const variants = [
    ['neutral', 'neutralOutline'],
    ['amber', 'amberOutline'],
    ['black', 'blackOutline'],
    ['blue', 'blueOutline'],
    ['rose', 'roseOutline'],
    ['purple', 'purpleOutline'],
    ['red', 'redOutline'],
    ['emerald', 'emeraldOutline']
  ]

  return (
    <div className='p-8 space-y-8 bg-white'>
      <h2 className='text-lg font-semibold mb-4'>Button Variants with Timer</h2>
      <div className='text-sm text-gray-500 mb-4'>Timer starts with {remainingTime}s remaining and counts down</div>
      {variants.map(([filled, outline]) => (
        <div key={filled} className='space-y-2'>
          <div className='flex gap-4'>
            <Button variant={filled as any} timeoutAt={timeoutAt}>
              {filled}
            </Button>
            <Button variant={outline as any} timeoutAt={timeoutAt}>
              {outline}
            </Button>
          </div>
          <div className='flex gap-4'>
            <Button variant={filled as any}>No Timer</Button>
            <Button variant={filled as any} timeoutAt={timeoutAt} disabled>
              Disabled with Timer
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
