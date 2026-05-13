import { useState, useEffect } from 'react'

export function useScrollPosition(threshold = 44) {
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY >= threshold)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY >= threshold)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [threshold])

  return { isScrolled }
}
