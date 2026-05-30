import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { startOfDay, addDays } from 'date-fns'
import {
  DAY_BASE_MAP,
  calculateSimpleInterest,
  calculateCompoundDayBased,
  PeriodInfo,
  computeEndDate,
  computePeriods,
} from './calculator'

describe('DAY_BASE_MAP', () => {
  it.each([
    { currency: 'HKD', expected: 365 },
    { currency: 'USD', expected: 360 },
  ] as const)('$currency day base is $expected', ({ currency, expected }) => {
    expect(DAY_BASE_MAP[currency]).toBe(expected)
  })
})

describe('calculateSimpleInterest', () => {
  const cases = [
    { principal: 100000, annualRate: 0.023, days: 1, dayBase: 365, expected: 6.30136986 },
    { principal: 100000, annualRate: 0.023, days: 365, dayBase: 365, expected: 2300.00000000 },
    { principal: 100000, annualRate: 0.023, days: 730, dayBase: 365, expected: 4600.00000000 },
    { principal: 100000, annualRate: 0.023, days: 999, dayBase: 365, expected: 6295.06849315 },
    { principal: 9123.4567, annualRate: 0.0225, days: 92, dayBase: 365, expected: 51.74124759 },
    { principal: 100000, annualRate: 0.033, days: 1, dayBase: 360, expected: 9.16666667 },
    { principal: 100000, annualRate: 0.033, days: 360, dayBase: 360, expected: 3300.00000000 },
    { principal: 100000, annualRate: 0.033, days: 365, dayBase: 360, expected: 3345.83333333 },
    { principal: 9123.4567, annualRate: 0.0333, days: 92, dayBase: 360, expected: 77.64061652 },
    { principal: 0, annualRate: 0.023, days: 365, dayBase: 365, expected: 0 },
    { principal: 100000, annualRate: 0, days: 365, dayBase: 365, expected: 0 },
    { principal: 100000, annualRate: 0.023, days: 0, dayBase: 365, expected: 0 },
  ]

  it.each(cases)(
    '$principal @ $annualRate for $days days (dayBase=$dayBase) → $expected',
    ({ principal, annualRate, days, dayBase, expected }) => {
      const result = calculateSimpleInterest(
        new Decimal(principal),
        new Decimal(annualRate),
        days,
        dayBase,
      )
      expect(result.toNumber()).toBeCloseTo(expected, 8)
    },
  )
})

describe('calculateCompoundDayBased', () => {
  const cases = [
    { principal: 100000, annualRate: 0.023, dayCounts: [1], dayBase: 365, expected: 100006.30136986 },
    { principal: 100000, annualRate: 0.0365, dayCounts: [365], dayBase: 365, expected: 103650.00 },
    { principal: 100000, annualRate: 0.0365, dayCounts: [365], dayBase: 360, expected: 103700.69444444 },
    { principal: 9123.4567, annualRate: 0.0225, dayCounts: [31, 28, 31], dayBase: 365, expected: 9174.16669710 },
    { principal: 9123.4567, annualRate: 0.0225, dayCounts: [31, 28, 31], dayBase: 360, expected: 9174.87232091 },
    { principal: 100000, annualRate: 0.0225, dayCounts: [183, 182], dayBase: 365, expected: 102262.65615500 },
    { principal: 100000, annualRate: 0.0225, dayCounts: [183, 182], dayBase: 360, expected: 102294.26015625 },
    { principal: 100000, annualRate: 0.03, dayCounts: [31, 30, 31], dayBase: 365, expected: 100758.07170774 },
    { principal: 100000, annualRate: 0.1, dayCounts: [1, 1, 1, 1, 1], dayBase: 365, expected: 100137.06138292 },
    { principal: 0, annualRate: 0.05, dayCounts: [365], dayBase: 365, expected: 0 },
    { principal: 100000, annualRate: 0, dayCounts: [365], dayBase: 365, expected: 100000 },
    { principal: 100000, annualRate: 0.05, dayCounts: [], dayBase: 365, expected: 100000 },
  ]

  it.each(cases)(
    '$principal @ $annualRate for [$dayCounts] days (base=$dayBase) → $expected',
    ({ principal, annualRate, dayCounts, dayBase, expected }) => {
      const result = calculateCompoundDayBased(
        new Decimal(principal),
        new Decimal(annualRate),
        dayCounts,
        dayBase,
      )
      expect(result.toNumber()).toBeCloseTo(expected, 8)
    },
  )
})

describe('PeriodInfo', () => {
  it.each([
    { start: new Date(2025, 4, 12), end: new Date(2025, 4, 12), expectedLength: 1 },
    { start: new Date(2025, 4, 12), end: new Date(2025, 5, 11), expectedLength: 31 },
    { start: new Date(2026, 0, 31), end: new Date(2026, 1, 28), expectedLength: 29 },
    { start: new Date(2025, 4, 12), end: new Date(2025, 7, 11), expectedLength: 92 },
  ])('length from $start to $end is $expectedLength', ({ start, end, expectedLength }) => {
    const period = new PeriodInfo(start, end)
    expect(period.length).toBe(expectedLength)
  })
})

