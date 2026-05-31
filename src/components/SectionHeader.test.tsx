import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionHeader } from './SectionHeader'

describe('SectionHeader', () => {
  it('renders the title', () => {
    render(<SectionHeader title="存款設定" />)
    expect(screen.getByText('存款設定')).toBeInTheDocument()
  })

  it('renders the accent bar', () => {
    render(<SectionHeader title="Test" />)
    const accentBar = screen.getByTestId('accent-bar')
    expect(accentBar).toBeInTheDocument()
    expect(accentBar).toHaveClass('h-5', 'bg-muted-foreground/20', 'rounded-sm')
  })

  it('renders action element when provided', () => {
    render(<SectionHeader title="Test" action={<button>編輯</button>} />)
    expect(screen.getByText('編輯')).toBeInTheDocument()
  })

  it('does not render action container when action is not provided', () => {
    const { container } = render(<SectionHeader title="Test" />)
    const actionContainer = container.querySelector('.shrink-0')
    expect(actionContainer).not.toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<SectionHeader title="港元 利息明細" description="(本金 HK$ 100,000)" />)
    expect(screen.getByText('(本金 HK$ 100,000)')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<SectionHeader title="Test" />)
    expect(screen.queryByText('(本金')).not.toBeInTheDocument()
  })

  it('has mb-2 bottom spacing', () => {
    const { container } = render(<SectionHeader title="Test" />)
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('mb-2')
  })
})
