import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from './Layout'

const mockUsePwaUpdate = vi.fn()

vi.mock('../hooks/usePwaUpdate', () => ({
  usePwaUpdate: () => mockUsePwaUpdate(),
}))

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  mockUsePwaUpdate.mockReturnValue({
    needRefresh: false,
    update: vi.fn(),
  })
})

describe('Layout header', () => {
  let originalScrollY: number

  beforeEach(() => {
    originalScrollY = window.scrollY
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.scrollY = originalScrollY
  })

  it('renders the page title as an h1', () => {
    window.scrollY = 0
    renderWithRouter(<Layout />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('JI Tools')
  })

  it('renders h1 regardless of scroll position', () => {
    window.scrollY = 50
    renderWithRouter(<Layout />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('JI Tools')
  })

  it('does not render h2 (replaced by animated h1)', () => {
    window.scrollY = 0
    renderWithRouter(<Layout />)
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()

    window.scrollY = 50
    const { container } = renderWithRouter(<Layout />)
    expect(container.querySelector('h2')).not.toBeInTheDocument()
  })
})

describe('Layout bottom spacing', () => {
  it('does not render an h-14 spacer div', () => {
    const { container: c } = renderWithRouter(<Layout />)
    expect(c.querySelector('div[class="h-14"]')).not.toBeInTheDocument()
  })

  it('renders main without flex-1 class', () => {
    const { container: c } = renderWithRouter(<Layout />)
    const main = c.querySelector('main')
    expect(main).not.toHaveClass('flex-1')
  })

  it('sets paddingBottom on main via inline style', () => {
    const { container: c } = renderWithRouter(<Layout />)
    const main = c.querySelector('main') as HTMLElement
    const pb = main.style.paddingBottom
    expect(pb).toContain('72px')
    expect(pb).toContain('env(safe-area-inset-bottom)')
  })
})

describe('UpdateBanner', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders update banner with refresh button when needRefresh is true', () => {
    mockUsePwaUpdate.mockReturnValue({
      needRefresh: true,
      update: vi.fn(),
    })
    renderWithRouter(<Layout />)
    expect(screen.getByText('新版本已可用')).toBeInTheDocument()
    expect(screen.getByText('重新整理')).toBeInTheDocument()
  })

  it('does not render update banner when needRefresh is false', () => {
    mockUsePwaUpdate.mockReturnValue({
      needRefresh: false,
      update: vi.fn(),
    })
    renderWithRouter(<Layout />)
    expect(screen.queryByText('新版本已可用')).not.toBeInTheDocument()
    expect(screen.queryByText('重新整理')).not.toBeInTheDocument()
  })

  it('hides banner on dismiss click', () => {
    mockUsePwaUpdate.mockReturnValue({
      needRefresh: true,
      update: vi.fn(),
    })
    renderWithRouter(<Layout />)
    expect(screen.getByText('新版本已可用')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('關閉'))
    expect(screen.queryByText('新版本已可用')).not.toBeInTheDocument()
  })

  it('adjusts paddingBottom when update banner is visible', () => {
    mockUsePwaUpdate.mockReturnValue({
      needRefresh: true,
      update: vi.fn(),
    })
    const { container } = renderWithRouter(<Layout />)
    const main = container.querySelector('main') as HTMLElement
    const pb = main.style.paddingBottom
    expect(pb).toContain('env(safe-area-inset-bottom)')
    expect(pb).toMatch(/calc/)
  })
})