describe('computeEndDate', () => {
  it.each([
    { start: new Date(2025, 4, 12), months: 1, expected: new Date(2025, 5, 11) },
    { start: new Date(2026, 0, 31), months: 1, expected: new Date(2026, 1, 28) },
    { start: new Date(2025, 4, 12), months: 3, expected: new Date(2025, 7, 11) },
    { start: new Date(2026, 0, 31), months: 3, expected: new Date(2026, 3, 30) },
    { start: new Date(2028, 1, 29), months: 1, expected: new Date(2028, 2, 28) },
    { start: new Date(2028, 1, 29), months: 2, expected: new Date(2028, 3, 28) },
    { start: new Date(2026, 2, 31), months: 1, expected: new Date(2026, 3, 30) },
    { start: new Date(2026, 0, 15), months: 12, expected: new Date(2027, 0, 14) },
  ])('$start + $months months = $expected', ({ start, months, expected }) => {
    const result = computeEndDate(start, months)
    expect(startOfDay(result)).toEqual(startOfDay(expected))
  })
})

describe('computePeriods', () => {
  const cases = [
    {
      name: 'single period no clamp',
      startDateStr: '2025-05-12',
      depositMonths: 1,
      iterate: 1,
      expected: [{ start: '2025-05-12', end: '2025-06-11', length: 31 }],
    },
    {
      name: 'single period with clamp',
      startDateStr: '2026-01-31',
      depositMonths: 1,
      iterate: 1,
      expected: [{ start: '2026-01-31', end: '2026-02-28', length: 29 }],
    },
    {
      name: '2-May-2026 e2e',
      startDateStr: '2026-05-02',
      depositMonths: 1,
      iterate: 1,
      expected: [{ start: '2026-05-02', end: '2026-06-01', length: 31 }],
    },
    {
      name: '29-Feb-2028 e2e',
      startDateStr: '2028-02-29',
      depositMonths: 1,
      iterate: 1,
      expected: [{ start: '2028-02-29', end: '2028-03-28', length: 29 }],
    },
    {
      name: 'chaining 1mo x2',
      startDateStr: '2025-05-12',
      depositMonths: 1,
      iterate: 2,
      expected: [
        { start: '2025-05-12', end: '2025-06-11', length: 31 },
        { start: '2025-06-12', end: '2025-07-11', length: 30 },
      ],
    },
    {
      name: 'clamped chaining 31-Jan x2',
      startDateStr: '2026-01-31',
      depositMonths: 1,
      iterate: 2,
      expected: [
        { start: '2026-01-31', end: '2026-02-28', length: 29 },
        { start: '2026-03-01', end: '2026-03-31', length: 31 },
      ],
    },
    {
      name: '3-month periods iterate=2',
      startDateStr: '2025-05-12',
      depositMonths: 3,
      iterate: 2,
      expected: [
        { start: '2025-05-12', end: '2025-08-11', length: 92 },
        { start: '2025-08-12', end: '2025-11-11', length: 92 },
      ],
    },
    {
      name: 'leap year 29-Feb x2',
      startDateStr: '2028-02-29',
      depositMonths: 1,
      iterate: 2,
      expected: [
        { start: '2028-02-29', end: '2028-03-28', length: 29 },
        { start: '2028-03-29', end: '2028-04-28', length: 31 },
      ],
    },
    {
      name: 'leap year 29-Feb x3',
      startDateStr: '2028-02-29',
      depositMonths: 1,
      iterate: 3,
      expected: [
        { start: '2028-02-29', end: '2028-03-28', length: 29 },
        { start: '2028-03-29', end: '2028-04-28', length: 31 },
        { start: '2028-04-29', end: '2028-05-28', length: 30 },
      ],
    },
    {
      name: 'iterate=3 contiguous non-overlap',
      startDateStr: '2026-01-15',
      depositMonths: 2,
      iterate: 3,
      expected: [
        { start: '2026-01-15', end: '2026-03-14', length: 59 },
        { start: '2026-03-15', end: '2026-05-14', length: 61 },
        { start: '2026-05-15', end: '2026-07-14', length: 61 },
      ],
    },
  ]

  it.each(cases)('$name', ({ startDateStr, depositMonths, iterate, expected }) => {
    const periods = computePeriods(startDateStr, depositMonths, iterate)
    expect(periods).toHaveLength(expected.length)
    periods.forEach((p, i) => {
      expect(startOfDay(p.startDate)).toEqual(startOfDay(new Date(expected[i].start)))
      expect(startOfDay(p.endDate)).toEqual(startOfDay(new Date(expected[i].end)))
      expect(p.length).toBe(expected[i].length)
    })
    if (iterate > 1) {
      for (let i = 1; i < periods.length; i++) {
        expect(startOfDay(periods[i].startDate)).toEqual(
          startOfDay(addDays(periods[i - 1].endDate, 1)),
        )
      }
    }
    const totalLength = periods.reduce((sum, p) => sum + p.length, 0)
    const sumLengths = expected.reduce((sum, e) => sum + e.length, 0)
    expect(totalLength).toBe(sumLengths)
  })

  it('last period end matches computeEndDate(start, depositMonths * iterate)', () => {
    const periods = computePeriods('2025-05-12', 1, 3)
    const overallEnd = computeEndDate(new Date(2025, 4, 12), 3)
    expect(startOfDay(periods[periods.length - 1].endDate)).toEqual(startOfDay(overallEnd))
  })
})
