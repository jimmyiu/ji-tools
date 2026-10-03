import { describe, it, expect } from 'vitest'
import { computePhaseDays, computeMarathonSavings } from './marathon'
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

  it('treats invalid dates as 0 days and 0 duration', () => {
    const phases: PhaseState[] = [
      { startDate: 'invalid', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3 },
      { startDate: '2026-12-01', endDate: 'not-a-date', hkdRate: 3.0, usdRate: 3.5 },
    ]
    const r = computePhaseDays(phases, '2026-10-02')
    expect(r.phases.map(({ days, duration }) => ({ days, duration }))).toEqual([
      { days: 0, duration: 0 },
      { days: 0, duration: 0 },
    ])
    expect(r.totalDays).toBe(0)
    expect(r.totalDuration).toBe(0)
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

describe('computeMarathonSavings', () => {
  it('matches current hook output for default inputs (HKD)', () => {
    const r = computeMarathonSavings(defaultPhases, '2026-10-02', 100000, 'HKD')
    expect(r.hkdActualRate).toBeCloseTo(2.9495934959349595, 8)
    expect(r.usdActualRate).toBeCloseTo(3.4260162601626014, 8)
    expect(r.totalDays).toBe(123)
    expect(r.totalInterest).toBeCloseTo(993.972602739726, 8)
    expect(r.phaseResults).toHaveLength(3)
    expect(r.phaseResults[0].days).toBe(60)
    expect(r.phaseResults[0].rate).toBe(2.8)
    expect(r.phaseResults[0].interest).toBeCloseTo(460.2739726027397, 8)
    expect(r.phaseResults[1].interest).toBeCloseTo(279.45205479452056, 8)
    expect(r.phaseResults[2].interest).toBeCloseTo(254.24657534246575, 8)
  })

  it('uses USD rates and 360-day base when currency is USD', () => {
    const r = computeMarathonSavings(defaultPhases, '2026-10-02', 100000, 'USD')
    expect(r.phaseResults[0]).toMatchObject({ days: 60, rate: 3.3 })
    expect(r.phaseResults[0].interest).toBeCloseTo(550, 8)
    expect(r.phaseResults[1].interest).toBeCloseTo(330.55555555555554, 8)
    expect(r.phaseResults[2].interest).toBeCloseTo(290, 8)
    expect(r.totalInterest).toBeCloseTo(1170.5555555555557, 8)
    expect(r.hkdActualRate).toBeCloseTo(2.9495934959349595, 8)
    expect(r.usdActualRate).toBeCloseTo(3.4260162601626014, 8)
  })

  it('matches current output when deposit is mid-phase (HKD)', () => {
    const r = computeMarathonSavings(defaultPhases, '2026-10-15', 100000, 'HKD')
    expect(r.totalDays).toBe(110)
    expect(r.hkdActualRate).toBeCloseTo(2.9672727272727273, 8)
    expect(r.usdActualRate).toBeCloseTo(3.440909090909091, 8)
    expect(r.totalInterest).toBeCloseTo(894.2465753424658, 8)
    expect(r.phaseResults[0].days).toBe(47)
  })

  it('excludes blank phases from the weighted actual rate', () => {
    const phases: PhaseState[] = [
      defaultPhases[0],
      { startDate: '2026-12-01', endDate: '', hkdRate: 3.0, usdRate: 3.5 },
      { startDate: '', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
    ]
    const r = computeMarathonSavings(phases, '2026-10-02', 100000, 'HKD')
    expect(r.totalDays).toBe(60)
    expect(r.hkdActualRate).toBeCloseTo(2.8, 8)
    expect(r.usdActualRate).toBeCloseTo(3.3, 8)
    expect(r.totalInterest).toBeCloseTo(460.2739726027397, 8)
  })

  it('keeps totals finite when phase dates are invalid', () => {
    const phases: PhaseState[] = [
      { startDate: 'invalid', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3 },
      { startDate: '2026-12-01', endDate: 'not-a-date', hkdRate: 3.0, usdRate: 3.5 },
    ]
    const r = computeMarathonSavings(phases, '2026-10-02', 100000, 'HKD')
    expect(r.totalDays).toBe(0)
    expect(r.totalInterest).toBe(0)
    expect(r.hkdActualRate).toBe(0)
    expect(r.usdActualRate).toBe(0)
    expect(r.phaseResults.every(({ days, rate, interest }) =>
      Number.isFinite(days) && Number.isFinite(rate) && Number.isFinite(interest),
    )).toBe(true)
  })

  it('treats a blank rate as 0', () => {
    const phases: PhaseState[] = [
      { startDate: '2026-10-02', endDate: '2026-11-30', hkdRate: '', usdRate: 3.3 },
      { startDate: '2026-12-01', endDate: '2027-01-03', hkdRate: 3.0, usdRate: 3.5 },
      { startDate: '2027-01-04', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
    ]
    const r = computeMarathonSavings(phases, '2026-10-02', 100000, 'HKD')
    expect(r.phaseResults[0].rate).toBe(0)
    expect(r.phaseResults[0].interest).toBe(0)
    expect(r.hkdActualRate).toBeCloseTo(1.583739837398374, 8)
  })

  it('returns zero interest when principal is 0', () => {
    const r = computeMarathonSavings(defaultPhases, '2026-10-02', 0, 'HKD')
    expect(r.totalInterest).toBe(0)
    expect(r.phaseResults.every((p) => p.interest === 0)).toBe(true)
    expect(r.hkdActualRate).toBeCloseTo(2.9495934959349595, 8)
  })

  it('returns a zero result for an empty phases array', () => {
    const r = computeMarathonSavings([], '2026-10-02', 100000, 'HKD')
    expect(r.phaseResults).toEqual([])
    expect(r.totalDays).toBe(0)
    expect(r.totalInterest).toBe(0)
    expect(r.hkdActualRate).toBe(0)
    expect(r.usdActualRate).toBe(0)
  })
})
