import Decimal from 'decimal.js'

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

export const DAY_BASE_MAP = {
  HKD: 365,
  USD: 360,
} as const

export type Currency = keyof typeof DAY_BASE_MAP

export function calculateSimpleInterest(
  principal: Decimal,
  annualRate: Decimal,
  days: number,
  dayBase: number,
): Decimal {
  return principal.times(annualRate).times(days).div(dayBase)
}
