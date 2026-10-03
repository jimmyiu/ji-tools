import { addDays, differenceInDays, parseISO } from 'date-fns'
import Decimal from 'decimal.js'
import { calculateSimpleInterest, DAY_BASE_MAP, type Currency } from './calculator'
import type { PhaseState } from './phases'

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

export interface PhaseDays {
  index: number
  startDate: string
  endDate: string
  days: number
  duration: number
}

export interface PhaseDaysResult {
  phases: PhaseDays[]
  totalDays: number
  totalDuration: number
}

// Allocates calendar days to marathon phases.
//
// `duration` is the phase's full calendar span (end - start + 1, min 1) and is
// used for timeline sizing. `days` is only the part inside the deposit window:
// max(deposit, clampedStart) through end, inclusive, or 0 when the window ends
// before the phase starts. A blank date yields 0 days / 0 duration and does not
// advance the running end. `clampedStart` is the overlap guard, so no calendar
// day is ever counted twice.
export function computePhaseDays(
  phases: readonly PhaseState[],
  depositDate: string,
): PhaseDaysResult {
  const deposit = parseISO(depositDate)
  const out: PhaseDays[] = []
  let previousEffectiveEnd: Date | null = null
  let totalDays = 0
  let totalDuration = 0

  for (let i = 0; i < phases.length; i++) {
    const p = phases[i]
    const start = parseISO(p.startDate)
    const end = parseISO(p.endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      out.push({ index: i, startDate: p.startDate, endDate: p.endDate, days: 0, duration: 0 })
      continue
    }
    const clampedStart =
      previousEffectiveEnd !== null && start <= previousEffectiveEnd
        ? addDays(previousEffectiveEnd, 1)
        : start
    const effectiveStart = deposit > clampedStart ? deposit : clampedStart
    const days = effectiveStart > end ? 0 : differenceInDays(end, effectiveStart) + 1
    const duration = Math.max(differenceInDays(end, start) + 1, 1)

    out.push({ index: i, startDate: p.startDate, endDate: p.endDate, days, duration })
    totalDays += days
    totalDuration += duration

    if (days > 0) previousEffectiveEnd = end
  }

  return { phases: out, totalDays, totalDuration }
}

export interface PhaseResult {
  days: number
  rate: number
  interest: number
}

export interface MarathonSavingsResult {
  hkdActualRate: number
  usdActualRate: number
  phaseResults: PhaseResult[]
  totalDays: number
  totalInterest: number
}

// Composes the day allocation into money: per-phase interest at the selected
// currency's rate, weighted actual rates per currency, and the total.
// Blank/non-numeric rates are coerced to 0 so NaN never escapes.
export function computeMarathonSavings(
  phases: readonly PhaseState[],
  depositDate: string,
  principal: number,
  currency: Currency,
): MarathonSavingsResult {
  const { phases: allocation, totalDays } = computePhaseDays(phases, depositDate)

  let weightedHKD = 0
  let weightedUSD = 0
  for (let i = 0; i < phases.length; i++) {
    weightedHKD += allocation[i].days * (Number(phases[i].hkdRate) || 0)
    weightedUSD += allocation[i].days * (Number(phases[i].usdRate) || 0)
  }

  const hkdActualRate = totalDays === 0 ? 0 : weightedHKD / totalDays
  const usdActualRate = totalDays === 0 ? 0 : weightedUSD / totalDays

  const phaseResults: PhaseResult[] = phases.map((p, i) => {
    const rate = currency === 'HKD' ? Number(p.hkdRate) || 0 : Number(p.usdRate) || 0
    const interest = calculateSimpleInterest(
      new Decimal(principal),
      new Decimal(rate).div(100),
      allocation[i].days,
      DAY_BASE_MAP[currency],
    ).toNumber()
    return { days: allocation[i].days, rate, interest }
  })

  const totalInterest = phaseResults.reduce((sum, r) => sum + r.interest, 0)

  return { hkdActualRate, usdActualRate, phaseResults, totalDays, totalInterest }
}
