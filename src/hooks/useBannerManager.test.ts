import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBannerManager } from './useBannerManager'

describe('useBannerManager', () => {
  it('returns totalBannerHeight equal to installBannerHeight', () => {
    const { result } = renderHook(() => useBannerManager(true, true))
    expect(result.current.totalBannerHeight).toBe(result.current.installBannerHeight)
  })

  it('does not return updateBannerRef', () => {
    const { result } = renderHook(() => useBannerManager(true, true))
    expect(result.current).not.toHaveProperty('updateBannerRef')
  })

  it('does not return updateBannerHeight', () => {
    const { result } = renderHook(() => useBannerManager(true, true))
    expect(result.current).not.toHaveProperty('updateBannerHeight')
  })

  it('sets showUpdateBanner true when needRefresh is true and not dismissed', () => {
    const { result } = renderHook(() => useBannerManager(false, true))
    expect(result.current.showUpdateBanner).toBe(true)
  })

  it('sets showUpdateBanner false when needRefresh is false', () => {
    const { result } = renderHook(() => useBannerManager(false, false))
    expect(result.current.showUpdateBanner).toBe(false)
  })

  it('dismissUpdate sets showUpdateBanner to false', () => {
    const { result } = renderHook(() => useBannerManager(false, true))
    expect(result.current.showUpdateBanner).toBe(true)
    act(() => {
      result.current.dismissUpdate()
    })
    expect(result.current.showUpdateBanner).toBe(false)
  })

  it('returns bannerRef for InstallBanner', () => {
    const { result } = renderHook(() => useBannerManager(true, false))
    expect(result.current.bannerRef).toBeDefined()
    expect(result.current.bannerRef.current).toBeNull()
  })

  it('totalBannerHeight is 0 when no banners are shown', () => {
    const { result } = renderHook(() => useBannerManager(false, false))
    expect(result.current.totalBannerHeight).toBe(0)
  })
})