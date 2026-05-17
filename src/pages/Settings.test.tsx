import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Settings from './Settings'

function renderSettings() {
  return render(<BrowserRouter><Settings /></BrowserRouter>)
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

describe('Settings', () => {
  it('renders the app version from __APP_VERSION__', () => {
    renderSettings()
    expect(screen.getByText(__APP_VERSION__)).toBeInTheDocument()
  })
})
