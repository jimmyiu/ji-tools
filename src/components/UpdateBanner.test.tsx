import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UpdateBanner from './UpdateBanner'

const mockUpdatePrompt = vi.fn()

vi.mock('../contexts/PwaPromptsContext', () => ({
  usePwaPrompts: () => ({ install: {}, update: mockUpdatePrompt() }),
}))

function updatePrompt(overrides: Partial<{ visible: boolean; reload: () => void; dismiss: () => void }> = {}) {
  return {
    visible: true,
    reload: vi.fn(),
    dismiss: vi.fn(),
    toggle: vi.fn(),
    ...overrides,
  }
}

function renderBanner() {
  return render(<UpdateBanner />)
}

beforeEach(() => {
  mockUpdatePrompt.mockReturnValue(updatePrompt())
})

describe('UpdateBanner', () => {
  it('renders when the update prompt is visible', () => {
    renderBanner()
    expect(screen.getByText('新版本已可用')).toBeInTheDocument()
  })

  it('returns null when the update prompt is not visible', () => {
    mockUpdatePrompt.mockReturnValue(updatePrompt({ visible: false }))
    const { container } = renderBanner()
    expect(container.innerHTML).toBe('')
  })

  it('reloads the update prompt when the refresh button is clicked', () => {
    const reload = vi.fn()
    mockUpdatePrompt.mockReturnValue(updatePrompt({ reload }))
    renderBanner()

    fireEvent.click(screen.getByText('重新整理'))

    expect(reload).toHaveBeenCalledOnce()
  })

  it('dismisses the update prompt when the close button is clicked', () => {
    const dismiss = vi.fn()
    mockUpdatePrompt.mockReturnValue(updatePrompt({ dismiss }))
    renderBanner()

    fireEvent.click(screen.getByLabelText('關閉'))

    expect(dismiss).toHaveBeenCalledOnce()
  })

  it('has fixed positioning', () => {
    const { container } = renderBanner()
    const banner = container.firstElementChild as HTMLElement
    expect(banner.className).toContain('fixed')
  })

  it('does not have sticky class', () => {
    const { container } = renderBanner()
    const banner = container.firstElementChild as HTMLElement
    expect(banner.className).not.toContain('sticky')
  })

  it('does not have top inline style', () => {
    const { container } = renderBanner()
    const banner = container.firstElementChild as HTMLElement
    expect(banner.style.top).toBe('')
  })

  it('does not have border-b class', () => {
    const { container } = renderBanner()
    const banner = container.firstElementChild as HTMLElement
    expect(banner.className).not.toContain('border-b')
  })

  it('uses var(--update-banner-bottom) for bottom style', () => {
    const { container } = renderBanner()
    const banner = container.firstElementChild as HTMLElement
    expect(banner.style.bottom).toBe('var(--update-banner-bottom)')
  })

  it('has z-50 class', () => {
    const { container } = renderBanner()
    const banner = container.firstElementChild as HTMLElement
    expect(banner.className).toContain('z-50')
  })

  it('has w-full class', () => {
    const { container } = renderBanner()
    const banner = container.firstElementChild as HTMLElement
    expect(banner.className).toContain('w-full')
  })

  it('uses animate-slide-up class', () => {
    const { container } = renderBanner()
    const banner = container.firstElementChild as HTMLElement
    expect(banner.className).toContain('animate-slide-up')
  })

  it('does not have animate-slide-in class', () => {
    const { container } = renderBanner()
    const banner = container.firstElementChild as HTMLElement
    expect(banner.className).not.toContain('animate-slide-in')
  })
})
