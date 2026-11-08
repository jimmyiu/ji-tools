import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import {
  DAY_BASE_MAP,
  calculateSimpleInterest,
  calculateCompoundDayBased,
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
