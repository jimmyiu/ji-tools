import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { calculateSimpleInterest, DAY_BASE_MAP } from './interest'

describe('DAY_BASE_MAP', () => {
  it('HKD uses 365 days', () => {
    expect(DAY_BASE_MAP.HKD).toBe(365)
  })

  it('USD uses 360 days', () => {
    expect(DAY_BASE_MAP.USD).toBe(360)
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
  ] as const

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

  it('returns 0 for zero principal', () => {
    const result = calculateSimpleInterest(new Decimal(0), new Decimal(0.023), 365, 365)
    expect(result.toNumber()).toBe(0)
  })

  it('returns 0 for zero annual rate', () => {
    const result = calculateSimpleInterest(new Decimal(100000), new Decimal(0), 365, 365)
    expect(result.toNumber()).toBe(0)
  })

  it('returns 0 for zero days', () => {
    const result = calculateSimpleInterest(new Decimal(100000), new Decimal(0.023), 0, 365)
    expect(result.toNumber()).toBe(0)
  })
})
