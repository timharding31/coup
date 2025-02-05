import { useState, useEffect } from 'react'

interface GameTimerProps {
  timeoutAt: number
}

export const GameTimer: React.FC<GameTimerProps> = ({ timeoutAt }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const remainingTime = timeoutAt - Date.now()
      setTimeLeft(Math.round(remainingTime / 1_000))
    }, 1000)

    return () => clearInterval(interval)
  }, [timeoutAt])

  if (timeLeft <= 0) return null

  return <div className='timer'>Time remaining: {timeLeft}s</div>
}
