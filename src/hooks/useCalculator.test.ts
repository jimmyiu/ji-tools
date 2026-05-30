import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  computeEndDate,
  computePeriods,
  useCalculator,
} from '../hooks/useCalculator'
import {
  addDays,
  startOfDay,
  format,
} from 'date-fns'

describe('computeEndDate', () => {
  function checkEndDate(start: Date, months: number, expected: Date) {
    const result = computeEndDate(start, months)
    expect(startOfDay(result)).toEqual(startOfDay(expected))
  }

  it('subtracts 1 day when addMonths lands on same day of month', () => {
    checkEndDate(new Date(2025, 4, 12), 1, new Date(2025, 5, 11))
  })

  it('returns addMonths result directly when day is clamped (31-Jan -> 28-Feb)', () => {
    checkEndDate(new Date(2026, 0, 31), 1, new Date(2026, 1, 28))
  })

  it('subtracts 1 day for multi-month period with same day match', () => {
    checkEndDate(new Date(2025, 4, 12), 3, new Date(2025, 7, 11))
  })

  it('handles multi-month where end month clips to shorter month', () => {
    checkEndDate(new Date(2026, 0, 31), 3, new Date(2026, 3, 30))
  })

  it('handles 29-Feb leap year: Feb has 29 days, clips to 28', () => {
    checkEndDate(new Date(2028, 1, 29), 1, new Date(2028, 2, 28))
  })

  it('handles 29-Feb + 2 months with same-day subtraction', () => {
    checkEndDate(new Date(2028, 1, 29), 2, new Date(2028, 3, 28))
  })

  it('handles deposit starting on month-end edge (31st -> 30th of next short month)', () => {
    checkEndDate(new Date(2026, 2, 31), 1, new Date(2026, 3, 30))
  })

  it('handles 12-month period (1 year) with same-day subtraction', () => {
    checkEndDate(new Date(2026, 0, 15), 12, new Date(2027, 0, 14))
  })

  it('result of computeEndDate for iterate=1 matches overall end date display', () => {
    const start = new Date(2026, 0, 31)
    const end = computeEndDate(start, 1)
    expect(startOfDay(end)).toEqual(startOfDay(new Date(2026, 1, 28)))
  })
})

