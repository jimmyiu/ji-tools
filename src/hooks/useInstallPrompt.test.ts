import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInstallPrompt } from './useInstallPrompt'

function mockUserAgent(agent: string) {
  Object.defineProperty(navigator, 'userAgent', {
    get: () => agent,
    configurable: true,
  })
}

function mockStandalone(value: boolean) {
  Object.defineProperty(navigator, 'standalone', {
    get: () => value,
    configurable: true,
  })
}

describe('useInstallPrompt', () => {
  const originalMatchMedia = window.matchMedia
  const originalUserAgent = navigator.userAgent

  beforeEach(() => {
    localStorage.clear()
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    mockStandalone(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(navigator, 'userAgent', {
      get: () => originalUserAgent,
      configurable: true,
    })
    Object.defineProperty(navigator, 'standalone', {
      get: () => undefined,
      configurable: true,
    })
    window.matchMedia = originalMatchMedia
  })

  it('returns isIOS true on iOS Safari', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isIOS).toBe(true)
  })

  it('returns isIOS false on Android Chrome', () => {
    mockUserAgent('Mozilla/5.0 (Linux; Android 13) Chrome/120.0.0.0')
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isIOS).toBe(false)
  })

  it('returns isIOS false on desktop browsers', () => {
    mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isIOS).toBe(false)
  })

  it('returns isStandalone true when navigator.standalone is true (iOS Safari)', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
    mockStandalone(true)
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isStandalone).toBe(true)
  })

  it('returns isStandalone true when display-mode standalone matches', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isStandalone).toBe(true)
  })

  it('returns canInstall true on iOS when not standalone and not dismissed', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.canInstall).toBe(true)
  })

  it('returns canInstall false when already in standalone mode', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
    mockStandalone(true)
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.canInstall).toBe(false)
  })

  it('returns canInstall false when user has dismissed the prompt', () => {
    localStorage.setItem('pwa_install_dismissed', 'true')
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.canInstall).toBe(false)
  })

  it('dismiss sets localStorage flag and sets dismissed to true', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.canInstall).toBe(true)
    act(() => {
      result.current.dismiss()
    })
    expect(result.current.dismissed).toBe(true)
    expect(result.current.canInstall).toBe(false)
    expect(localStorage.getItem('pwa_install_dismissed')).toBe('true')
  })

  it('returns canInstall true on Chrome when beforeinstallprompt fires', () => {
    mockUserAgent('Mozilla/5.0 (Linux; Android 13) Chrome/120.0.0.0')
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.canInstall).toBe(false)

    act(() => {
      const event = new Event('beforeinstallprompt')
      Object.assign(event, {
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      })
      window.dispatchEvent(event)
    })

    expect(result.current.canInstall).toBe(true)
  })

  it('resetDismissed clears localStorage flag and sets dismissed to false', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
    const { result } = renderHook(() => useInstallPrompt())
    act(() => {
      result.current.dismiss()
    })
    expect(result.current.dismissed).toBe(true)
    expect(result.current.canInstall).toBe(false)

    act(() => {
      result.current.resetDismissed()
    })
    expect(result.current.dismissed).toBe(false)
    expect(result.current.canInstall).toBe(true)
    expect(localStorage.getItem('pwa_install_dismissed')).toBeNull()
  })
})
