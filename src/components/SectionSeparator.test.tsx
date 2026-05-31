import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SectionSeparator } from './SectionSeparator'

describe('SectionSeparator', () => {
  it('renders with default classes', () => {
    const { container } = render(<SectionSeparator />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('border-b', 'border-border', 'mx-4')
  })

  it('accepts additional className', () => {
    const { container } = render(<SectionSeparator className="lg:hidden" />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('border-b', 'border-border', 'mx-4', 'lg:hidden')
  })
})
