import { describe, it, expect } from 'vitest'
import { startOfDay, addDays } from 'date-fns'
import Decimal from 'decimal.js'
import { calculateCompoundDayBased, compareFxDeposit } from './fxDeposit'

describe('compareFxDeposit', () => {
  const defaults = {
    startDate: '2025-05-12',
    depositMonths: 3,
    rolloverCount: 1,
    principal: 100000,
    hkdRate: 2.25,
    usdRate: 3.2,
    bankSellRate: 7.8468,
    bankBuyRate: 7.8103,
  }

  function run(overrides: Partial<typeof defaults>) {
    return compareFxDeposit({ ...defaults, ...overrides })
  }

  it.each([
    { name: 'default inputs (HKD wins, break-even triggered)', overrides: {}, expected: {
      hkdTotal: 100567.12328767, hkdInterest: 567.12328767,
      usdTotalInHkd: 100348.81604957, usdInterestInHkd: 348.81604957,
      difference: -218.30723810,
      usdWins: false,
      breakEven: { rolloverCount: 2, days: 184, months: 6 },
    } },
    { name: 'rolloverCount=2 (USD wins, no break-even)', overrides: { rolloverCount: 2 }, expected: {
      hkdTotal: 101137.46286358, hkdInterest: 1137.46286358,
      usdTotalInHkd: 101169.44636749, usdInterestInHkd: 1169.44636749,
      difference: 31.98350391,
      usdWins: true,
      breakEven: null,
    } },
    { name: 'zero rates (FX spread alone burns money)', overrides: { hkdRate: 0, usdRate: 0 }, expected: {
      hkdTotal: 100000, hkdInterest: 0,
      usdTotalInHkd: 99534.84222868, usdInterestInHkd: -465.15777132,
      difference: -465.15777132,
      usdWins: false,
      breakEven: null,
    } },
    { name: 'zero principal (equal totals, USD wins, no break-even)', overrides: { principal: 0 }, expected: {
      hkdTotal: 0, hkdInterest: 0,
      usdTotalInHkd: 0, usdInterestInHkd: 0,
      difference: 0,
      usdWins: true,
      breakEven: null,
    } },
  ])('$name', ({ overrides, expected }) => {
    const r = run(overrides)
    expect(r.hkdTotal).toBeCloseTo(expected.hkdTotal, 8)
    expect(r.hkdInterest).toBeCloseTo(expected.hkdInterest, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(expected.usdTotalInHkd, 8)
    expect(r.usdInterestInHkd).toBeCloseTo(expected.usdInterestInHkd, 8)
    expect(r.difference).toBeCloseTo(expected.difference, 8)
    expect(r.usdWins).toBe(expected.usdWins)
    expect(r.breakEven).toEqual(expected.breakEven)
  })

  it('covers the deposit window: single rollover, 3 months from 12-May-2025', () => {
    const r = run({})
    expect(startOfDay(r.depositWindow.startDate)).toEqual(startOfDay(new Date(2025, 4, 12)))
    expect(startOfDay(r.depositWindow.endDate)).toEqual(startOfDay(new Date(2025, 7, 11)))
    expect(r.depositWindow.totalDays).toBe(92)
  })

  it('clamps the window end when a month has no matching day (31-Jan + 1 month)', () => {
    const r = run({ startDate: '2026-01-31', depositMonths: 1, rolloverCount: 2 })
    expect(startOfDay(r.depositWindow.endDate)).toEqual(startOfDay(new Date(2026, 2, 31)))
    expect(r.depositWindow.totalDays).toBe(60)
  })

  it('chains rollovers contiguously across a leap day (29-Feb-2028 x2)', () => {
    const r = run({ startDate: '2028-02-29', depositMonths: 1, rolloverCount: 2 })
    expect(startOfDay(r.depositWindow.endDate)).toEqual(startOfDay(new Date(2028, 3, 28)))
    expect(r.depositWindow.totalDays).toBe(60)
    expect(r.depositWindow.endDate.getTime()).toBe(addDays(r.depositWindow.startDate, 59).getTime())
  })

  it('window end matches a single term of depositMonths * rolloverCount', () => {
    const chained = compareFxDeposit({ ...defaults, depositMonths: 1, rolloverCount: 3 })
    const single = compareFxDeposit({ ...defaults, depositMonths: 3, rolloverCount: 1 })
    expect(startOfDay(chained.depositWindow.endDate)).toEqual(startOfDay(single.depositWindow.endDate))
  })

  it('clamps each 12-month boundary through a long window (15-Jun-2026 + 1 year x2)', () => {
    const r = run({ startDate: '2026-06-15', depositMonths: 12, rolloverCount: 2 })
    expect(startOfDay(r.depositWindow.endDate)).toEqual(startOfDay(new Date(2028, 5, 14)))
    expect(r.depositWindow.totalDays).toBe(731)
  })

  it('compounds per rollover: chained 12x1m earns more than one 12m span of the same window', () => {
    const chained = run({ depositMonths: 1, rolloverCount: 12 })
    const single = run({ depositMonths: 12, rolloverCount: 1 })
    expect(chained.depositWindow.endDate).toEqual(single.depositWindow.endDate)
    expect(chained.depositWindow.totalDays).toBe(365)
    expect(single.depositWindow.totalDays).toBe(365)
    expect(chained.hkdTotal).toBeCloseTo(102273.34703188, 8)
    expect(single.hkdTotal).toBeCloseTo(102250.00000000, 8)
    expect(chained.hkdTotal).toBeGreaterThan(single.hkdTotal)
  })

  it('clamps each month-end and compounds per clamped span (31-Jan + 1mo x2 vs one 2m span)', () => {
    const chained = run({ startDate: '2026-01-31', depositMonths: 1, rolloverCount: 2 })
    const single = run({ startDate: '2026-01-31', depositMonths: 2, rolloverCount: 1 })
    expect(chained.depositWindow.endDate).toEqual(single.depositWindow.endDate)
    expect(chained.depositWindow.totalDays).toBe(60)
    expect(single.depositWindow.totalDays).toBe(60)
    expect(chained.hkdTotal).toBeCloseTo(100370.20463032, 8)
    expect(single.hkdTotal).toBeCloseTo(100369.86301370, 8)
    expect(chained.hkdTotal).toBeGreaterThan(single.hkdTotal)
  })

  it('returns null when USD never reaches the HKD total within the search horizon', () => {
    // With equal sell/buy rates and a lower USD rate, USD can never catch up:
    // the search exhausts its 1200-month horizon and returns null.
    const r = run({ usdRate: 1.0, bankSellRate: 1, bankBuyRate: 1 })
    expect(r.usdWins).toBe(false)
    expect(r.breakEven).toBeNull()
  })

  it('searches breakEven to the full 1200-month horizon (1-month terms cross at rollover 170)', () => {
    const r = run({
      startDate: '2025-01-01',
      depositMonths: 1,
      hkdRate: 2.25,
      usdRate: 2.4,
      bankSellRate: 7.85,
      bankBuyRate: 7.65,
    })
    expect(r.usdWins).toBe(false)
    expect(r.breakEven).toEqual({ rolloverCount: 170, days: 5172, months: 170 })
  })
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
