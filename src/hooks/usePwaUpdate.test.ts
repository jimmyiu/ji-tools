import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(),
}))

import { useRegisterSW } from 'virtual:pwa-register/react'
import { usePwaUpdate } from './usePwaUpdate'

const mockUseRegisterSW = vi.mocked(useRegisterSW)

function mockReturn(needRefresh: boolean) {
  return {
    needRefresh: [needRefresh, vi.fn()] as [boolean, () => void],
    offlineReady: [false, vi.fn()] as [boolean, () => void],
    updateServiceWorker: vi.fn(),
  }
}

describe('usePwaUpdate', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('defaults showUpdateBanner to false with no localStorage entry', () => {
      mockUseRegisterSW.mockReturnValue(mockReturn(false))

      const { result } = renderHook(() => usePwaUpdate())

      expect(result.current.showUpdateBanner).toBe(false)
    })

    it('restores visible=true from localStorage', () => {
      localStorage.setItem('pwa_update_visible', 'true')
      mockUseRegisterSW.mockReturnValue({
        needRefresh: [false, vi.fn()] as [boolean, () => void],
        offlineReady: [false, vi.fn()] as [boolean, () => void],
        updateServiceWorker: vi.fn(),
      })

      const { result } = renderHook(() => usePwaUpdate())

      expect(result.current.showUpdateBanner).toBe(true)
    })

    it('cleans up old localStorage keys on init', () => {
      localStorage.setItem('pwa_update_dismissed', 'true')
      localStorage.setItem('pwa_update_force_show', 'true')
      mockUseRegisterSW.mockReturnValue(mockReturn(false))

      renderHook(() => usePwaUpdate())

      expect(localStorage.getItem('pwa_update_dismissed')).toBeNull()
      expect(localStorage.getItem('pwa_update_force_show')).toBeNull()
    })
  })

  describe('needRefresh event', () => {
    it('sets showUpdateBanner to true when needRefresh becomes true', () => {
      mockUseRegisterSW.mockReturnValue(mockReturn(false))

      const { result, rerender } = renderHook(() => usePwaUpdate())
      expect(result.current.showUpdateBanner).toBe(false)

      mockUseRegisterSW.mockReturnValue(mockReturn(true))

      act(() => rerender())

      expect(result.current.showUpdateBanner).toBe(true)
    })
  })

  describe('dismiss', () => {
    it('sets showUpdateBanner to false', () => {
      mockUseRegisterSW.mockReturnValue(mockReturn(true))

      const { result } = renderHook(() => usePwaUpdate())
      expect(result.current.showUpdateBanner).toBe(true)

      act(() => result.current.dismiss())

      expect(result.current.showUpdateBanner).toBe(false)
    })
  })

  describe('update', () => {
    it('sets showUpdateBanner to false immediately', () => {
      mockUseRegisterSW.mockReturnValue({
        needRefresh: [true, vi.fn()] as [boolean, () => void],
        offlineReady: [false, vi.fn()] as [boolean, () => void],
        updateServiceWorker: vi.fn().mockReturnValue(Promise.resolve()),
      })

      const { result } = renderHook(() => usePwaUpdate())
      expect(result.current.showUpdateBanner).toBe(true)

      act(() => result.current.update())

      expect(result.current.showUpdateBanner).toBe(false)
    })

    it('calls updateServiceWorker with true', () => {
      const updateServiceWorker = vi.fn().mockReturnValue(Promise.resolve())
      mockUseRegisterSW.mockReturnValue({
        needRefresh: [true, vi.fn()] as [boolean, () => void],
        offlineReady: [false, vi.fn()] as [boolean, () => void],
        updateServiceWorker,
      })

      const { result } = renderHook(() => usePwaUpdate())

      act(() => result.current.update())

      expect(updateServiceWorker).toHaveBeenCalledWith(true)
    })

    it('handles undefined return from updateServiceWorker', () => {
      mockUseRegisterSW.mockReturnValue({
        needRefresh: [true, vi.fn()] as [boolean, () => void],
        offlineReady: [false, vi.fn()] as [boolean, () => void],
        updateServiceWorker: vi.fn().mockReturnValue(undefined),
      })

      const { result } = renderHook(() => usePwaUpdate())

      expect(() => {
        act(() => result.current.update())
      }).not.toThrow()

      expect(result.current.showUpdateBanner).toBe(false)
    })

    it('handles rejection from updateServiceWorker', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockUseRegisterSW.mockReturnValue({
        needRefresh: [true, vi.fn()] as [boolean, () => void],
        offlineReady: [false, vi.fn()] as [boolean, () => void],
        updateServiceWorker: vi.fn().mockReturnValue(Promise.reject(new Error('SW failed'))),
      })

      const { result } = renderHook(() => usePwaUpdate())

      expect(() => {
        act(() => result.current.update())
      }).not.toThrow()

      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('SW update failed:', expect.any(Error))
      })
      consoleSpy.mockRestore()
    })
  })

  describe('toggleShow', () => {
    it('flips showUpdateBanner', () => {
      mockUseRegisterSW.mockReturnValue(mockReturn(false))

      const { result } = renderHook(() => usePwaUpdate())
      expect(result.current.showUpdateBanner).toBe(false)

      act(() => result.current.toggleShow())
      expect(result.current.showUpdateBanner).toBe(true)

      act(() => result.current.toggleShow())
      expect(result.current.showUpdateBanner).toBe(false)
    })
  })

  describe('localStorage persistence', () => {
    it('persists visible=true to localStorage when needRefresh fires', () => {
      mockUseRegisterSW.mockReturnValue(mockReturn(true))

      renderHook(() => usePwaUpdate())

      expect(localStorage.getItem('pwa_update_visible')).toBe('true')
    })

    it('removes localStorage key when visible becomes false on dismiss', () => {
      mockUseRegisterSW.mockReturnValue(mockReturn(true))

      const { result } = renderHook(() => usePwaUpdate())
      act(() => result.current.dismiss())

      expect(localStorage.getItem('pwa_update_visible')).toBeNull()
    })

    it('persists visible=true to localStorage on toggleShow', () => {
      mockUseRegisterSW.mockReturnValue(mockReturn(false))

      const { result } = renderHook(() => usePwaUpdate())
      act(() => result.current.toggleShow())

      expect(localStorage.getItem('pwa_update_visible')).toBe('true')
    })
  })

  describe('edge cases', () => {
    it('dismissed banner stays hidden when needRefresh remains true', () => {
      mockUseRegisterSW.mockReturnValue(mockReturn(true))

      const { result, rerender } = renderHook(() => usePwaUpdate())
      expect(result.current.showUpdateBanner).toBe(true)

      act(() => result.current.dismiss())
      expect(result.current.showUpdateBanner).toBe(false)

      act(() => rerender())
      expect(result.current.showUpdateBanner).toBe(false)
    })
  })
})
