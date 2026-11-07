import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import InstallBanner from './InstallBanner'

const mockInstallPrompt = vi.fn()

vi.mock('../contexts/PwaPromptsContext', () => ({
  usePwaPrompts: () => ({ install: mockInstallPrompt(), update: {} }),
}))

function installPrompt(
  overrides: Partial<{
    visible: boolean
    isIOS: boolean
    dismiss: () => void
    toggle: () => void
    prompt: () => void
  }> = {}
) {
  return {
    visible: true,
    isIOS: false,
    dismiss: vi.fn(),
    toggle: vi.fn(),
    prompt: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  mockInstallPrompt.mockReturnValue(installPrompt())
})

describe('InstallBanner', () => {
  it('renders nothing when the install prompt is not visible', () => {
    mockInstallPrompt.mockReturnValue(installPrompt({ visible: false }))

    const { container } = render(<InstallBanner />)

    expect(container.innerHTML).toBe('')
  })

  it('renders the install button on a browser that offers installation', () => {
    render(<InstallBanner />)

    expect(screen.getByText('安裝 JI Tools')).toBeInTheDocument()
    expect(screen.getByText('安裝')).toBeInTheDocument()
    expect(screen.queryByText(/加入主畫面/)).not.toBeInTheDocument()
  })

  it('renders share instructions instead of the install button on iOS', () => {
    mockInstallPrompt.mockReturnValue(installPrompt({ isIOS: true }))

    render(<InstallBanner />)

    expect(screen.getByText('安裝 JI Tools 到主屏幕')).toBeInTheDocument()
    expect(screen.getByText(/加入主畫面/)).toBeInTheDocument()
    expect(screen.queryByText('安裝')).not.toBeInTheDocument()
  })

  it('asks the install prompt to install when the install button is clicked', () => {
    const prompt = vi.fn()
    mockInstallPrompt.mockReturnValue(installPrompt({ prompt }))

    render(<InstallBanner />)
    fireEvent.click(screen.getByText('安裝'))

    expect(prompt).toHaveBeenCalledOnce()
  })

  it('dismisses the install prompt when the close button is clicked', () => {
    const dismiss = vi.fn()
    mockInstallPrompt.mockReturnValue(installPrompt({ dismiss }))

    render(<InstallBanner />)
    fireEvent.click(screen.getByLabelText('關閉'))

    expect(dismiss).toHaveBeenCalledOnce()
  })

  it('is sticky and accounts for the safe-area inset', () => {
    const { container } = render(<InstallBanner />)
    const banner = container.firstElementChild as HTMLElement

    expect(banner.className).toContain('sticky')
    expect(banner.style.paddingTop).toBe('calc(1rem + env(safe-area-inset-top))')
  })
})
