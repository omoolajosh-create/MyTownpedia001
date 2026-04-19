import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface StatsCounterProps {
  end: number
  duration?: number
  suffix?: string
  className?: string
}

export const StatsCounter = ({ end, duration = 2000, suffix = '', className }: StatsCounterProps) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const steps = 60
    const increment = end / steps
    const stepDuration = duration / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [end, duration])

  return (
    <span className={cn('font-bold', className)}>
      {count}{suffix}
    </span>
  )
}
