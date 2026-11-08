import { addMonths, subDays, addDays, differenceInDays, parseISO, isLastDayOfMonth, getDate } from 'date-fns'
import Decimal from 'decimal.js'
import { calculateSimpleInterest, DAY_BASE_MAP } from './calculator'

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

// Chained simple-interest compounding: each span's interest is added to the
// principal before the next span earns. Moved here from calculator.ts, whose
// exports are shared with marathon.ts only.
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

// Comparing an HKD term deposit against a USD term deposit that is bought at
// the bank's sell rate and sold back at the buy rate, rolled over (滾存) a fixed
// number of times. The comparison answers three questions: which deposit nets
// more HKD, by how much, and if HKD wins, how many rollovers it takes for USD
// to catch up (the break-even rollover count).
export interface FxDepositInput {
  startDate: string
  depositMonths: number
  rolloverCount: number
  principal: number // HKD
  hkdRate: number // annual %
  usdRate: number // annual %
  bankSellRate: number // HKD per USD, HKD → USD
  bankBuyRate: number // HKD per USD, USD → HKD
}

export interface FxDepositComparison {
  hkdTotal: number
  hkdInterest: number
  usdTotalInHkd: number
  usdInterestInHkd: number
  difference: number
  usdWins: boolean
  // The rollover count at which the USD deposit's HKD-equivalent total first
  // reaches or exceeds the HKD deposit's total; absent while USD already wins
  // or when no rollover count within the search bound can catch up.
  breakEven: { rolloverCount: number; days: number; months: number } | null
  depositWindow: { startDate: Date; endDate: Date; totalDays: number }
}

interface DepositPeriod {
  startDate: Date
  endDate: Date
}

function periodLength(period: DepositPeriod): number {
  return differenceInDays(period.endDate, period.startDate) + 1
}

// A rollover's end date keeps the same day-of-month where the target month has
// one; otherwise it clamps to the last day of the target month.
function periodEndDate(startDate: Date, depositMonths: number): Date {
  const targetDate = addMonths(startDate, depositMonths)
  if (getDate(targetDate) === getDate(startDate)) {
    if (isLastDayOfMonth(targetDate)) {
      return targetDate
    }
    return subDays(targetDate, 1)
  }
  return targetDate
}

// Internal to the comparison: one DepositPeriod per rollover, end-to-start
// contiguous, so calendar days are counted exactly once across the window.
function depositWindows(startDate: Date, depositMonths: number, rolloverCount: number): DepositPeriod[] {
  const periods: DepositPeriod[] = []
  let currentStart = startDate
  for (let i = 0; i < rolloverCount; i++) {
    const endDate = periodEndDate(currentStart, depositMonths)
    periods.push({ startDate: currentStart, endDate })
    currentStart = addDays(endDate, 1)
  }
  return periods
}

// The comparison interface: the single public entry point for FX deposit
// comparison totals, the net difference, the break-even rollover count, and
// the deposit window. Callers format the deposit window dates for display.
export function compareFxDeposit(input: FxDepositInput): FxDepositComparison {
  const startDate = parseISO(input.startDate)
  // Coercion and blank-field defaults live at the adapter (useCalculator);
  // this interface receives clean numbers.
  const { depositMonths, rolloverCount, principal, hkdRate, usdRate } = input
  const sellRate = input.bankSellRate
  const buyRate = input.bankBuyRate

  const windows = depositWindows(startDate, depositMonths, rolloverCount)
  const dayCounts = windows.map(periodLength)

  const p = new Decimal(principal)
  const rH = new Decimal(hkdRate).div(100)
  const rU = new Decimal(usdRate).div(100)

  const hkdTotal = calculateCompoundDayBased(p, rH, dayCounts, DAY_BASE_MAP.HKD)
  const usdPrincipal = p.div(sellRate)
  const usdTotalInUsd = calculateCompoundDayBased(usdPrincipal, rU, dayCounts, DAY_BASE_MAP.USD)
  const usdTotalInHkd = usdTotalInUsd.times(buyRate)
  const difference = usdTotalInHkd.minus(hkdTotal)
  const usdWins = difference.gte(0)

  let breakEven: FxDepositComparison['breakEven'] = null
  if (!usdWins) {
    // Search horizon: 1200 months of deposit window per spec — no rollover
    // count cap. A non-positive term has no permitted rollovers to search.
    const maxRolloverCount = depositMonths > 0 ? Math.ceil(1200 / depositMonths) : 0
    const allWindows = depositWindows(startDate, depositMonths, maxRolloverCount)
    const allDayCounts = allWindows.map(periodLength)
    for (let n = 1; n <= maxRolloverCount; n++) {
      const testDayCounts = allDayCounts.slice(0, n)
      const testHkd = calculateCompoundDayBased(p, rH, testDayCounts, DAY_BASE_MAP.HKD)
      const testUsd = calculateCompoundDayBased(usdPrincipal, rU, testDayCounts, DAY_BASE_MAP.USD).times(buyRate)
      if (testUsd.gte(testHkd)) {
        breakEven = {
          rolloverCount: n,
          days: testDayCounts.reduce((sum, d) => sum + d, 0),
          months: n * depositMonths,
        } satisfies FxDepositComparison['breakEven']
        break
      }
    }
  }

  return {
    hkdTotal: hkdTotal.toNumber(),
    hkdInterest: hkdTotal.minus(principal).toNumber(),
    usdTotalInHkd: usdTotalInHkd.toNumber(),
    usdInterestInHkd: usdTotalInHkd.minus(principal).toNumber(),
    difference: difference.toNumber(),
    usdWins,
    breakEven,
    depositWindow: {
      startDate: windows[0].startDate,
      endDate: windows[windows.length - 1].endDate,
      totalDays: dayCounts.reduce((sum, d) => sum + d, 0),
    },
  }
}
