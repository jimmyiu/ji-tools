import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroMetrics } from './HeroMetrics'

describe('HeroMetrics', () => {
  it('renders HKD and USD effective rates', () => {
    render(<HeroMetrics hkdActualRate={1.97} usdActualRate={3.1} depositDate="2026-05-31" />)

    expect(screen.getByText('1.9700%')).toBeInTheDocument()
    expect(screen.getByText('3.1000%')).toBeInTheDocument()
  })

  it('renders deposit date subtitle using fmtDateShort', () => {
    render(<HeroMetrics hkdActualRate={1.97} usdActualRate={3.1} depositDate="2026-05-31" />)

    const subtitles = screen.getAllByText('由 31-May 起計')
    expect(subtitles).toHaveLength(2)
  })

  it('renders HKD and USD labels', () => {
    render(<HeroMetrics hkdActualRate={0} usdActualRate={0} depositDate="2026-01-01" />)

    expect(screen.getByText('HKD 實際等效年利率')).toBeInTheDocument()
    expect(screen.getByText('USD 實際等效年利率')).toBeInTheDocument()
  })
})
