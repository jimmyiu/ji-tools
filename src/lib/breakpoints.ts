import { useState, useEffect } from 'react'

export const DESKTOP_NAV_PX = 1024
// Must match CSS values in index.css
export const SIDE_NAV_WIDTH = 80

export function useIsDesktopNav(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(`(min-width: ${DESKTOP_NAV_PX}px)`).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_NAV_PX}px)`)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return isDesktop
}