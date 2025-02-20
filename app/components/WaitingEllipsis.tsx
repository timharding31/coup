import React, { useEffect, useState } from 'react'
import cn from 'classnames'

const sizes = { sm: 8, base: 10, lg: 12 } as const

interface WaitingEllipsisProps {
  size?: keyof typeof sizes
  className?: string
}

export const WaitingEllipsis: React.FC<WaitingEllipsisProps> = ({ size = 'base', className }) => {
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setCursor(i => (i + 1) % 4), 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <span className={cn('text-left inline-block', className)} style={{ width: `${sizes[size]}px` }}>
      {'...'.slice(0, cursor)}
    </span>
  )
}
