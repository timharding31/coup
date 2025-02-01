import { useState, useEffect } from 'react'

interface GameTimerProps {
  timeoutAt?: number
}

export const GameTimer: React.FC<GameTimerProps> = ({ timeoutAt }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!timeoutAt) return

    const interval = setInterval(() => {
      const remaining = Math.max(0, timeoutAt - Date.now())
      setTimeLeft(Math.floor(remaining / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [timeoutAt])

  if (!timeoutAt || timeLeft <= 0) return null

  return <div className='timer'>Time remaining: {timeLeft}s</div>
}