describe('computePeriods', () => {
  function checkPeriod(
    startDateStr: string,
    depositMonths: number,
    iterate: number,
    expectedPeriods: { start: string; end: string; days: number }[]
  ) {
    const periods = computePeriods(startDateStr, depositMonths, iterate)
    expect(periods).toHaveLength(expectedPeriods.length)
    periods.forEach((p, i) => {
      expect(format(startOfDay(p.startDate), 'yyyy-MM-dd')).toEqual(expectedPeriods[i].start)
      expect(format(startOfDay(p.endDate), 'yyyy-MM-dd')).toEqual(expectedPeriods[i].end)
      expect(p.days).toBe(expectedPeriods[i].days)
    })
  }

  it('returns single period for iterate=1, no day clamping', () => {
    checkPeriod('2025-05-12', 1, 1, [{ start: '2025-05-12', end: '2025-06-11', days: 31 }])
  })

  it('returns single period with day clamping: 31-Jan + 1mo', () => {
    checkPeriod('2026-01-31', 1, 1, [{ start: '2026-01-31', end: '2026-02-28', days: 29 }])
  })

  it('period 1 starts day after period 0 ends (chaining)', () => {
    const periods = computePeriods('2025-05-12', 1, 2)
    expect(periods).toHaveLength(2)
    expect(format(startOfDay(periods[0].endDate), 'yyyy-MM-dd')).toBe('2025-06-11')
    expect(format(startOfDay(periods[1].startDate), 'yyyy-MM-dd')).toBe('2025-06-12')
    expect(format(startOfDay(periods[1].endDate), 'yyyy-MM-dd')).toBe('2025-07-11')
  })

  it('3-month periods have correct day counts', () => {
    const periods = computePeriods('2025-05-12', 3, 2)
    expect(periods[0].days).toBe(92)
    expect(periods[1].days).toBe(92)
  })

  it('chained clamped dates: 31-Jan-2026 + 1mo x 2 iterations', () => {
    const periods = computePeriods('2026-01-31', 1, 2)
    expect(periods).toHaveLength(2)
    expect(format(startOfDay(periods[0].startDate), 'yyyy-MM-dd')).toBe('2026-01-31')
    expect(format(startOfDay(periods[0].endDate), 'yyyy-MM-dd')).toBe('2026-02-28')
    expect(periods[0].days).toBe(29)
    expect(format(startOfDay(periods[1].startDate), 'yyyy-MM-dd')).toBe('2026-03-01')
    expect(format(startOfDay(periods[1].endDate), 'yyyy-MM-dd')).toBe('2026-03-31')
    expect(periods[1].days).toBe(31)
  })

  it('leap year: start 29-Feb-2028, iterate=2, each period correct', () => {
    const periods = computePeriods('2028-02-29', 1, 2)
    expect(periods).toHaveLength(2)
    expect(format(startOfDay(periods[0].startDate), 'yyyy-MM-dd')).toBe('2028-02-29')
    expect(format(startOfDay(periods[0].endDate), 'yyyy-MM-dd')).toBe('2028-03-28')
    expect(periods[0].days).toBe(29)
    expect(format(startOfDay(periods[1].startDate), 'yyyy-MM-dd')).toBe('2028-03-29')
    expect(format(startOfDay(periods[1].endDate), 'yyyy-MM-dd')).toBe('2028-04-28')
    expect(periods[1].days).toBe(31)
  })

  it('leap year: start 29-Feb-2028, iterate=3', () => {
    const periods = computePeriods('2028-02-29', 1, 3)
    expect(periods).toHaveLength(3)
    expect(periods[0].days).toBe(29)
    expect(periods[1].days).toBe(31)
    expect(periods[2].days).toBe(30)
  })

  it('iterate=3 produces 3 non-overlapping, contiguous periods', () => {
    const periods = computePeriods('2026-01-15', 2, 3)
    expect(periods).toHaveLength(3)
    expect(startOfDay(periods[1].startDate)).toEqual(startOfDay(addDays(periods[0].endDate, 1)))
    expect(startOfDay(periods[2].startDate)).toEqual(startOfDay(addDays(periods[1].endDate, 1)))
  })

  it('total days sum matches individual period days', () => {
    const periods = computePeriods('2025-05-12', 3, 2)
    const totalDays = periods.reduce((sum, p) => sum + p.days, 0)
    expect(totalDays).toBe(periods[0].days + periods[1].days)
  })
})

