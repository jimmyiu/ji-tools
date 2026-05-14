import { useLayoutEffect } from 'react'

export function useScrollLock(pathname?: string) {
  useLayoutEffect(() => {
    const checkOverflow = () => {
      const scrollHeight = document.documentElement.scrollHeight
      // Use visualViewport to get the actual visible area, which accounts for
      // mobile address bar show/hide. window.innerHeight differs on first load
      // (address bar visible) vs after scroll (address bar hidden), causing
      // incorrect overflow detection during the ~1 second transition.
      const innerHeight = window.visualViewport?.height ?? window.innerHeight
      const needsLock = scrollHeight <= innerHeight
      document.documentElement.style.overflow = needsLock ? 'hidden' : ''
    }

    const rafId = requestAnimationFrame(checkOverflow)

    const observer = new ResizeObserver(checkOverflow)
    observer.observe(document.body)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
      document.documentElement.style.overflow = ''
    }
  }, [pathname])
}
