import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTransientFlag } from './useTransientFlag'
import { FLASH_HOLD_MS } from '@/lib/feedback'

describe('useTransientFlag', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts inactive', () => {
    const { result } = renderHook(() => useTransientFlag())
    expect(result.current.active).toBe(false)
  })

  it('activates on trigger and clears after the duration', () => {
    const { result } = renderHook(() => useTransientFlag(1400))

    act(() => result.current.trigger())
    expect(result.current.active).toBe(true)

    act(() => vi.advanceTimersByTime(1399))
    expect(result.current.active).toBe(true)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current.active).toBe(false)
  })

  it('defaults to the shared flash hold duration', () => {
    const { result } = renderHook(() => useTransientFlag())

    act(() => result.current.trigger())
    act(() => vi.advanceTimersByTime(FLASH_HOLD_MS - 1))
    expect(result.current.active).toBe(true)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current.active).toBe(false)
  })

  it('extends the active window when triggered again', () => {
    const { result } = renderHook(() => useTransientFlag(1000))

    act(() => result.current.trigger())
    act(() => vi.advanceTimersByTime(800))
    act(() => result.current.trigger())
    act(() => vi.advanceTimersByTime(800))
    expect(result.current.active).toBe(true)

    act(() => vi.advanceTimersByTime(200))
    expect(result.current.active).toBe(false)
  })
})
