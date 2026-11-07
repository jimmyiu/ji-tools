import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, render } from '@testing-library/react'
import { type ReactNode } from 'react'

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(),
}))

import { useRegisterSW } from 'virtual:pwa-register/react'
import { PwaPromptsProvider, usePwaPrompts } from './PwaPromptsContext'
import UpdateBanner from '../components/UpdateBanner'

const mockUseRegisterSW = vi.mocked(useRegisterSW)

const IOS_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'

const wrapper = ({ children }: { children: ReactNode }) => (
  <PwaPromptsProvider>{children}</PwaPromptsProvider>
)

function renderPrompts() {
  return renderHook(() => usePwaPrompts(), { wrapper })
}

function swReturn({
  needRefresh = false,
  updateServiceWorker = vi.fn().mockReturnValue(Promise.resolve()),
}: {
  needRefresh?: boolean
  updateServiceWorker?: () => unknown
} = {}) {
  return {
    needRefresh: [needRefresh, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker,
  } as unknown as ReturnType<typeof useRegisterSW>
}

function mockMatchMedia(matches: (query: string) => boolean = () => false) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matches(query),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

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

describe('PwaPromptsProvider', () => {
  const originalUserAgent = navigator.userAgent

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockMatchMedia()
    mockUserAgent(DESKTOP_USER_AGENT)
    mockStandalone(false)
    mockUseRegisterSW.mockReturnValue(swReturn())
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
  })

  describe('provider boundary', () => {
    it('throws when used outside a provider', () => {
      expect(() => renderHook(() => usePwaPrompts())).toThrow(
        'usePwaPrompts must be used within a PwaPromptsProvider'
      )
    })

    it('throws when a prompt banner renders outside a provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => render(<UpdateBanner />)).toThrow(
        'usePwaPrompts must be used within a PwaPromptsProvider'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('install prompt', () => {
    it('is visible on an iOS device that has not dismissed it', () => {
      mockUserAgent(IOS_USER_AGENT)

      const { result } = renderPrompts()

      expect(result.current.install.visible).toBe(true)
      expect(result.current.install.isIOS).toBe(true)
    })

    it('is not visible when already installed', () => {
      mockUserAgent(IOS_USER_AGENT)
      mockStandalone(true)

      const { result } = renderPrompts()

      expect(result.current.install.visible).toBe(false)
    })

    it('is not visible in standalone display mode', () => {
      mockMatchMedia((query) => query === '(display-mode: standalone)')

      const { result } = renderPrompts()
      act(() => {
        window.dispatchEvent(new Event('beforeinstallprompt'))
      })

      expect(result.current.install.visible).toBe(false)
    })

    it('is not visible on a device with no install offer', () => {
      const { result } = renderPrompts()

      expect(result.current.install.visible).toBe(false)
    })

    it('becomes visible when the browser offers installation', () => {
      const { result } = renderPrompts()
      expect(result.current.install.visible).toBe(false)

      act(() => {
        const event = new Event('beforeinstallprompt')
        Object.assign(event, {
          prompt: vi.fn().mockResolvedValue(undefined),
          userChoice: Promise.resolve({ outcome: 'accepted' }),
        })
        window.dispatchEvent(event)
      })

      expect(result.current.install.visible).toBe(true)
    })

    it('prompts the deferred install event and hides after userChoice resolves', async () => {
      const { result } = renderPrompts()
      const promptSpy = vi.fn().mockResolvedValue(undefined)

      act(() => {
        const event = new Event('beforeinstallprompt')
        Object.assign(event, {
          prompt: promptSpy,
          userChoice: Promise.resolve({ outcome: 'accepted' }),
        })
        window.dispatchEvent(event)
      })
      expect(result.current.install.visible).toBe(true)

      await act(async () => {
        result.current.install.prompt()
      })

      expect(promptSpy).toHaveBeenCalledOnce()
      expect(result.current.install.visible).toBe(false)
    })

    it('prompt is a no-op when no install event has been captured', () => {
      mockUserAgent(IOS_USER_AGENT)
      const { result } = renderPrompts()

      expect(() => act(() => result.current.install.prompt())).not.toThrow()
      expect(result.current.install.visible).toBe(true)
    })

    it('stays hidden after a dismissal on a fresh mount', () => {
      mockUserAgent(IOS_USER_AGENT)
      const first = renderPrompts()
      act(() => first.result.current.install.dismiss())
      expect(first.result.current.install.visible).toBe(false)
      first.unmount()

      const { result } = renderPrompts()

      expect(result.current.install.visible).toBe(false)
    })

    it('becomes visible again after the dismissal is cleared, including on a fresh mount', () => {
      mockUserAgent(IOS_USER_AGENT)
      const first = renderPrompts()
      act(() => first.result.current.install.dismiss())
      act(() => first.result.current.install.toggle())
      expect(first.result.current.install.visible).toBe(true)
      first.unmount()

      const { result } = renderPrompts()

      expect(result.current.install.visible).toBe(true)
    })

    it('force-shows the install prompt on a device with no install offer, including on a fresh mount', () => {
      const first = renderPrompts()
      expect(first.result.current.install.visible).toBe(false)

      act(() => first.result.current.install.toggle())
      expect(first.result.current.install.visible).toBe(true)
      first.unmount()

      const { result } = renderPrompts()

      expect(result.current.install.visible).toBe(true)
    })

    it('clears a prior dismissal when force-shown, including on a fresh mount', () => {
      const first = renderPrompts()
      act(() => first.result.current.install.dismiss())
      expect(first.result.current.install.visible).toBe(false)

      act(() => first.result.current.install.toggle())
      expect(first.result.current.install.visible).toBe(true)
      first.unmount()

      const { result } = renderPrompts()

      expect(result.current.install.visible).toBe(true)
    })

    it('stays hidden after a force-shown prompt is toggled off, including on a fresh mount', () => {
      const first = renderPrompts()
      act(() => first.result.current.install.toggle())
      expect(first.result.current.install.visible).toBe(true)

      act(() => first.result.current.install.toggle())
      expect(first.result.current.install.visible).toBe(false)
      first.unmount()

      const { result } = renderPrompts()

      expect(result.current.install.visible).toBe(false)
    })

    it('stays hidden after dismissing a force-shown prompt, including on a fresh mount', () => {
      const first = renderPrompts()
      act(() => first.result.current.install.toggle())
      expect(first.result.current.install.visible).toBe(true)

      act(() => first.result.current.install.dismiss())
      expect(first.result.current.install.visible).toBe(false)
      first.unmount()

      const { result } = renderPrompts()

      expect(result.current.install.visible).toBe(false)
    })

    it('does not persist a forced prompt when already installed', () => {
      mockStandalone(true)
      const first = renderPrompts()

      act(() => first.result.current.install.toggle())
      expect(first.result.current.install.visible).toBe(false)
      expect(localStorage.getItem('pwa_install_forced')).toBeNull()
      first.unmount()

      mockStandalone(false)
      const { result } = renderPrompts()

      expect(result.current.install.visible).toBe(false)
    })

    it('dismisses a force-shown prompt when the install button is clicked with no deferred event', () => {
      const first = renderPrompts()
      act(() => first.result.current.install.toggle())
      expect(first.result.current.install.visible).toBe(true)

      act(() => first.result.current.install.prompt())
      expect(first.result.current.install.visible).toBe(false)
      first.unmount()

      const { result } = renderPrompts()

      expect(result.current.install.visible).toBe(false)
    })
  })

  describe('update prompt', () => {
    it('is hidden by default', () => {
      const { result } = renderPrompts()

      expect(result.current.update.visible).toBe(false)
    })

    it('restores a previously visible prompt', () => {
      localStorage.setItem('pwa_update_visible', 'true')

      const { result } = renderPrompts()

      expect(result.current.update.visible).toBe(true)
    })

    it('cleans up legacy persistence keys on mount', () => {
      localStorage.setItem('pwa_update_dismissed', 'true')
      localStorage.setItem('pwa_update_force_show', 'true')

      renderPrompts()

      expect(localStorage.getItem('pwa_update_dismissed')).toBeNull()
      expect(localStorage.getItem('pwa_update_force_show')).toBeNull()
    })

    it('becomes visible when the service worker reports an update', () => {
      mockUseRegisterSW.mockReturnValue(swReturn({ needRefresh: true }))

      const { result } = renderPrompts()

      expect(result.current.update.visible).toBe(true)
    })

    it('stays hidden after a dismissal on a fresh mount', () => {
      mockUseRegisterSW.mockReturnValue(swReturn({ needRefresh: true }))
      const first = renderPrompts()
      act(() => first.result.current.update.dismiss())
      expect(first.result.current.update.visible).toBe(false)
      first.unmount()

      mockUseRegisterSW.mockReturnValue(swReturn())
      const { result } = renderPrompts()

      expect(result.current.update.visible).toBe(false)
    })

    it('flips visibility on toggle, including on a fresh mount', () => {
      const first = renderPrompts()
      act(() => first.result.current.update.toggle())
      expect(first.result.current.update.visible).toBe(true)
      first.unmount()

      const { result } = renderPrompts()

      expect(result.current.update.visible).toBe(true)
    })

    it('reload hides the prompt and asks the service worker to update', () => {
      const updateServiceWorker = vi.fn().mockReturnValue(Promise.resolve())
      mockUseRegisterSW.mockReturnValue(swReturn({ needRefresh: true, updateServiceWorker }))
      const { result } = renderPrompts()
      expect(result.current.update.visible).toBe(true)

      act(() => result.current.update.reload())

      expect(result.current.update.visible).toBe(false)
      expect(updateServiceWorker).toHaveBeenCalledWith(true)
    })

    it('reload does not throw when the service worker update rejects', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockUseRegisterSW.mockReturnValue(
        swReturn({
          needRefresh: true,
          updateServiceWorker: vi.fn().mockReturnValue(Promise.reject(new Error('SW failed'))),
        })
      )
      const { result } = renderPrompts()

      expect(() => act(() => result.current.update.reload())).not.toThrow()

      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('SW update failed:', expect.any(Error))
      })
      consoleSpy.mockRestore()
    })

    it('reload does not throw when the service worker update returns undefined', () => {
      mockUseRegisterSW.mockReturnValue(
        swReturn({ needRefresh: true, updateServiceWorker: vi.fn().mockReturnValue(undefined) })
      )
      const { result } = renderPrompts()

      expect(() => act(() => result.current.update.reload())).not.toThrow()
    })
  })
})