describe('end-to-end: user example scenarios', () => {
  function fmtDate(d: Date) {
    return format(d, 'yyyy-MM-dd')
  }

  it('12-May-2025 + 1 month + 1 iterate: period ends 11-Jun-2025, 31 days', () => {
    const periods = computePeriods('2025-05-12', 1, 1)
    expect(periods).toHaveLength(1)
    expect(fmtDate(periods[0].startDate)).toBe('2025-05-12')
    expect(fmtDate(periods[0].endDate)).toBe('2025-06-11')
    expect(periods[0].days).toBe(31)
  })

  it('2-May-2026 + 1 month + 1 iterate: period ends 1-Jun-2026, 31 days', () => {
    const periods = computePeriods('2026-05-02', 1, 1)
    expect(periods).toHaveLength(1)
    expect(fmtDate(periods[0].startDate)).toBe('2026-05-02')
    expect(fmtDate(periods[0].endDate)).toBe('2026-06-01')
    expect(periods[0].days).toBe(31)
  })

  it('31-Jan-2026 + 1 month + 1 iterate: period ends 28-Feb-2026, 29 days (leap year 2028)', () => {
    const periods = computePeriods('2026-01-31', 1, 1)
    expect(periods).toHaveLength(1)
    expect(fmtDate(periods[0].startDate)).toBe('2026-01-31')
    expect(fmtDate(periods[0].endDate)).toBe('2026-02-28')
    expect(periods[0].days).toBe(29)
  })

  it('29-Feb-2028 + 1 month + 1 iterate: period ends 28-Mar-2028, 29 days (leap year)', () => {
    const periods = computePeriods('2028-02-29', 1, 1)
    expect(periods).toHaveLength(1)
    expect(fmtDate(periods[0].startDate)).toBe('2028-02-29')
    expect(fmtDate(periods[0].endDate)).toBe('2028-03-28')
    expect(periods[0].days).toBe(29)
  })

  it('29-Feb-2028 + 1 month + 2 iterate: periods are 29 days then 31 days', () => {
    const periods = computePeriods('2028-02-29', 1, 2)
    expect(periods[0].days).toBe(29)
    expect(periods[1].days).toBe(31)
  })

  it('3-month periods starting 12-May-2025, iterate=2: each period 92 days', () => {
    const periods = computePeriods('2025-05-12', 3, 2)
    expect(periods[0].days).toBe(92)
    expect(periods[1].days).toBe(92)
  })

  it('last period end date matches computeEndDate(start, depositMonths * iterate)', () => {
    const periods = computePeriods('2025-05-12', 1, 3)
    const overallEnd = computeEndDate(new Date(2025, 4, 12), 3)
    expect(startOfDay(periods[periods.length - 1].endDate)).toEqual(startOfDay(overallEnd))
  })
})

describe('useCalculator', () => {
  const defaults = {
    startDate: '2025-05-12',
    initialPrincipal: 100000,
    depositMonths: 3,
    iterate: 1,
    hkdRate: 2.25,
    usdRate: 3.2,
    bankSellRate: 7.8468,
    bankBuyRate: 7.8103,
  }

  function run(overrides: Partial<typeof defaults>) {
    return renderHook(() => useCalculator({ ...defaults, ...overrides })).result
      .current
  }

  it('returns correct values for default inputs (HKD wins, break-even triggered)', () => {
    const r = run({})
    expect(r.hkdTotal).toBeCloseTo(100567.12328767, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(100348.81604957, 8)
    expect(r.difference).toBeCloseTo(-218.30723810, 8)
    expect(r.usdWins).toBe(false)
    expect(r.breakEvenIterate).toBe(2)
    expect(r.breakEvenDays).toBe(184)
    expect(r.breakEvenMonths).toBe(6)
    expect(r.totalDays).toBe(92)
  })

  it('returns correct values for iterate=2 (USD wins)', () => {
    const r = run({ iterate: 2 })
    expect(r.hkdTotal).toBeCloseTo(101137.46286358, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(101169.44636749, 8)
    expect(r.difference).toBeCloseTo(31.98350391, 8)
    expect(r.usdWins).toBe(true)
    expect(r.breakEvenIterate).toBeNull()
    expect(r.totalDays).toBe(184)
  })

  it('returns correct values for zero rates', () => {
    const r = run({ hkdRate: 0, usdRate: 0 })
    expect(r.hkdTotal).toBeCloseTo(100000, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(99534.84222868, 8)
    expect(r.difference).toBeCloseTo(-465.15777132, 8)
    expect(r.usdWins).toBe(false)
    expect(r.breakEvenIterate).toBeNull()
    expect(r.totalDays).toBe(92)
  })

  it('returns 0 for zero principal', () => {
    const r = run({ initialPrincipal: 0 })
    expect(r.hkdTotal).toBe(0)
    expect(r.usdTotalInHkd).toBe(0)
    expect(r.difference).toBe(0)
    expect(r.usdWins).toBe(true)
    expect(r.breakEvenIterate).toBeNull()
    expect(r.totalDays).toBe(92)
  })
})
