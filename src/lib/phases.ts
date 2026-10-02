import { addDays, format, isBefore, parseISO } from 'date-fns'

export interface PhaseState {
  startDate: string
  endDate: string
  hkdRate: string | number
  usdRate: string | number
}

export type PhaseIndex = 0 | 1 | 2
export type Phases = [PhaseState, PhaseState, PhaseState]

function nextDay(date: string): string {
  return format(addDays(parseISO(date), 1), 'yyyy-MM-dd')
}

function prevDay(date: string): string {
  return format(addDays(parseISO(date), -1), 'yyyy-MM-dd')
}

function isBlank(v: string): boolean {
  return v === ''
}

// An end date is invalid only when both dates are present and end < start.
function isEndInvalid(start: string, end: string): boolean {
  return !isBlank(start) && !isBlank(end) && isBefore(parseISO(end), parseISO(start))
}

function clone(phases: Phases): Phases {
  return phases.map((p) => ({ ...p })) as Phases
}

// Owns the contiguity invariant:
// - phases are always contiguous: start(i+1) = end(i) + 1 day
// - any end date earlier than its own start date is unset to ''
// - an empty end date cascades: the next start becomes '' (later end dates stay)
// Runs to a fixed point because clearing an end can make a derived start move.
function normalize(input: Phases): Phases {
  const out = clone(input)
  let changed = true
  let guard = 0
  while (changed && guard < 4) {
    changed = false
    guard += 1
    for (let i = 0; i < 3; i++) {
      if (isEndInvalid(out[i].startDate, out[i].endDate)) {
        out[i].endDate = ''
        changed = true
      }
    }
    for (let i = 0; i < 2; i++) {
      const derived = isBlank(out[i].endDate) ? '' : nextDay(out[i].endDate)
      if (out[i + 1].startDate !== derived) {
        out[i + 1].startDate = derived
        changed = true
      }
    }
  }
  return out
}

// Edit phase 0 start: phase 0 end is not moved (other phases unchanged).
// Edit phase i>0 start: previous phase end becomes start - 1 day.
export function applyPhaseStartDate(phases: Phases, index: PhaseIndex, value: string): Phases {
  const out = clone(phases)
  if (index === 0) {
    out[0].startDate = value
  } else if (isBlank(value)) {
    // Derived empty start carries no information; no-op.
    return out
  } else {
    out[index - 1].endDate = prevDay(value)
  }
  return normalize(out)
}

// Edit phase i end: next phase start follows to end + 1 day.
// No ripple to other end dates; phase lengths are not preserved.
export function applyPhaseEndDate(phases: Phases, index: PhaseIndex, value: string): Phases {
  const out = clone(phases)
  out[index].endDate = value
  return normalize(out)
}
