import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Settings from './Settings'

const mockUsePwaUpdateContext = vi.fn()

vi.mock('../contexts/PwaUpdateContext', () => ({
  usePwaUpdateContext: () => mockUsePwaUpdateContext(),
  PwaUpdateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../hooks/useInstallPrompt', () => ({
  useInstallPrompt: vi.fn(() => ({ dismissed: false, resetDismissed: vi.fn() })),
}))

function renderSettings() {
  return render(<BrowserRouter><Settings /></BrowserRouter>)
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }))

  mockUsePwaUpdateContext.mockReturnValue({
    showUpdateBanner: false,
    toggleShow: vi.fn(),
    update: vi.fn(),
    dismiss: vi.fn(),
  })
})

describe('Settings', () => {
  it('renders the app version from __APP_VERSION__', () => {
    renderSettings()
    expect(screen.getByText(__APP_VERSION__)).toBeInTheDocument()
  })

  it('renders GitHub link with external link icon', () => {
    renderSettings()
    const link = screen.getByText('GitHub').closest('a')
    expect(link).toHaveAttribute('href', 'https://github.com/jimmyiu/ji-tools')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('shows "隱藏更新提示" when showUpdateBanner is true', () => {
    mockUsePwaUpdateContext.mockReturnValue({
      showUpdateBanner: true,
      toggleShow: vi.fn(),
      update: vi.fn(),
      dismiss: vi.fn(),
    })
    renderSettings()
    expect(screen.getByText('隱藏更新提示')).toBeInTheDocument()
  })

  it('shows "顯示更新提示" when showUpdateBanner is false', () => {
    mockUsePwaUpdateContext.mockReturnValue({
      showUpdateBanner: false,
      toggleShow: vi.fn(),
      update: vi.fn(),
      dismiss: vi.fn(),
    })
    renderSettings()
    expect(screen.getByText('顯示更新提示')).toBeInTheDocument()
  })

  it('calls toggleShow when the toggle button is clicked', () => {
    const toggleShow = vi.fn()
    mockUsePwaUpdateContext.mockReturnValue({
      showUpdateBanner: false,
      toggleShow,
      update: vi.fn(),
      dismiss: vi.fn(),
    })
    renderSettings()
    fireEvent.click(screen.getByText('顯示更新提示'))
    expect(toggleShow).toHaveBeenCalledTimes(1)
  })
})
