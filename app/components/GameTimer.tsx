import { useState, useEffect } from 'react'

interface GameTimerProps {
  getRemainingTime: () => number
}

export const GameTimer: React.FC<GameTimerProps> = ({ getRemainingTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.round(getRemainingTime() / 1_000))
    }, 1000)

    return () => clearInterval(interval)
  }, [getRemainingTime])

  if (timeLeft <= 0) return null

  return <div className='timer'>Time remaining: {timeLeft}s</div>
}
