import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useInputs } from './useMarathonSavings'
import type { Phases } from '../lib/phases'
import type { MarathonSavingsPreset } from '../lib/marathonPresets'

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
  const makePreset = (): MarathonSavingsPreset => ({
    id: 'test-preset',
    phases: [
      { startDate: '2024-03-01', endDate: '2024-03-10', hkdRate: 1.5, usdRate: 2.5 },
      { startDate: '2024-03-20', endDate: '2024-03-25', hkdRate: 1.7, usdRate: 2.7 },
      { startDate: '2024-04-01', endDate: '2024-04-05', hkdRate: 1.9, usdRate: 2.9 },
    ] as Phases,
  })

  it('normalizes phase dates to contiguous ones from the preset', () => {
    const { result } = renderHook(() => useInputs())
    const preset = makePreset()
    const submitted = preset.phases as Phases

    act(() => {
      result.current.applyPreset(preset)
    })

    expect(result.current.phases).toEqual([
      { ...submitted[0] },
      { ...submitted[1], startDate: '2024-03-11' },
      { ...submitted[2], startDate: '2024-03-26' },
    ])
    expect(submitted[1].startDate).toBe('2024-03-20') // preset not mutated
    expect(result.current.phases).not.toBe(submitted)
  })

  it("sets the deposit date to the preset's first phase start", () => {
    const { result } = renderHook(() => useInputs())

    act(() => {
      result.current.applyPreset(makePreset())
    })

    expect(result.current.depositDate).toBe('2024-03-01')
  })

  it('leaves principal and currency untouched', () => {
    const { result } = renderHook(() => useInputs())

    act(() => {
      result.current.setCurrency('USD')
      result.current.setPrincipal('250000')
    })

    act(() => {
      result.current.applyPreset(makePreset())
    })

    expect(result.current.currency).toBe('USD')
    expect(result.current.principal).toBe('250000')
  })
})
