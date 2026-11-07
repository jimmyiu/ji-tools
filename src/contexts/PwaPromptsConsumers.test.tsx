import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(),
}))

import { useRegisterSW } from 'virtual:pwa-register/react'
import { PwaPromptsProvider } from './PwaPromptsContext'
import Layout from '../components/Layout'
import Settings from '../pages/Settings'

const mockUseRegisterSW = vi.mocked(useRegisterSW)

const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'

function mockMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

function renderSettingsInLayout() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <PwaPromptsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </PwaPromptsProvider>
    </MemoryRouter>
  )
}

describe('Install prompt consumers', () => {
  const originalUserAgent = navigator.userAgent

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockMatchMedia()
    Object.defineProperty(navigator, 'userAgent', {
      get: () => DESKTOP_USER_AGENT,
      configurable: true,
    })
    Object.defineProperty(navigator, 'standalone', {
      get: () => false,
      configurable: true,
    })
    mockUseRegisterSW.mockReturnValue({
      needRefresh: [false, vi.fn()],
      offlineReady: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    } as unknown as ReturnType<typeof useRegisterSW>)
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

  it('shows the install prompt banner in Layout when Settings forces it on', () => {
    renderSettingsInLayout()

    expect(screen.queryByText('安裝 JI Tools')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('顯示安裝提示'))

    expect(screen.getByText('安裝 JI Tools')).toBeInTheDocument()
    expect(screen.getByText('隱藏安裝提示')).toBeInTheDocument()
  })

  it('hides the install prompt banner in Layout when Settings toggles it off', () => {
    renderSettingsInLayout()
    fireEvent.click(screen.getByText('顯示安裝提示'))
    expect(screen.getByText('安裝 JI Tools')).toBeInTheDocument()

    fireEvent.click(screen.getByText('隱藏安裝提示'))

    expect(screen.queryByText('安裝 JI Tools')).not.toBeInTheDocument()
    expect(screen.getByText('顯示安裝提示')).toBeInTheDocument()
  })
})
