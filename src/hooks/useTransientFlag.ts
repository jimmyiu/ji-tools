import { useCallback, useEffect, useRef, useState } from 'react'
import { FLASH_HOLD_MS } from '@/lib/feedback'

/**
 * Boolean flag that turns on when `trigger` is called and turns itself off
 * after `duration` ms. Re-triggering restarts the countdown.
 */
export function useTransientFlag(duration = FLASH_HOLD_MS) {
  const [active, setActive] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const trigger = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }
    setActive(true)
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null
      setActive(false)
    }, duration)
  }, [duration])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { active, trigger }
}
