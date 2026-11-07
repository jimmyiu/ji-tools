import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InterestBreakdown } from './InterestBreakdown'
import type { PhaseResult } from '@/lib/marathon'

describe('InterestBreakdown', () => {
  const mockPhaseResults: PhaseResult[] = [
    { index: 0, startDate: '2026-05-04', endDate: '2026-07-01', days: 59, duration: 59, position: 0, width: 49.166666666666664, hkdRate: 1.85, usdRate: 3.0, rate: 1.85, interest: 895.21 },
    { index: 1, startDate: '2026-07-02', endDate: '2026-08-02', days: 32, duration: 32, position: 49.166666666666664, width: 26.666666666666668, hkdRate: 2.0, usdRate: 3.1, rate: 2.0, interest: 526.03 },
    { index: 2, startDate: '2026-08-03', endDate: '2026-08-31', days: 0, duration: 29, position: 75.83333333333333, width: 24.166666666666668, hkdRate: 0, usdRate: 0, rate: 0, interest: 0 },
  ]

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
