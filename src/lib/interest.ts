import Decimal from 'decimal.js'

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

export function calculateCompoundDayBased(
  principal: Decimal,
  annualRate: Decimal,
  dayCounts: number[],
  dayBase: number,
): Decimal {
  let current = principal
  for (let i = 0; i < dayCounts.length; i++) {
    const interest = calculateSimpleInterest(current, annualRate, dayCounts[i], dayBase)
    current = current.plus(interest)
  }
  return current
}
