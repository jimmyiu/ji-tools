import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DateField } from './DateField'
import { FLASH_FADE_MS } from '@/lib/feedback'

describe('DateField', () => {
  it('fades back using the shared flash duration when not flashing', () => {
    render(<DateField label="實際存款日期" value="2026-10-02" onChange={() => {}} />)

    const container = screen.getByLabelText('實際存款日期').parentElement
    expect(container).toHaveStyle({ transitionDuration: `${FLASH_FADE_MS}ms` })
  })

  it('marks the container and drops the transition while flashing', () => {
    const { rerender } = render(
      <DateField label="實際存款日期" value="2026-10-02" onChange={() => {}} />
    )

    rerender(<DateField label="實際存款日期" value="2026-10-02" onChange={() => {}} flash />)

    const container = screen.getByLabelText('實際存款日期').parentElement
    expect(container).toHaveAttribute('data-flash', '')
    expect(container).not.toHaveStyle({ transitionDuration: `${FLASH_FADE_MS}ms` })
  })
})
