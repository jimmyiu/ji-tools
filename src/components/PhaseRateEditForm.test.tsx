import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PhaseRateEditForm } from './PhaseRateEditForm'
import type { PhaseState } from '@/hooks/useMarathonSavings'

describe('PhaseRateEditForm', () => {
  const mockPhases: PhaseState[] = [
    { startDate: '2026-05-04', endDate: '2026-07-01', hkdRate: 1.85, usdRate: 3.0 },
    { startDate: '2026-07-02', endDate: '2026-08-02', hkdRate: 2.0, usdRate: 3.1 },
    { startDate: '2026-08-03', endDate: '2026-08-31', hkdRate: 2.2, usdRate: 3.3 },
  ]

  it('renders all phase fields', () => {
    render(
      <PhaseRateEditForm phases={mockPhases} onChange={vi.fn()} />
    )

    expect(screen.getByText('階段 1')).toBeInTheDocument()
    expect(screen.getByText('階段 2')).toBeInTheDocument()
    expect(screen.getByText('階段 3')).toBeInTheDocument()
  })

  it('calls onChange when a field is modified', () => {
    const onChange = vi.fn()
    render(
      <PhaseRateEditForm phases={mockPhases} onChange={onChange} />
    )

    const hkdInputs = screen.getAllByLabelText('HKD 年利率')
    fireEvent.change(hkdInputs[0], { target: { value: '2.5' } })

    expect(onChange).toHaveBeenCalled()
    const updatedPhases = onChange.mock.calls[0][0] as PhaseState[]
    expect(updatedPhases[0].hkdRate).toBe('2.5')
    expect(updatedPhases[1].hkdRate).toBe(2.0)
    expect(updatedPhases[2].hkdRate).toBe(2.2)
  })

  it('does not render Confirm/Cancel buttons (owned by EditableSection.Form)', () => {
    render(
      <PhaseRateEditForm phases={mockPhases} onChange={vi.fn()} />
    )

    expect(screen.queryByText('確認')).not.toBeInTheDocument()
    expect(screen.queryByText('取消')).not.toBeInTheDocument()
  })
})
