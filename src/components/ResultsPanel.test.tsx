import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultsPanel } from './ResultsPanel'
import type { PhaseResult } from '@/hooks/useMarathonSavings'

describe('ResultsPanel', () => {
  const mockPhaseResults: PhaseResult[] = [
    { days: 59, rate: 1.85, interest: 895.21 },
    { days: 32, rate: 2.0, interest: 526.03 },
    { days: 0, rate: 0, interest: 0 },
  ]

  it('renders HKD currency label and prefix', () => {
    render(
      <ResultsPanel
        currency="HKD"
        principal={100000}
        phaseResults={mockPhaseResults}
        totalDays={91}
        totalInterest={1421.24}
      />
    )

    expect(screen.getByText('港元 利息明細')).toBeInTheDocument()
    expect(screen.getByText('HK$1,421.24')).toBeInTheDocument()
  })

  it('renders USD currency label and prefix', () => {
    render(
      <ResultsPanel
        currency="USD"
        principal={100000}
        phaseResults={mockPhaseResults}
        totalDays={91}
        totalInterest={1421.24}
      />
    )

    expect(screen.getByText('美元 利息明細')).toBeInTheDocument()
    expect(screen.getByText('US$1,421.24')).toBeInTheDocument()
  })

  it('renders phase with zero days as not in deposit period', () => {
    render(
      <ResultsPanel
        currency="HKD"
        principal={100000}
        phaseResults={mockPhaseResults}
        totalDays={91}
        totalInterest={1421.24}
      />
    )

    expect(screen.getByText('（不在存款期內）')).toBeInTheDocument()
  })

  it('renders total days', () => {
    render(
      <ResultsPanel
        currency="HKD"
        principal={100000}
        phaseResults={mockPhaseResults}
        totalDays={91}
        totalInterest={1421.24}
      />
    )

    expect(screen.getByText('91 日')).toBeInTheDocument()
  })
})
