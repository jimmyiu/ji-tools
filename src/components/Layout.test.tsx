import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from './Layout'

const mockUsePwaPrompts = vi.fn()

vi.mock('../contexts/PwaPromptsContext', () => ({
  usePwaPrompts: () => mockUsePwaPrompts(),
}))

function prompts({ installVisible = false, updateVisible = false } = {}) {
  return {
    install: {
      visible: installVisible,
      isIOS: false,
      dismiss: vi.fn(),
      toggle: vi.fn(),
      prompt: vi.fn(),
    },
    update: {
      visible: updateVisible,
      dismiss: vi.fn(),
      toggle: vi.fn(),
      reload: vi.fn(),
    },
  }
}

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

  mockUsePwaPrompts.mockReturnValue(prompts())
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

describe('Layout padding offsets', () => {
  it('uses CSS custom properties for padding on main', () => {
    const { container } = renderWithRouter(<Layout />)
    const main = container.querySelector('main') as HTMLElement
    expect(main.style.paddingBottom).toBe('var(--nav-bottom-offset)')
    expect(main.style.paddingLeft).toBe('var(--nav-left-offset)')
  })

  it('sets header top to the install prompt banner height', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(96)
    mockUsePwaPrompts.mockReturnValue(prompts({ installVisible: true }))

    const { container } = renderWithRouter(<Layout />)

    const header = container.querySelector('header') as HTMLElement
    expect(header.style.top).toBe('96px')
  })

  it('sets header top to 0 when the install prompt banner is hidden', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(96)

    const { container } = renderWithRouter(<Layout />)

    const header = container.querySelector('header') as HTMLElement
    expect(header.style.top).toBe('0px')
  })

  it('header top does not include the update prompt banner height when it is visible', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(96)
    mockUsePwaPrompts.mockReturnValue(prompts({ updateVisible: true }))

    const { container } = renderWithRouter(<Layout />)

    const header = container.querySelector('header') as HTMLElement
    expect(header.style.top).toBe('0px')
  })

  it('sets paddingLeft via var on header', () => {
    const { container } = renderWithRouter(<Layout />)
    const header = container.querySelector('header') as HTMLElement
    expect(header.style.paddingLeft).toBe('var(--nav-left-offset)')
  })
})

describe('Skip-to-content link', () => {
  it('renders skip-to-content link with correct href', () => {
    renderWithRouter(<Layout />)
    const link = screen.getByText('跳到主內容')
    expect(link).toHaveAttribute('href', '#main-content')
  })

  it('has sr-only class by default', () => {
    renderWithRouter(<Layout />)
    const link = screen.getByText('跳到主內容')
    expect(link.className).toContain('sr-only')
  })
})

describe('Main element', () => {
  it('has id="main-content"', () => {
    const { container } = renderWithRouter(<Layout />)
    const main = container.querySelector('main')
    expect(main).toHaveAttribute('id', 'main-content')
  })
})

describe('Prompt banners', () => {
  it('renders the install prompt banner through the provider', () => {
    mockUsePwaPrompts.mockReturnValue(prompts({ installVisible: true }))

    renderWithRouter(<Layout />)

    expect(screen.getByText('安裝 JI Tools')).toBeInTheDocument()
  })

  it('renders the update prompt banner through the provider', () => {
    mockUsePwaPrompts.mockReturnValue(prompts({ updateVisible: true }))

    renderWithRouter(<Layout />)

    expect(screen.getByText('新版本已可用')).toBeInTheDocument()
    expect(screen.getByText('重新整理')).toBeInTheDocument()
  })

  it('dismisses the update prompt when its close button is clicked', () => {
    const update = prompts({ updateVisible: true }).update
    mockUsePwaPrompts.mockReturnValue({ ...prompts(), update })

    renderWithRouter(<Layout />)
    fireEvent.click(screen.getByLabelText('關閉'))

    expect(update.dismiss).toHaveBeenCalledOnce()
  })
})
