import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { type ReactNode } from 'react'
import { PwaUpdateProvider, usePwaUpdateContext } from './PwaUpdateContext'

const mockUpdate = vi.fn()
const mockDismiss = vi.fn()
const mockToggleShow = vi.fn()

vi.mock('../hooks/usePwaUpdate', () => ({
  usePwaUpdate: vi.fn(() => ({
    showUpdateBanner: false,
    update: mockUpdate,
    dismiss: mockDismiss,
    toggleShow: mockToggleShow,
  })),
}))

describe('PwaUpdateContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides the correct value type to consumers', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <PwaUpdateProvider>{children}</PwaUpdateProvider>
    )

    const { result } = renderHook(() => usePwaUpdateContext(), { wrapper })

    expect(result.current).toHaveProperty('showUpdateBanner')
    expect(result.current).toHaveProperty('update')
    expect(result.current).toHaveProperty('dismiss')
    expect(result.current).toHaveProperty('toggleShow')
    expect(typeof result.current.showUpdateBanner).toBe('boolean')
    expect(typeof result.current.update).toBe('function')
    expect(typeof result.current.dismiss).toBe('function')
    expect(typeof result.current.toggleShow).toBe('function')
  })

  it('two consumers inside the same provider see the same state', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <PwaUpdateProvider>{children}</PwaUpdateProvider>
    )

    const { result: resultA } = renderHook(() => usePwaUpdateContext(), { wrapper })
    const { result: resultB } = renderHook(() => usePwaUpdateContext(), { wrapper })

    expect(resultA.current.showUpdateBanner).toBe(resultB.current.showUpdateBanner)
    expect(resultA.current.update).toBe(resultB.current.update)
    expect(resultA.current.dismiss).toBe(resultB.current.dismiss)
    expect(resultA.current.toggleShow).toBe(resultB.current.toggleShow)
  })

  it('usePwaUpdateContext throws when used outside a provider', () => {
    expect(() => {
      renderHook(() => usePwaUpdateContext())
    }).toThrow('usePwaUpdateContext must be used within a PwaUpdateProvider')
  })

  it('calls update from context', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <PwaUpdateProvider>{children}</PwaUpdateProvider>
    )

    const { result } = renderHook(() => usePwaUpdateContext(), { wrapper })

    act(() => result.current.update())
    expect(mockUpdate).toHaveBeenCalledOnce()
  })

  it('calls dismiss from context', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <PwaUpdateProvider>{children}</PwaUpdateProvider>
    )

    const { result } = renderHook(() => usePwaUpdateContext(), { wrapper })

    act(() => result.current.dismiss())
    expect(mockDismiss).toHaveBeenCalledOnce()
  })

  it('calls toggleShow from context', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <PwaUpdateProvider>{children}</PwaUpdateProvider>
    )

    const { result } = renderHook(() => usePwaUpdateContext(), { wrapper })

    act(() => result.current.toggleShow())
    expect(mockToggleShow).toHaveBeenCalledOnce()
  })
})
