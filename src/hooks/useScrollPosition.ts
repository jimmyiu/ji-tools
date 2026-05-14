import { useState, useEffect } from 'react'

export function useScrollPosition(threshold = 44) {
  const [{ isScrolled, scrollProgress }, setState] = useState(() => {
    const progress = Math.min(1, Math.max(0, window.scrollY / threshold))
    return { isScrolled: progress >= 1, scrollProgress: progress }
  })

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const progress = Math.min(1, Math.max(0, window.scrollY / threshold))
          setState({ isScrolled: progress >= 1, scrollProgress: progress })
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [threshold])

  return { isScrolled, scrollProgress }
}
