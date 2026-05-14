import { useLayoutEffect } from 'react'

export function useScrollLock() {
  useLayoutEffect(() => {
    const checkOverflow = () => {
      const needsLock = document.documentElement.scrollHeight <= window.innerHeight
      document.documentElement.style.overflow = needsLock ? 'hidden' : ''
    }

    checkOverflow()
    const observer = new ResizeObserver(checkOverflow)
    observer.observe(document.body)

    return () => {
      observer.disconnect()
      document.documentElement.style.overflow = ''
    }
  }, [])
}
