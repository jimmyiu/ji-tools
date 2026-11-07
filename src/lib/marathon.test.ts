import { describe, it, expect } from 'vitest'
import { computeMarathonSavings } from './marathon'
import type { PhaseState } from './phases'

const defaultPhases: PhaseState[] = [
  { startDate: '2026-10-02', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3 },
  { startDate: '2026-12-01', endDate: '2027-01-03', hkdRate: 3.0, usdRate: 3.5 },
  { startDate: '2027-01-04', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
]

interface WindowCase {
  name: string
  phases: PhaseState[]
  depositDate: string
  days: number[]
  durations: number[]
  totalDays: number
  totalDuration: number
}

const windowCases: WindowCase[] = [
  {
    name: 'phases inside the deposit window',
    phases: defaultPhases,
    depositDate: '2026-10-02',
    days: [60, 34, 29],
    durations: [60, 34, 29],
    totalDays: 123,
    totalDuration: 123,
  },
  {
    name: 'deposit date inside a phase',
    phases: defaultPhases,
    depositDate: '2026-10-15',
    days: [47, 34, 29],
    durations: [60, 34, 29],
    totalDays: 110,
    totalDuration: 123,
  },
  {
    name: 'deposit date after every phase',
    phases: defaultPhases,
    depositDate: '2027-02-02',
    days: [0, 0, 0],
    durations: [60, 34, 29],
    totalDays: 0,
    totalDuration: 123,
  },
  {
    name: 'blank phase dates',
    phases: [
      defaultPhases[0],
      { startDate: '2026-12-01', endDate: '', hkdRate: 3.0, usdRate: 3.5 },
      { startDate: '', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
    ],
    depositDate: '2026-10-02',
    days: [60, 0, 0],
    durations: [60, 0, 0],
    totalDays: 60,
    totalDuration: 60,
  },
  {
    name: 'contiguity clamping so no day counts twice',
    phases: [
      { startDate: '2026-10-02', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3 },
      { startDate: '2026-11-20', endDate: '2026-12-10', hkdRate: 3.0, usdRate: 3.5 },
      { startDate: '2026-12-11', endDate: '2026-12-31', hkdRate: 3.2, usdRate: 3.6 },
    ],
    depositDate: '2026-10-02',
    days: [60, 10, 21],
    durations: [60, 21, 21],
    totalDays: 91,
    totalDuration: 102,
  },
  {
    name: 'no phases',
    phases: [],
    depositDate: '2026-10-02',
    days: [],
    durations: [],
    totalDays: 0,
    totalDuration: 0,
  },
]

describe('phase schedule', () => {
  it.each(windowCases)(
    'reports days and durations for $name',
    ({ phases, depositDate, days, durations, totalDays, totalDuration }) => {
      const schedule = computeMarathonSavings(phases, depositDate, 100000, 'HKD')
      expect(schedule.phaseResults.map((p) => p.days)).toEqual(days)
      expect(schedule.phaseResults.map((p) => p.duration)).toEqual(durations)
      expect(schedule.totalDays).toBe(totalDays)
      expect(schedule.totalDuration).toBe(totalDuration)
    },
  )

  it.each(windowCases)(
    'tiles the timeline for $name',
    ({ phases, depositDate, totalDuration }) => {
      const schedule = computeMarathonSavings(phases, depositDate, 100000, 'HKD')
      const bands = schedule.phaseResults
      if (totalDuration === 0) {
        expect(bands.every(({ position, width }) => position === 0 && width === 0)).toBe(true)
        return
      }
      expect(bands.map((p) => p.position).at(-1)! + bands.at(-1)!.width).toBeCloseTo(100, 8)
      expect(bands.reduce((sum, p) => sum + p.width, 0)).toBeCloseTo(100, 8)
      bands.forEach((band, i) => {
        expect(band.position).toBeCloseTo(
          totalDuration === 0 ? 0 : (bands.slice(0, i).reduce((s, p) => s + p.duration, 0) / totalDuration) * 100,
          8,
        )
      })
    },
  )

  it('reports contiguous timeline positions for the default schedule', () => {
    const schedule = computeMarathonSavings(defaultPhases, '2026-10-02', 100000, 'HKD')
    const positions = schedule.phaseResults.map((p) => p.position)
    expect(positions[0]).toBeCloseTo(0, 8)
    expect(positions[1]).toBeCloseTo(48.780487804878, 8)
    expect(positions[2]).toBeCloseTo(76.422764227642, 8)

    const widths = schedule.phaseResults.map((p) => p.width)
    expect(widths[0]).toBeCloseTo(48.780487804878, 8)
    expect(widths[1]).toBeCloseTo(27.642276422764, 8)
    expect(widths[2]).toBeCloseTo(23.577235772358, 8)
  })

  it.each([{ currency: 'HKD' }, { currency: 'USD' }] as { currency: 'HKD' | 'USD' }[])(
    'sums per-phase interest to total interest ($currency)',
    ({ currency }) => {
      const schedule = computeMarathonSavings(defaultPhases, '2026-10-02', 100000, currency)
      expect(schedule.phaseResults.reduce((sum, p) => sum + p.interest, 0)).toBeCloseTo(
        schedule.totalInterest,
        8,
      )
    },
  )

  it('reports each phase over its own dates and rates', () => {
    const schedule = computeMarathonSavings(defaultPhases, '2026-10-02', 100000, 'HKD')
    expect(schedule.phaseResults.map(({ startDate, endDate, hkdRate, usdRate, rate }) => ({
      startDate,
      endDate,
      hkdRate,
      usdRate,
      rate,
    }))).toEqual([
      { startDate: '2026-10-02', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3, rate: 2.8 },
      { startDate: '2026-12-01', endDate: '2027-01-03', hkdRate: 3.0, usdRate: 3.5, rate: 3.0 },
      { startDate: '2027-01-04', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6, rate: 3.2 },
    ])
  })

  it('treats invalid dates as 0 days and 0 duration', () => {
    const phases: PhaseState[] = [
      { startDate: 'invalid', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3 },
      { startDate: '2026-12-01', endDate: 'not-a-date', hkdRate: 3.0, usdRate: 3.5 },
    ]
    const schedule = computeMarathonSavings(phases, '2026-10-02', 100000, 'HKD')
    expect(schedule.phaseResults.map(({ days, duration }) => ({ days, duration }))).toEqual([
      { days: 0, duration: 0 },
      { days: 0, duration: 0 },
    ])
    expect(schedule.totalDays).toBe(0)
    expect(schedule.totalDuration).toBe(0)
  })

  it('does not mutate its input', () => {
    const before = JSON.parse(JSON.stringify(defaultPhases))
    computeMarathonSavings(defaultPhases, '2026-10-02', 100000, 'HKD')
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
    expect(
      r.phaseResults.every(
        ({ days, rate, interest }) =>
          Number.isFinite(days) && Number.isFinite(rate) && Number.isFinite(interest),
      ),
    ).toBe(true)
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
    expect(r.totalDuration).toBe(0)
    expect(r.totalInterest).toBe(0)
    expect(r.hkdActualRate).toBe(0)
    expect(r.usdActualRate).toBe(0)
  })
})
