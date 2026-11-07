import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InterestBreakdown } from './InterestBreakdown'
import { computeMarathonSavings } from '@/lib/marathon'
import type { PhaseState } from '@/lib/phases'

describe('InterestBreakdown', () => {
  const mockPhases: PhaseState[] = [
    { startDate: '2026-05-04', endDate: '2026-07-01', hkdRate: 1.85, usdRate: 3.0 },
    { startDate: '2026-07-02', endDate: '2026-08-02', hkdRate: 2.0, usdRate: 3.1 },
    { startDate: '2026-08-03', endDate: '', hkdRate: 2.2, usdRate: 3.3 },
  ]

  const mockPhaseResults = computeMarathonSavings(mockPhases, '2026-05-04', 100000, 'HKD').phaseResults

  it('renders HKD currency label and prefix', () => {
    render(
      <InterestBreakdown
        currency="HKD"
        principal={100000}
        phaseResults={mockPhaseResults}
      />
    )

    expect(screen.getByText('港元 利息明細')).toBeInTheDocument()
  })

  it('renders USD currency label and prefix', () => {
    render(
      <InterestBreakdown
        currency="USD"
        principal={100000}
        phaseResults={mockPhaseResults}
      />
    )

    expect(screen.getByText('美元 利息明細')).toBeInTheDocument()
  })

  it('renders phase with zero days as not in deposit period', () => {
    render(
      <InterestBreakdown
        currency="HKD"
        principal={100000}
        phaseResults={mockPhaseResults}
      />
    )

    expect(screen.getByText('（不在存款期內）')).toBeInTheDocument()
  })

  it('renders principal in description', () => {
    render(
      <InterestBreakdown
        currency="HKD"
        principal={100000}
        phaseResults={mockPhaseResults}
      />
    )

    expect(screen.getByText('(本金 HK$ 100,000.00)')).toBeInTheDocument()
  })
})
