import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollPosition } from './useScrollPosition'

describe('useScrollPosition', () => {
  let originalScrollY: number

  beforeEach(() => {
    originalScrollY = window.scrollY
    vi.useFakeTimers({ toFake: ['requestAnimationFrame'] })
  })

  afterEach(() => {
    vi.useRealTimers()
    window.scrollY = originalScrollY
  })

  it('returns isScrolled false when scroll position is 0', () => {
    window.scrollY = 0
    const { result } = renderHook(() => useScrollPosition(50))
    expect(result.current.isScrolled).toBe(false)
  })

  it('returns isScrolled true when scroll position exceeds threshold', () => {
    window.scrollY = 60
    const { result } = renderHook(() => useScrollPosition(50))
    expect(result.current.isScrolled).toBe(true)
  })

  it('returns isScrolled false when scroll position is below threshold', () => {
    window.scrollY = 30
    const { result } = renderHook(() => useScrollPosition(50))
    expect(result.current.isScrolled).toBe(false)
  })

  it('returns isScrolled true when scroll position equals threshold', () => {
    window.scrollY = 50
    const { result } = renderHook(() => useScrollPosition(50))
    expect(result.current.isScrolled).toBe(true)
  })

  it('updates isScrolled when scroll event fires', () => {
    window.scrollY = 0
    const { result } = renderHook(() => useScrollPosition(50))
    expect(result.current.isScrolled).toBe(false)

    act(() => {
      window.scrollY = 80
      window.dispatchEvent(new Event('scroll'))
    })
    act(() => {
      vi.advanceTimersByTime(16)
    })

    expect(result.current.isScrolled).toBe(true)
  })

  it('uses default threshold of 44', () => {
    window.scrollY = 44
    const { result } = renderHook(() => useScrollPosition())
    expect(result.current.isScrolled).toBe(true)
  })

  it('returns isScrolled false when scroll goes back below threshold', () => {
    window.scrollY = 80
    const { result } = renderHook(() => useScrollPosition(50))
    expect(result.current.isScrolled).toBe(true)

    act(() => {
      window.scrollY = 20
      window.dispatchEvent(new Event('scroll'))
    })
    act(() => {
      vi.advanceTimersByTime(16)
    })

    expect(result.current.isScrolled).toBe(false)
  })

  describe('scrollProgress', () => {
    it('returns scrollProgress 0 when at top', () => {
      window.scrollY = 0
      const { result } = renderHook(() => useScrollPosition(50))
      expect(result.current.scrollProgress).toBe(0)
    })

    it('returns scrollProgress 1 when at or beyond threshold', () => {
      window.scrollY = 50
      const { result } = renderHook(() => useScrollPosition(50))
      expect(result.current.scrollProgress).toBe(1)

      window.scrollY = 80
      const { result: result2 } = renderHook(() => useScrollPosition(50))
      expect(result2.current.scrollProgress).toBe(1)
    })

    it('interpolates scrollProgress between 0 and threshold', () => {
      window.scrollY = 25
      const { result } = renderHook(() => useScrollPosition(50))
      expect(result.current.scrollProgress).toBe(0.5)
    })

    it('updates scrollProgress on scroll event', () => {
      window.scrollY = 0
      const { result } = renderHook(() => useScrollPosition(50))
      expect(result.current.scrollProgress).toBe(0)

    act(() => {
      window.scrollY = 25
      window.dispatchEvent(new Event('scroll'))
    })
    act(() => {
      vi.advanceTimersByTime(16)
    })

    expect(result.current.scrollProgress).toBe(0.5)
    })

    it('isScrolled is derived from scrollProgress >= 1', () => {
      window.scrollY = 0
      const { result } = renderHook(() => useScrollPosition(50))
      expect(result.current.isScrolled).toBe(false)
      expect(result.current.scrollProgress).toBe(0)

      window.scrollY = 100
      const { result: result2 } = renderHook(() => useScrollPosition(50))
      expect(result2.current.isScrolled).toBe(true)
      expect(result2.current.scrollProgress).toBe(1)
    })
  })
})
