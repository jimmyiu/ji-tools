import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SideNav from './SideNav'
import TabBar from './TabBar'

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

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('SideNav', () => {
  it('renders navigation landmark with correct aria-label', () => {
    renderWithRouter(<SideNav />)
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', '主導航')
  })

  it('renders Home and Settings links', () => {
    renderWithRouter(<SideNav />)
    expect(screen.getByText('首頁')).toBeInTheDocument()
    expect(screen.getByText('設定')).toBeInTheDocument()
  })

  it('has hidden class by default (mobile viewport)', () => {
    const { container } = renderWithRouter(<SideNav />)
    const nav = container.querySelector('nav')
    expect(nav?.className).toContain('hidden')
  })

  it('has desktop-nav:flex class for desktop', () => {
    const { container } = renderWithRouter(<SideNav />)
    const nav = container.querySelector('nav')
    expect(nav?.className).toContain('desktop-nav:flex')
  })
})

describe('TabBar', () => {
  it('renders navigation landmark with correct aria-label', () => {
    renderWithRouter(<TabBar />)
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', '底部導航')
  })

  it('has desktop-nav:hidden class', () => {
    const { container } = renderWithRouter(<TabBar />)
    const nav = container.querySelector('nav')
    expect(nav?.className).toContain('desktop-nav:hidden')
  })

  it('renders as floating capsule with correct styling', () => {
    const { container } = renderWithRouter(<TabBar />)
    const capsule = container.querySelector('.max-w-\\[280px\\]')
    expect(capsule).toBeInTheDocument()
    expect(capsule?.className).toContain('rounded-2xl')
    expect(capsule?.className).toContain('h-16')
  })
})
