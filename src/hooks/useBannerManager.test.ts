import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBannerManager } from './useBannerManager'

describe('useBannerManager', () => {
  it('returns totalBannerHeight equal to installBannerHeight', () => {
    const { result } = renderHook(() => useBannerManager(true))
    expect(result.current.totalBannerHeight).toBe(result.current.installBannerHeight)
  })

  it('returns bannerRef for InstallBanner', () => {
    const { result } = renderHook(() => useBannerManager(true))
    expect(result.current.bannerRef).toBeDefined()
    expect(result.current.bannerRef.current).toBeNull()
  })

  it('totalBannerHeight is 0 when no banners are shown', () => {
    const { result } = renderHook(() => useBannerManager(false))
    expect(result.current.totalBannerHeight).toBe(0)
  })
})
