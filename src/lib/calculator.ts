import { addMonths, subDays, addDays, differenceInDays, parseISO, isLastDayOfMonth, getDate } from 'date-fns'
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

export class PeriodInfo {
  readonly startDate: Date
  readonly endDate: Date

  constructor(startDate: Date, endDate: Date) {
    this.startDate = startDate
    this.endDate = endDate
  }

  get length(): number {
    return differenceInDays(this.endDate, this.startDate) + 1
  }
}

export function computeEndDate(startDate: Date, depositMonths: number): Date {
  const targetDate = addMonths(startDate, depositMonths)
  if (getDate(targetDate) === getDate(startDate)) {
    if (isLastDayOfMonth(targetDate)) {
      return targetDate
    }
    return subDays(targetDate, 1)
  }
  return targetDate
}

export function computePeriods(startDateStr: string, depositMonths: number, iterate: number): PeriodInfo[] {
  const periods: PeriodInfo[] = []
  let currentStart = parseISO(startDateStr)
  for (let i = 0; i < iterate; i++) {
    const endDate = computeEndDate(currentStart, depositMonths)
    periods.push(new PeriodInfo(currentStart, endDate))
    currentStart = addDays(endDate, 1)
  }
  return periods
}
