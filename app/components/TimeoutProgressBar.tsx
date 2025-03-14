import React, { useEffect, useState } from 'react'

interface TimeoutProgressBarProps {
  timeoutAt?: number | null
}

export const TimeoutProgressBar: React.FC<TimeoutProgressBarProps> = ({ timeoutAt = null }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!timeoutAt || timeoutAt <= Date.now()) {
      return
    }

    const updateProgress = () => {
      const total = 20_000 // 20 seconds in milliseconds
      const now = Date.now()
      const remainingTime = timeoutAt - now
      const elapsedTime = total - remainingTime
      const calculated = (elapsedTime / total) * 100
      setProgress(Math.min(100, Math.max(0, calculated)))
    }

    updateProgress()
    const interval = setInterval(updateProgress, 1_000)
    return () => clearInterval(interval)
  }, [timeoutAt])

  if (!timeoutAt || timeoutAt <= Date.now()) {
    return null
  }

  return (
    <div className='absolute top-0 left-0 right-0 overflow-hidden h-1 bg-nord-3'>
      <div
        className={`absolute inset-0 bg-nord-8 transition-transform duration-1000 ease-linear`}
        data-progress={progress}
        style={{
          transformOrigin: 'left center',
          transform: `scaleX(${1 - progress / 100})` // Removed the 1 - since we want it to progress from 0 to 1
        }}
      />
    </div>
  )
}

/*
const TimerBackground = ({ timeoutAt, variant }: { timeoutAt: number; variant: keyof typeof variantStyles }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!timeoutAt) {
      return
    }

    const updateProgress = () => {
      const total = 20_000 // 20 seconds in milliseconds
      const now = Date.now()
      const remainingTime = timeoutAt - now
      const elapsedTime = total - remainingTime
      const calculated = (elapsedTime / total) * 100
      setProgress(Math.min(100, Math.max(0, calculated)))
    }

    updateProgress()
    const interval = setInterval(updateProgress, 1_000)
    return () => clearInterval(interval)
  }, [timeoutAt])

  return (
    <div className='absolute inset-0'>
      <div
        className={`absolute inset-0 ${progressColor} transition-transform duration-1000 ease-linear`}
        data-progress={progress}
        style={{
          transformOrigin: 'left center',
          transform: `scaleX(${1 - progress / 100})` // Removed the 1 - since we want it to progress from 0 to 1
        }}
      />
    </div>
  )
}
*/
