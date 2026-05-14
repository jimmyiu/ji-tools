import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollLock } from './useScrollLock'

describe('useScrollLock', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame'] })
    document.documentElement.style.overflow = ''
    vi.stubGlobal('visualViewport', undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    document.documentElement.style.overflow = ''
  })

  function setupScrollValues(scrollHeight: number, innerHeight: number) {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: scrollHeight,
      configurable: true,
    })
    Object.defineProperty(window, 'innerHeight', {
      value: innerHeight,
      configurable: true,
    })
  }

  function renderAndTick() {
    const result = renderHook(() => useScrollLock())
    vi.advanceTimersByTime(16)
    return result
  }

  it('locks overflow when content fits viewport', () => {
    setupScrollValues(500, 800)
    renderAndTick()
    expect(document.documentElement.style.overflow).toBe('hidden')
  })

  it('allows scroll when content overflows viewport', () => {
    setupScrollValues(1000, 800)
    renderAndTick()
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('restores overflow on unmount', () => {
    setupScrollValues(500, 800)
    const { unmount } = renderAndTick()
    expect(document.documentElement.style.overflow).toBe('hidden')

    unmount()
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('observes document.body for content changes', () => {
    const mockObserve = vi.fn()
    const mockDisconnect = vi.fn()

    class MockResizeObserver {
      observe = mockObserve
      disconnect = mockDisconnect
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver)

    setupScrollValues(500, 800)
    const { unmount } = renderAndTick()
    expect(mockObserve).toHaveBeenCalledWith(document.body)

    unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('re-evaluates lock on resize observer callback', () => {
    let resizeCallback: () => void
    const mockObserve = vi.fn()
    const mockDisconnect = vi.fn()

    class MockResizeObserver {
      constructor(cb: () => void) {
        resizeCallback = cb
      }
      observe = mockObserve
      disconnect = mockDisconnect
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver)

    setupScrollValues(500, 800)
    renderAndTick()
    expect(document.documentElement.style.overflow).toBe('hidden')

    setupScrollValues(1000, 800)
    resizeCallback!()
    expect(document.documentElement.style.overflow).toBe('')
  })
})
