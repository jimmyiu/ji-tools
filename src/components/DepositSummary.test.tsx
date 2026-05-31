import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DepositSummary } from './DepositSummary'

describe('DepositSummary', () => {
  it('renders total days and total interest in HKD', () => {
    render(
      <DepositSummary
        currency="HKD"
        totalDays={91}
        totalInterest={1421.24}
      />
    )

    expect(screen.getByText('91 日')).toBeInTheDocument()
    expect(screen.getByText('HK$1,421.24')).toBeInTheDocument()
  })

  it('renders total interest in USD', () => {
    render(
      <DepositSummary
        currency="USD"
        totalDays={91}
        totalInterest={1421.24}
      />
    )

    expect(screen.getByText('US$1,421.24')).toBeInTheDocument()
  })

  it('renders total days label', () => {
    render(
      <DepositSummary
        currency="HKD"
        totalDays={91}
        totalInterest={1421.24}
      />
    )

    expect(screen.getByText('總存款日數')).toBeInTheDocument()
    expect(screen.getByText('期滿總利息')).toBeInTheDocument()
  })
})
