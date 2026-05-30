import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PhaseRateTimeline } from './PhaseRateTimeline'
import type { PhaseState } from '@/hooks/useMarathonSavings'

describe('PhaseRateTimeline', () => {
  const mockPhases: PhaseState[] = [
    { startDate: '2026-05-04', endDate: '2026-07-01', hkdRate: 1.85, usdRate: 3.0 },
    { startDate: '2026-07-02', endDate: '2026-08-02', hkdRate: 2.0, usdRate: 3.1 },
    { startDate: '2026-08-03', endDate: '2026-08-31', hkdRate: 2.2, usdRate: 3.3 },
  ]

  it('renders dual-label bar with HKD and USD rates', () => {
    render(<PhaseRateTimeline phases={mockPhases} depositDate="2026-05-04" />)

    expect(screen.getByText('HKD 1.85%')).toBeInTheDocument()
    expect(screen.getByText('USD 3%')).toBeInTheDocument()
    expect(screen.getByText('HKD 2%')).toBeInTheDocument()
    expect(screen.getByText('USD 3.1%')).toBeInTheDocument()
  })

  it('renders boundary dates', () => {
    render(<PhaseRateTimeline phases={mockPhases} depositDate="2026-05-04" />)

    expect(screen.getByText('04-May')).toBeInTheDocument()
    expect(screen.getByText('02-Jul')).toBeInTheDocument()
    expect(screen.getByText('03-Aug')).toBeInTheDocument()
    expect(screen.getByText('31-Aug')).toBeInTheDocument()
  })

  it('renders phase with zero effective days with muted styling', () => {
    const { container } = render(
      <PhaseRateTimeline phases={mockPhases} depositDate="2026-07-15" />
    )

    const mutedSegment = container.querySelector('[style*="opacity: 0.4"]')
    expect(mutedSegment).toBeInTheDocument()
  })

  it('shows zero days message when deposit date is after all phases', () => {
    render(<PhaseRateTimeline phases={mockPhases} depositDate="2026-12-01" />)

    expect(screen.getByText('存款日期在所有階段之後')).toBeInTheDocument()
  })
})
