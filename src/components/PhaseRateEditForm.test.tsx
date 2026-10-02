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

  describe('contiguous date linkage', () => {
    const startInputs = () => screen.getAllByLabelText('開始日期')
    const endInputs = () => screen.getAllByLabelText('結束日期')

    const change = (el: HTMLElement, value: string) =>
      fireEvent.change(el, { target: { value } })

    it('setting phase 2 end date moves phase 3 start to end + 1 day', () => {
      const onChange = vi.fn()
      render(<PhaseRateEditForm phases={mockPhases} onChange={onChange} />)

      change(endInputs()[1], '2026-08-20')

      const updated = onChange.mock.calls[0][0] as PhaseState[]
      expect(updated[1].endDate).toBe('2026-08-20')
      expect(updated[2].startDate).toBe('2026-08-21')
      expect(updated[2].endDate).toBe('2026-08-31')
    })

    it('setting phase 2 end beyond phase 3 end unsets phase 3 end', () => {
      const onChange = vi.fn()
      render(<PhaseRateEditForm phases={mockPhases} onChange={onChange} />)

      change(endInputs()[1], '2026-09-10')

      const updated = onChange.mock.calls[0][0] as PhaseState[]
      expect(updated[2].startDate).toBe('2026-09-11')
      expect(updated[2].endDate).toBe('')
    })

    it('setting phase 3 start date moves phase 2 end to start - 1 day', () => {
      const onChange = vi.fn()
      render(<PhaseRateEditForm phases={mockPhases} onChange={onChange} />)

      change(startInputs()[2], '2026-09-01')

      const updated = onChange.mock.calls[0][0] as PhaseState[]
      expect(updated[1].endDate).toBe('2026-08-31')
      expect(updated[2].startDate).toBe('2026-09-01')
    })

    it('setting phase 1 end date moves phase 2 start and leaves later ends alone', () => {
      const onChange = vi.fn()
      render(<PhaseRateEditForm phases={mockPhases} onChange={onChange} />)

      change(endInputs()[0], '2026-06-15')

      const updated = onChange.mock.calls[0][0] as PhaseState[]
      expect(updated[1].startDate).toBe('2026-06-16')
      expect(updated[1].endDate).toBe('2026-08-02')
      expect(updated[2].endDate).toBe('2026-08-31')
    })

    it('setting phase 1 start date does not move phase 1 end date', () => {
      const onChange = vi.fn()
      render(<PhaseRateEditForm phases={mockPhases} onChange={onChange} />)

      change(startInputs()[0], '2026-05-10')

      const updated = onChange.mock.calls[0][0] as PhaseState[]
      expect(updated[0].startDate).toBe('2026-05-10')
      expect(updated[0].endDate).toBe('2026-07-01')
      expect(updated[1].startDate).toBe('2026-07-02')
    })

    it('unsets an end date earlier than its own start date', () => {
      const onChange = vi.fn()
      render(<PhaseRateEditForm phases={mockPhases} onChange={onChange} />)

      change(endInputs()[0], '2026-05-01')

      const updated = onChange.mock.calls[0][0] as PhaseState[]
      expect(updated[0].endDate).toBe('')
      expect(updated[1].startDate).toBe('')
    })

    it('gives end date fields a min of their own start date', () => {
      render(<PhaseRateEditForm phases={mockPhases} onChange={vi.fn()} />)

      expect(endInputs()[0]).toHaveAttribute('min', '2026-05-04')
      expect(endInputs()[1]).toHaveAttribute('min', '2026-07-02')
      expect(endInputs()[2]).toHaveAttribute('min', '2026-08-03')
    })

    it('gives derived start fields a min of previous start + 1 day', () => {
      render(<PhaseRateEditForm phases={mockPhases} onChange={vi.fn()} />)

      expect(startInputs()[0]).not.toHaveAttribute('min')
      expect(startInputs()[1]).toHaveAttribute('min', '2026-05-05')
      expect(startInputs()[2]).toHaveAttribute('min', '2026-07-03')
    })
  })
})
