import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InterestBreakdown } from './InterestBreakdown'
import type { PhaseResult } from '@/hooks/useMarathonSavings'

describe('InterestBreakdown', () => {
  const mockPhaseResults: PhaseResult[] = [
    { days: 59, rate: 1.85, interest: 895.21 },
    { days: 32, rate: 2.0, interest: 526.03 },
    { days: 0, rate: 0, interest: 0 },
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
