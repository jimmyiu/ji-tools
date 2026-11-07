import { addDays, differenceInDays, parseISO } from 'date-fns'
import Decimal from 'decimal.js'
import { calculateSimpleInterest, DAY_BASE_MAP, type Currency } from './calculator'
import type { PhaseState } from './phases'

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

interface PhaseAllocation {
  index: number
  startDate: string
  endDate: string
  days: number
  duration: number
}

interface AllocationResult {
  phases: PhaseAllocation[]
  totalDays: number
  totalDuration: number
}

// Allocates calendar days to marathon phases. Internal to the schedule: callers
// read the composed result from `computeMarathonSavings`.
//
// `duration` is the phase's full calendar span (end - start + 1, min 1) and is
// used for timeline sizing. `days` is only the part inside the deposit window:
// max(deposit, clampedStart) through end, inclusive, or 0 when the window ends
// before the phase starts. A blank date yields 0 days / 0 duration and does not
// advance the running end. `clampedStart` is the overlap guard, so no calendar
// day is ever counted twice.
function allocatePhaseDays(phases: readonly PhaseState[], depositDate: string): AllocationResult {
  const deposit = parseISO(depositDate)
  const out: PhaseAllocation[] = []
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
  index: number
  startDate: string
  endDate: string
  days: number
  duration: number
  // Percentage where this phase's timeline band starts.
  position: number
  // Percentage width of this phase's timeline band. Bands tile, so widths sum
  // to 100% and the final band ends at 100% whenever any duration exists.
  width: number
  hkdRate: number
  usdRate: number
  rate: number
  interest: number
}

export interface MarathonSavingsResult {
  hkdActualRate: number
  usdActualRate: number
  phaseResults: PhaseResult[]
  totalDays: number
  totalDuration: number
  totalInterest: number
}

// The schedule interface: the single public entry point for phase days,
// durations, timeline positions, rates, and interest.
//
// Composes the day allocation into money: per-phase interest at the selected
// currency's rate, weighted actual rates per currency, and the total.
// Blank/non-numeric rates are coerced to 0 so NaN never escapes.
export function computeMarathonSavings(
  phases: readonly PhaseState[],
  depositDate: string,
  principal: number,
  currency: Currency,
): MarathonSavingsResult {
  const allocation = allocatePhaseDays(phases, depositDate)
  const { totalDays, totalDuration } = allocation

  let weightedHKD = 0
  let weightedUSD = 0
  for (let i = 0; i < phases.length; i++) {
    weightedHKD += allocation.phases[i].days * (Number(phases[i].hkdRate) || 0)
    weightedUSD += allocation.phases[i].days * (Number(phases[i].usdRate) || 0)
  }

  const hkdActualRate = totalDays === 0 ? 0 : weightedHKD / totalDays
  const usdActualRate = totalDays === 0 ? 0 : weightedUSD / totalDays

  const percentage = (value: number) => (totalDuration === 0 ? 0 : (value / totalDuration) * 100)

  const phaseResults: PhaseResult[] = []
  let elapsedDuration = 0
  for (let i = 0; i < phases.length; i++) {
    const p = phases[i]
    const { days, duration } = allocation.phases[i]
    const hkdRate = Number(p.hkdRate) || 0
    const usdRate = Number(p.usdRate) || 0
    const rate = currency === 'HKD' ? hkdRate : usdRate
    const interest = calculateSimpleInterest(
      new Decimal(principal),
      new Decimal(rate).div(100),
      days,
      DAY_BASE_MAP[currency],
    ).toNumber()
    phaseResults.push({
      index: i,
      startDate: p.startDate,
      endDate: p.endDate,
      days,
      duration,
      position: percentage(elapsedDuration),
      width: percentage(duration),
      hkdRate,
      usdRate,
      rate,
      interest,
    })
    elapsedDuration += duration
  }

  const totalInterest = phaseResults.reduce((sum, r) => sum + r.interest, 0)

  return {
    hkdActualRate,
    usdActualRate,
    phaseResults,
    totalDays,
    totalDuration,
    totalInterest,
  }
}
