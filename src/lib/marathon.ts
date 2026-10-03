import { addDays, differenceInDays, parseISO } from 'date-fns'
import type { PhaseState } from './phases'

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
    if (p.startDate === '' || p.endDate === '') {
      out.push({ index: i, startDate: p.startDate, endDate: p.endDate, days: 0, duration: 0 })
      continue
    }

    const start = parseISO(p.startDate)
    const end = parseISO(p.endDate)
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
