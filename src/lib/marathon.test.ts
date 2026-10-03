import { describe, it, expect } from 'vitest'
import { computePhaseDays } from './marathon'
import type { PhaseState } from './phases'

const defaultPhases: PhaseState[] = [
  { startDate: '2026-10-02', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3 },
  { startDate: '2026-12-01', endDate: '2027-01-03', hkdRate: 3.0, usdRate: 3.5 },
  { startDate: '2027-01-04', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
]

describe('computePhaseDays', () => {
  it('allocates full durations when deposit is on phase 1 start', () => {
    const r = computePhaseDays(defaultPhases, '2026-10-02')
    expect(r.phases.map((p) => p.days)).toEqual([60, 34, 29])
    expect(r.phases.map((p) => p.duration)).toEqual([60, 34, 29])
    expect(r.totalDays).toBe(123)
    expect(r.totalDuration).toBe(123)
  })

  it('clamps phase 1 to the deposit date when deposit is mid-phase', () => {
    const r = computePhaseDays(defaultPhases, '2026-10-15')
    expect(r.phases[0].days).toBe(47)
    expect(r.phases[1].days).toBe(34)
    expect(r.phases[2].days).toBe(29)
    expect(r.totalDays).toBe(110)
  })

  it('returns zero days when deposit is after all phases', () => {
    const r = computePhaseDays(defaultPhases, '2027-02-02')
    expect(r.totalDays).toBe(0)
    expect(r.phases.every((p) => p.days === 0)).toBe(true)
  })

  it('treats a blank date as 0 days and 0 duration', () => {
    const phases: PhaseState[] = [
      defaultPhases[0],
      { startDate: '2026-12-01', endDate: '', hkdRate: 3.0, usdRate: 3.5 },
      { startDate: '', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
    ]
    const r = computePhaseDays(phases, '2026-10-02')
    expect(r.phases[1]).toMatchObject({ days: 0, duration: 0 })
    expect(r.phases[2]).toMatchObject({ days: 0, duration: 0 })
    expect(r.totalDays).toBe(60)
    expect(r.totalDuration).toBe(60)
  })

  it('clamps an overlapping phase so no day is counted twice', () => {
    const phases: PhaseState[] = [
      { startDate: '2026-10-02', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3 },
      { startDate: '2026-11-20', endDate: '2026-12-10', hkdRate: 3.0, usdRate: 3.5 },
      { startDate: '2026-12-11', endDate: '2026-12-31', hkdRate: 3.2, usdRate: 3.6 },
    ]
    const r = computePhaseDays(phases, '2026-10-02')
    expect(r.phases.map((p) => p.days)).toEqual([60, 10, 21])
    expect(r.totalDays).toBe(91)
    expect(r.totalDuration).toBe(102)
  })

  it('returns an empty result for an empty phases array', () => {
    const r = computePhaseDays([], '2026-10-02')
    expect(r.phases).toEqual([])
    expect(r.totalDays).toBe(0)
    expect(r.totalDuration).toBe(0)
  })

  it('does not mutate its input', () => {
    const before = JSON.parse(JSON.stringify(defaultPhases))
    computePhaseDays(defaultPhases, '2026-10-02')
    expect(defaultPhases).toEqual(before)
  })
})
