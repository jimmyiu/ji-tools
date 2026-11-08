import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { DAY_BASE_MAP, calculateSimpleInterest } from './calculator'

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
