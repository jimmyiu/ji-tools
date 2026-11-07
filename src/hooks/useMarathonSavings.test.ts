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

describe('useInputs applyPreset', () => {
  it('applies phases and the deposit date together, leaving principal and currency alone', () => {
    const { result } = renderHook(() => useInputs())
    const preset = {
      id: 'test-preset',
      phases: [
        { startDate: '2024-03-01', endDate: '2024-03-10', hkdRate: 1.5, usdRate: 2.5 },
        { startDate: '2024-03-20', endDate: '2024-03-25', hkdRate: 1.7, usdRate: 2.7 },
        { startDate: '2024-04-01', endDate: '2024-04-05', hkdRate: 1.9, usdRate: 2.9 },
      ] as Phases,
    }

    act(() => {
      result.current.setCurrency('USD')
      result.current.setPrincipal('250000')
    })

    act(() => {
      result.current.applyPreset(preset)
    })

    expect(result.current.phases).toEqual([
      { ...preset.phases[0] },
      { ...preset.phases[1], startDate: '2024-03-11' },
      { ...preset.phases[2], startDate: '2024-03-26' },
    ])
    expect(result.current.depositDate).toBe('2024-03-01')
    expect(result.current.currency).toBe('USD')
    expect(result.current.principal).toBe('250000')
  })
})
