import { describe, it, expect } from 'vitest'
import { startOfDay, addDays } from 'date-fns'
import { compareFxDeposit } from './fxDeposit'

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
      hkdTotal: 100567.12328767,
      usdTotalInHkd: 100348.81604957,
      difference: -218.30723810,
      usdWins: false,
      breakEven: { rolloverCount: 2, days: 184, months: 6 },
    } },
    { name: 'rolloverCount=2 (USD wins, no break-even)', overrides: { rolloverCount: 2 }, expected: {
      hkdTotal: 101137.46286358,
      usdTotalInHkd: 101169.44636749,
      difference: 31.98350391,
      usdWins: true,
      breakEven: null,
    } },
    { name: 'zero rates (FX spread alone burns money)', overrides: { hkdRate: 0, usdRate: 0 }, expected: {
      hkdTotal: 100000,
      usdTotalInHkd: 99534.84222868,
      difference: -465.15777132,
      usdWins: false,
      breakEven: null,
    } },
    { name: 'zero principal (equal totals, USD wins, no break-even)', overrides: { principal: 0 }, expected: {
      hkdTotal: 0,
      usdTotalInHkd: 0,
      difference: 0,
      usdWins: true,
      breakEven: null,
    } },
  ])('$name', ({ overrides, expected }) => {
    const r = run(overrides)
    expect(r.hkdTotal).toBeCloseTo(expected.hkdTotal, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(expected.usdTotalInHkd, 8)
    expect(r.difference).toBeCloseTo(expected.difference, 8)
    expect(r.usdWins).toBe(expected.usdWins)
    expect(r.breakEven).toEqual(expected.breakEven)
  })

  it('covers the deposit window: single rollover, 3 months from 12-May-2025', () => {
    const r = run({})
    expect(startOfDay(r.period.startDate)).toEqual(startOfDay(new Date(2025, 4, 12)))
    expect(startOfDay(r.period.endDate)).toEqual(startOfDay(new Date(2025, 7, 11)))
    expect(r.period.totalDays).toBe(92)
  })

  it('clamps the window end when a month has no matching day (31-Jan + 1 month)', () => {
    const r = run({ startDate: '2026-01-31', depositMonths: 1, rolloverCount: 2 })
    expect(startOfDay(r.period.endDate)).toEqual(startOfDay(new Date(2026, 2, 31)))
    expect(r.period.totalDays).toBe(60)
  })

  it('chains rollovers contiguously across a leap day (29-Feb-2028 x2)', () => {
    const r = run({ startDate: '2028-02-29', depositMonths: 1, rolloverCount: 2 })
    expect(startOfDay(r.period.endDate)).toEqual(startOfDay(new Date(2028, 3, 28)))
    expect(r.period.totalDays).toBe(60)
    expect(r.period.endDate.getTime()).toBe(addDays(r.period.startDate, 59).getTime())
  })

  it('window end matches a single term of depositMonths * rolloverCount', () => {
    const chained = compareFxDeposit({ ...defaults, depositMonths: 1, rolloverCount: 3 })
    const single = compareFxDeposit({ ...defaults, depositMonths: 3, rolloverCount: 1 })
    expect(startOfDay(chained.period.endDate)).toEqual(startOfDay(single.period.endDate))
  })

  it('clamps each 12-month boundary through a long window (15-Jun-2026 + 1 year x2)', () => {
    const r = run({ startDate: '2026-06-15', depositMonths: 12, rolloverCount: 2 })
    expect(startOfDay(r.period.endDate)).toEqual(startOfDay(new Date(2028, 5, 14)))
    expect(r.period.totalDays).toBe(731)
  })

  it('searches breakEven above the given rolloverCount, bounded at 1200 months', () => {
    // With equal sell/buy rates and a lower USD rate, the FX spread never closes:
    // the search exhausts its bounded window and returns null.
    const r = run({ usdRate: 1.0, bankSellRate: 1, bankBuyRate: 1 })
    expect(r.usdWins).toBe(false)
    expect(r.breakEven).toBeNull()
  })
})
