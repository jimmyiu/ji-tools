import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import UpdateBanner from './UpdateBanner'

const defaultProps = {
  needRefresh: true,
  update: vi.fn(),
  dismiss: vi.fn(),
}

function renderBanner(props = {}) {
  return render(
    <UpdateBanner {...defaultProps} {...props} />,
  )
}

describe('UpdateBanner', () => {
  it('renders when needRefresh is true', () => {
    renderBanner()
    expect(screen.getByText('新版本已可用')).toBeInTheDocument()
  })

  it('returns null when needRefresh is false', () => {
    const { container } = renderBanner({ needRefresh: false })
    expect(container.innerHTML).toBe('')
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

  it('does not accept installBannerHeight prop', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: any = defaultProps
    expect(props).not.toHaveProperty('installBannerHeight')
  })
})