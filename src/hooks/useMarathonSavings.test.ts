import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useInputs } from './useMarathonSavings'
import type { Phases } from '../lib/phases'

describe('useInputs', () => {
  it('replaces phases as a whole, preserving rates and normalizing dates', () => {
    const { result } = renderHook(() => useInputs())
    const otherInputs = {
      depositDate: result.current.depositDate,
      currency: result.current.currency,
      principal: result.current.principal,
    }
    const submittedPhases: Phases = [
      { startDate: '2025-01-01', endDate: '2025-01-03', hkdRate: '1.8', usdRate: '2.8' },
      { startDate: '2025-01-10', endDate: '2025-01-12', hkdRate: '2.0', usdRate: '3.0' },
      { startDate: '2025-01-20', endDate: '2025-01-22', hkdRate: '2.2', usdRate: '3.2' },
    ]

    act(() => {
      result.current.setPhases(submittedPhases)
    })

    expect(result.current.phases).toEqual([
      { ...submittedPhases[0] },
      { ...submittedPhases[1], startDate: '2025-01-04' },
      { ...submittedPhases[2], startDate: '2025-01-13' },
    ])
    expect(result.current.phases).not.toBe(submittedPhases)
    expect(submittedPhases[1].startDate).toBe('2025-01-10')
    expect(result.current).toMatchObject(otherInputs)
  })
})
