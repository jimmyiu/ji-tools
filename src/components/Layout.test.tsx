import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from './Layout'

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

  it('renders the page title in large mode when not scrolled', () => {
    window.scrollY = 0
    renderWithRouter(<Layout />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('JI Tools')
  })

  it('renders the title in a compact header when scrolled past threshold', () => {
    window.scrollY = 50
    renderWithRouter(<Layout />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('JI Tools')
  })

  it('does not render a h1 when scrolled past threshold', () => {
    window.scrollY = 50
    renderWithRouter(<Layout />)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('does not render the compact header when not scrolled', () => {
    window.scrollY = 0
    renderWithRouter(<Layout />)
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })
})
