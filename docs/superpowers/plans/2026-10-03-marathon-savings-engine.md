# Marathon Savings Engine Implementation Plan

**Status:** Completed.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the Marathon savings calculation into one deep pure module in `src/lib/` so the hook and the timeline become thin adapters with the duplicated day-allocation fold deleted.

**Architecture:** `src/lib/marathon.ts` owns two pure functions — `computePhaseDays` (which calendar days belong to which phase) and `computeMarathonSavings` (per-phase interest, weighted actual rates, totals). The hook `useMarathonSavings.useCalculator` and `PhaseRateTimeline` both call these and keep only React/memo and presentation. Domain types move to `src/lib/` (`Currency` → `calculator.ts`, `PhaseState` → `phases.ts`, `PhaseResult` → `marathon.ts`).

**Tech Stack:** React 18 + TypeScript, Vite, Vitest + @testing-library/react, date-fns, decimal.js.

**Spec:** none — design approved in chat on 2026-10-03. The agreed contracts are summarized in §Design Summary below and are normative for this plan.

## Design Summary (approved in chat; the plan argues from this)

Two pure functions in `src/lib/marathon.ts`, both accepting `readonly PhaseState[]` (the hook's `Phases` tuple is assignable; no cast needed):

- `computePhaseDays(phases, depositDate)` → `PhaseDaysResult`. Per phase `{ index, startDate, endDate, days, duration }`:
  - `duration` = calendar span `end − start + 1` (min 1), for timeline flex-sizing only.
  - `days` = effective days inside the deposit window: `max(deposit, clampedStart)` to `end`, inclusive; `0` if the window ends before the phase starts.
  - `clampedStart` = `max(start, previousEffectiveEnd + 1)` — the overlap guard (no calendar day counted twice). Defensive-only: the edit form's contiguity invariant makes it a no-op for every reachable input.
  - Blank/invalid date (`startDate === ''` or `endDate === ''`) → `{ days: 0, duration: 0 }`, and the phase does **not** advance `previousEffectiveEnd`. `NaN` never escapes.
  - Output also has `totalDays` and `totalDuration`.
- `computeMarathonSavings(phases, depositDate, principal, currency)` → `MarathonSavingsResult`:
  - Calls `computePhaseDays`; never re-derives allocation.
  - `hkdActualRate` / `usdActualRate` = `Σ(daysᵢ·rateᵢ) / totalDays` per currency, `0` when `totalDays === 0`.
  - `phaseResults[i] = { days, rate, interest }`; `rate` is the currency's rate coerced with `Number(x) || 0`; `interest = calculateSimpleInterest(principal, rate/100, days, DAY_BASE_MAP[currency]).toNumber()` (40-digit precision via the existing `calculator.ts` primitive).
  - Output: `{ hkdActualRate, usdActualRate, phaseResults, totalDays, totalInterest }` — the hook's current return shape.

Cleanups folded in: hardcoded `for (i = 0; i < 3; i++)` becomes `phases.length`; `Currency` has a single definition in `src/lib/calculator.ts`; the hook stops defining/re-exporting domain types.

## Global Constraints

- Formulas and calculations live as pure functions in `src/lib/`; hooks compose them, never duplicate.
- `DAY_BASE_MAP` in `src/lib/calculator.ts` is the single source of truth for day bases (HKD 365, USD 360); `marathon.ts` imports it, does not redefine.
- Intermediate `Decimal` math at 40-digit precision (`Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })`).
- Assert calculation results with `toBeCloseTo(expected, 8)`.
- `Currency` has exactly one type definition, in `src/lib/calculator.ts`.
- No behavior change for any input the app can currently produce. The one intentional contract change: blank phase dates were previously `NaN` (and crashed the timeline's date labels); they are now pinned to `0` days.
- Scope guardrails: do NOT modify `src/lib/phases.ts`, `useInputs`/the nine-setter seam (candidate #2), the FX `src/hooks/useCalculator.ts`, or `src/lib/calculator.ts` behavior.
- Conventional Commit prefixes; these tasks use `refactor:`.

## Review Focus

The five input classes most likely to bite a person, which the spec's silence must not let break:

1. **Blank `startDate` or `endDate` in any phase** → `0` days, `0` duration, excluded from weighted rate and interest; no `NaN`, no crash in the timeline. — Tested in Task 1 (days) and Task 3 (money); the timeline crash is fixed and tested in Task 2.
2. **Overlapping phase ranges** → later phase clamps to the earlier phase's end + 1 day; no day counted twice. — Tested in Task 1.
3. **Blank or non-numeric rate (`''`, `'abc'`)** → coerced to `0`; no `NaN` in rates or interest. — Tested in Task 3.
4. **`principal` = 0** → all interest `0`, actual rates still computed. — Tested in Task 3.
5. **Empty phases array** → zero result, no crash. — Tested in Task 1 and Task 3.

---

### Task 1: `computePhaseDays` in `src/lib/marathon.ts`

**Files:**
- Create: `src/lib/marathon.ts`
- Create: `src/lib/marathon.test.ts`

**Interfaces:**
- Consumes: `PhaseState` from `src/lib/phases.ts` (already exists), `addDays`/`differenceInDays`/`parseISO` from date-fns.
- Produces: `computePhaseDays(phases: readonly PhaseState[], depositDate: string): PhaseDaysResult`, plus types `PhaseDays` and `PhaseDaysResult`, in `src/lib/marathon.ts`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/marathon.test.ts` with only the `computePhaseDays` cases (the `computeMarathonSavings` import/cases come in Task 3):

```ts
import { describe, it, expect } from 'vitest'
import { computePhaseDays } from './marathon'
import type { PhaseState } from './phases'

const defaultPhases: PhaseState[] = [
  { startDate: '2026-10-02', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3 },
  { startDate: '2026-12-01', endDate: '2027-01-03', hkdRate: 3.0, usdRate: 3.5 },
  { startDate: '2027-01-04', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
]

describe('computePhaseDays', () => {
  it('allocates full durations when deposit is on phase 1 start', () => {
    const r = computePhaseDays(defaultPhases, '2026-10-02')
    expect(r.phases.map((p) => p.days)).toEqual([60, 34, 29])
    expect(r.phases.map((p) => p.duration)).toEqual([60, 34, 29])
    expect(r.totalDays).toBe(123)
    expect(r.totalDuration).toBe(123)
  })

  it('clamps phase 1 to the deposit date when deposit is mid-phase', () => {
    const r = computePhaseDays(defaultPhases, '2026-10-15')
    expect(r.phases[0].days).toBe(47)
    expect(r.phases[1].days).toBe(34)
    expect(r.phases[2].days).toBe(29)
    expect(r.totalDays).toBe(110)
  })

  it('returns zero days when deposit is after all phases', () => {
    const r = computePhaseDays(defaultPhases, '2027-02-02')
    expect(r.totalDays).toBe(0)
    expect(r.phases.every((p) => p.days === 0)).toBe(true)
  })

  it('treats a blank date as 0 days and 0 duration', () => {
    const phases: PhaseState[] = [
      defaultPhases[0],
      { startDate: '2026-12-01', endDate: '', hkdRate: 3.0, usdRate: 3.5 },
      { startDate: '', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
    ]
    const r = computePhaseDays(phases, '2026-10-02')
    expect(r.phases[1]).toMatchObject({ days: 0, duration: 0 })
    expect(r.phases[2]).toMatchObject({ days: 0, duration: 0 })
    expect(r.totalDays).toBe(60)
    expect(r.totalDuration).toBe(60)
  })

  it('clamps an overlapping phase so no day is counted twice', () => {
    const phases: PhaseState[] = [
      { startDate: '2026-10-02', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3 },
      { startDate: '2026-11-20', endDate: '2026-12-10', hkdRate: 3.0, usdRate: 3.5 },
      { startDate: '2026-12-11', endDate: '2026-12-31', hkdRate: 3.2, usdRate: 3.6 },
    ]
    const r = computePhaseDays(phases, '2026-10-02')
    expect(r.phases.map((p) => p.days)).toEqual([60, 10, 21])
    expect(r.totalDays).toBe(91)
    expect(r.totalDuration).toBe(102)
  })

  it('returns an empty result for an empty phases array', () => {
    const r = computePhaseDays([], '2026-10-02')
    expect(r.phases).toEqual([])
    expect(r.totalDays).toBe(0)
    expect(r.totalDuration).toBe(0)
  })

  it('does not mutate its input', () => {
    const before = JSON.parse(JSON.stringify(defaultPhases))
    computePhaseDays(defaultPhases, '2026-10-02')
    expect(defaultPhases).toEqual(before)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- src/lib/marathon.test.ts`
Expected: FAIL — `computePhaseDays` is not exported from `src/lib/marathon.ts` (module does not exist).

- [ ] **Step 3: Implement `computePhaseDays` and its types in `src/lib/marathon.ts`**

Exact signatures:

```ts
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

export function computePhaseDays(phases: readonly PhaseState[], depositDate: string): PhaseDaysResult
```

Algorithm the tests do not determine (use it exactly):

```ts
const deposit = parseISO(depositDate)
let previousEffectiveEnd: Date | null = null
for each phase at index i:
  if (p.startDate === '' || p.endDate === ''):
    push { index: i, startDate: p.startDate, endDate: p.endDate, days: 0, duration: 0 }
    continue
  const start = parseISO(p.startDate), end = parseISO(p.endDate)
  const clampedStart =
    previousEffectiveEnd !== null && start <= previousEffectiveEnd
      ? addDays(previousEffectiveEnd, 1)
      : start
  const effectiveStart = deposit > clampedStart ? deposit : clampedStart
  const days = effectiveStart > end ? 0 : differenceInDays(end, effectiveStart) + 1
  const duration = Math.max(differenceInDays(end, start) + 1, 1)
  push { index: i, startDate: p.startDate, endDate: p.endDate, days, duration }
  if (days > 0) previousEffectiveEnd = end
return { phases: out, totalDays: sum(days), totalDuration: sum(duration) }
```

Note: `previousEffectiveEnd` updates to the phase's `end` when `days > 0` (cleaner than the old `effectiveEnd`; identical for every reachable input, correct for overlapping input).

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- src/lib/marathon.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/marathon.ts src/lib/marathon.test.ts
git commit -m "refactor: add computePhaseDays to lib/marathon"
```

---

### Task 2: Switch `PhaseRateTimeline` to `computePhaseDays`

**Files:**
- Modify: `src/components/PhaseRateTimeline.tsx`
- Test: `src/components/PhaseRateTimeline.test.tsx`

**Interfaces:**
- Consumes: `computePhaseDays` from `src/lib/marathon.ts` (Task 1).
- Produces: nothing new for later tasks; behavior-only change.

- [ ] **Step 1: Write the failing test**

Add to `src/components/PhaseRateTimeline.test.tsx` (file already imports `PhaseState` from `@/hooks/useMarathonSavings`; leave that import for Task 4):

```ts
it('omits date labels for blank phase boundaries', () => {
  const blankPhases: PhaseState[] = [
    { startDate: '2026-10-02', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3 },
    { startDate: '2026-12-01', endDate: '', hkdRate: 3.0, usdRate: 3.5 },
    { startDate: '', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
  ]
  render(<PhaseRateTimeline phases={blankPhases} depositDate="2026-10-02" currency="HKD" />)

  const labels = screen.getAllByText(/^[0-9]{2}-[A-Za-z]{3}$/)
  expect(labels.map((l) => l.textContent)).toEqual(['02-Oct', '01-Dec', '01-Feb'])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/PhaseRateTimeline.test.tsx`
Expected: FAIL — rendering throws (current code calls `fmtDateShort('')`, which is `format(parseISO(''), …)` → `RangeError`), and the day math is still the local `NaN`-producing fold.

- [ ] **Step 3: Replace the local fold with `computePhaseDays` + zip, and guard blank date labels**

In `src/components/PhaseRateTimeline.tsx`:

1. Import `computePhaseDays` from `@/lib/marathon`; drop the date-fns imports (`parseISO`, `differenceInDays`, `addDays` — nothing else in the file uses them).
2. Delete the local `effectiveDays` and `phaseDuration` functions.
3. In the `useMemo`, replace the `phases.reduce(...)` fold (the part computing `days`, `duration`, `previousEffectiveEnd`) with:

```ts
const { phases: allocation, totalDays, totalDuration } = computePhaseDays(phases, depositDate)
const data = phases.map((phase, i) => ({
  ...phase,
  days: allocation[i].days,
  duration: allocation[i].duration,
}))
```

Keep the existing cumulative `boundaries` accumulation and the `return { data, totalDays, totalDuration, boundaries }` exactly as they are (they now operate on `data` from the zip).
4. Guard the date labels: render a start-date `<span>` only when `phase.startDate !== ''`, and render the final end-date `<span>` only when the last phase's `endDate !== ''`. (The `fmtDateShort` calls are unchanged; only the conditions around them change.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- src/components/PhaseRateTimeline.test.tsx`
Expected: PASS — the 5 existing tests plus the new blank-boundary test; no assertion changes to the existing 5.

- [ ] **Step 5: Commit**

```bash
git add src/components/PhaseRateTimeline.tsx src/components/PhaseRateTimeline.test.tsx
git commit -m "refactor: use computePhaseDays in PhaseRateTimeline"
```

---

### Task 3: `computeMarathonSavings` in `src/lib/marathon.ts`

**Files:**
- Modify: `src/lib/marathon.ts`
- Modify: `src/lib/marathon.test.ts`

**Interfaces:**
- Consumes: `computePhaseDays` (Task 1); `calculateSimpleInterest`, `DAY_BASE_MAP`, `Currency` from `src/lib/calculator.ts` (all already exist).
- Produces: `computeMarathonSavings(phases: readonly PhaseState[], depositDate: string, principal: number, currency: Currency): MarathonSavingsResult`, plus types `PhaseResult` and `MarathonSavingsResult`.

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/marathon.test.ts` (import `computeMarathonSavings` alongside `computePhaseDays`):

```ts
describe('computeMarathonSavings', () => {
  it('matches current hook output for default inputs (HKD)', () => {
    const r = computeMarathonSavings(defaultPhases, '2026-10-02', 100000, 'HKD')
    expect(r.hkdActualRate).toBeCloseTo(2.9495934959349595, 8)
    expect(r.usdActualRate).toBeCloseTo(3.4260162601626014, 8)
    expect(r.totalDays).toBe(123)
    expect(r.totalInterest).toBeCloseTo(993.972602739726, 8)
    expect(r.phaseResults).toHaveLength(3)
    expect(r.phaseResults[0].days).toBe(60)
    expect(r.phaseResults[0].rate).toBe(2.8)
    expect(r.phaseResults[0].interest).toBeCloseTo(460.2739726027397, 8)
    expect(r.phaseResults[1].interest).toBeCloseTo(279.45205479452056, 8)
    expect(r.phaseResults[2].interest).toBeCloseTo(254.24657534246575, 8)
  })

  it('uses USD rates and 360-day base when currency is USD', () => {
    const r = computeMarathonSavings(defaultPhases, '2026-10-02', 100000, 'USD')
    expect(r.phaseResults[0]).toMatchObject({ days: 60, rate: 3.3 })
    expect(r.phaseResults[0].interest).toBeCloseTo(550, 8)
    expect(r.phaseResults[1].interest).toBeCloseTo(330.55555555555554, 8)
    expect(r.phaseResults[2].interest).toBeCloseTo(290, 8)
    expect(r.totalInterest).toBeCloseTo(1170.5555555555557, 8)
    expect(r.hkdActualRate).toBeCloseTo(2.9495934959349595, 8)
    expect(r.usdActualRate).toBeCloseTo(3.4260162601626014, 8)
  })

  it('matches current output when deposit is mid-phase (HKD)', () => {
    const r = computeMarathonSavings(defaultPhases, '2026-10-15', 100000, 'HKD')
    expect(r.totalDays).toBe(110)
    expect(r.hkdActualRate).toBeCloseTo(2.9672727272727273, 8)
    expect(r.usdActualRate).toBeCloseTo(3.440909090909091, 8)
    expect(r.totalInterest).toBeCloseTo(894.2465753424658, 8)
    expect(r.phaseResults[0].days).toBe(47)
  })

  it('excludes blank phases from the weighted actual rate', () => {
    const phases: PhaseState[] = [
      defaultPhases[0],
      { startDate: '2026-12-01', endDate: '', hkdRate: 3.0, usdRate: 3.5 },
      { startDate: '', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
    ]
    const r = computeMarathonSavings(phases, '2026-10-02', 100000, 'HKD')
    expect(r.totalDays).toBe(60)
    expect(r.hkdActualRate).toBeCloseTo(2.8, 8)
    expect(r.usdActualRate).toBeCloseTo(3.3, 8)
    expect(r.totalInterest).toBeCloseTo(460.2739726027397, 8)
  })

  it('treats a blank rate as 0', () => {
    const phases: PhaseState[] = [
      { startDate: '2026-10-02', endDate: '2026-11-30', hkdRate: '', usdRate: 3.3 },
      { startDate: '2026-12-01', endDate: '2027-01-03', hkdRate: 3.0, usdRate: 3.5 },
      { startDate: '2027-01-04', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
    ]
    const r = computeMarathonSavings(phases, '2026-10-02', 100000, 'HKD')
    expect(r.phaseResults[0].rate).toBe(0)
    expect(r.phaseResults[0].interest).toBe(0)
    expect(r.hkdActualRate).toBeCloseTo(1.583739837398374, 8)
  })

  it('returns zero interest when principal is 0', () => {
    const r = computeMarathonSavings(defaultPhases, '2026-10-02', 0, 'HKD')
    expect(r.totalInterest).toBe(0)
    expect(r.phaseResults.every((p) => p.interest === 0)).toBe(true)
    expect(r.hkdActualRate).toBeCloseTo(2.9495934959349595, 8)
  })

  it('returns a zero result for an empty phases array', () => {
    const r = computeMarathonSavings([], '2026-10-02', 100000, 'HKD')
    expect(r.phaseResults).toEqual([])
    expect(r.totalDays).toBe(0)
    expect(r.totalInterest).toBe(0)
    expect(r.hkdActualRate).toBe(0)
    expect(r.usdActualRate).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- src/lib/marathon.test.ts`
Expected: FAIL — `computeMarathonSavings` is not exported.

- [ ] **Step 3: Implement `computeMarathonSavings` and its types in `src/lib/marathon.ts`**

Exact signatures:

```ts
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

export function computeMarathonSavings(
  phases: readonly PhaseState[],
  depositDate: string,
  principal: number,
  currency: Currency,
): MarathonSavingsResult
```

Composition (the non-obvious parts):

```ts
const { phases: allocation, totalDays } = computePhaseDays(phases, depositDate)
let weightedHKD = 0, weightedUSD = 0
for (let i = 0; i < phases.length; i++) {
  weightedHKD += allocation[i].days * (Number(phases[i].hkdRate) || 0)
  weightedUSD += allocation[i].days * (Number(phases[i].usdRate) || 0)
}
const hkdActualRate = totalDays === 0 ? 0 : weightedHKD / totalDays
const usdActualRate = totalDays === 0 ? 0 : weightedUSD / totalDays

const phaseResults = phases.map((p, i) => {
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
```

Add `import Decimal from 'decimal.js'` and `import { calculateSimpleInterest, DAY_BASE_MAP, type Currency } from './calculator'` at the top of `marathon.ts`. Add `Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })` at module top (idempotent; makes the module self-contained even though `calculator.ts` also sets it).

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- src/lib/marathon.test.ts`
Expected: PASS — 7 `computePhaseDays` + 7 `computeMarathonSavings` tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/marathon.ts src/lib/marathon.test.ts
git commit -m "refactor: add computeMarathonSavings to lib/marathon"
```

---

### Task 4: Point type imports at `src/lib/` modules

**Files (import lines only; no runtime change):**
- Modify: `src/components/CurrencyToggle.tsx`
- Modify: `src/components/DepositSummary.tsx`
- Modify: `src/components/InterestBreakdown.tsx`
- Modify: `src/components/PhaseRateTimeline.tsx`
- Modify: `src/pages/MarathonSavings.tsx`
- Modify: `src/components/PhaseRateTimeline.test.tsx`
- Modify: `src/components/PhaseRateEditForm.test.tsx`
- Modify: `src/components/InterestBreakdown.test.tsx`

**Interfaces:**
- Consumes: `Currency` from `src/lib/calculator.ts`; `PhaseState` from `src/lib/phases.ts`; `PhaseResult` from `src/lib/marathon.ts` (Task 3).

- [ ] **Step 1: Update the imports**

Replace, in each file, exactly these import lines (relative paths may use `@/` or `../`; keep each file's existing style):

| File | Old | New |
|---|---|---|
| `CurrencyToggle.tsx` | `import type { Currency } from '@/hooks/useMarathonSavings'` | `import type { Currency } from '@/lib/calculator'` |
| `DepositSummary.tsx` | `import type { Currency } from '@/hooks/useMarathonSavings'` | `import type { Currency } from '@/lib/calculator'` |
| `InterestBreakdown.tsx` | `import type { Currency, PhaseResult } from '@/hooks/useMarathonSavings'` | `import type { Currency } from '@/lib/calculator'` + `import type { PhaseResult } from '@/lib/marathon'` |
| `PhaseRateTimeline.tsx` | `import type { PhaseState, Currency } from '@/hooks/useMarathonSavings'` | `import type { PhaseState } from '@/lib/phases'` + `import type { Currency } from '@/lib/calculator'` |
| `pages/MarathonSavings.tsx` | `import type { PhaseState } from '../hooks/useMarathonSavings'` | `import type { PhaseState } from '../lib/phases'` |
| `PhaseRateTimeline.test.tsx` | `import type { PhaseState } from '@/hooks/useMarathonSavings'` | `import type { PhaseState } from '@/lib/phases'` |
| `PhaseRateEditForm.test.tsx` | `import type { PhaseState } from '@/hooks/useMarathonSavings'` | `import type { PhaseState } from '@/lib/phases'` |
| `InterestBreakdown.test.tsx` | `import type { PhaseResult } from '@/hooks/useMarathonSavings'` | `import type { PhaseResult } from '@/lib/marathon'` |

`CurrencyToggle.test.tsx` needs no change (it imports the component, not a domain type).

- [ ] **Step 2: Run tests and lint to verify nothing broke**

Run: `pnpm test`
Expected: PASS — full suite green (no behavior changed, only type provenance).

Run: `pnpm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/CurrencyToggle.tsx src/components/DepositSummary.tsx src/components/InterestBreakdown.tsx src/components/PhaseRateTimeline.tsx src/pages/MarathonSavings.tsx src/components/PhaseRateTimeline.test.tsx src/components/PhaseRateEditForm.test.tsx src/components/InterestBreakdown.test.tsx
git commit -m "refactor: import domain types from lib modules"
```

---

### Task 5: Slim the hook to an adapter

**Files:**
- Modify: `src/hooks/useMarathonSavings.ts`

**Interfaces:**
- Consumes: `computeMarathonSavings` and `MarathonSavingsResult` from `src/lib/marathon.ts` (Task 3); `Currency` from `src/lib/calculator.ts`.
- Produces: hook exports only `useInputs`, `useCalculator`, `InputState`, `InputActions`; it no longer exports `Currency`, `PhaseResult`, `Result`, `PhaseIndex`, or `PhaseState`. `useCalculator(state: InputState): MarathonSavingsResult`.

- [ ] **Step 1: Rewrite the imports and delete the dead definitions**

In `src/hooks/useMarathonSavings.ts`:

1. Imports become:
   ```ts
   import { useMemo, useState } from 'react'
   import { format } from 'date-fns'
   import { computeMarathonSavings, type MarathonSavingsResult } from '../lib/marathon'
   import type { Currency } from '../lib/calculator'
   import {
     applyPhaseEndDate,
     applyPhaseStartDate,
     type PhaseIndex,
     type Phases,
   } from '../lib/phases'
   ```
2. Delete: the `Decimal` import and the `Decimal.set(...)` line; the `parseISO`/`addDays`/`differenceInDays` date-fns imports (keep `format`); the `calculateSimpleInterest, DAY_BASE_MAP` import; the `export type { PhaseIndex, PhaseState } from '../lib/phases'` line; the local `export type Currency = 'HKD' | 'USD'`; the `effectiveDays` and `phaseInterest` functions; the `parseDateStr` helper; and the `PhaseResult` and `Result` interfaces. Keep `toDateStr` (used by `defaultDates`).

- [ ] **Step 2: Replace `useCalculator`'s body with a single call**

```ts
export function useCalculator(state: InputState): MarathonSavingsResult {
  const principal = Number(state.principal) || 0
  return useMemo(
    () => computeMarathonSavings(state.phases, state.depositDate, principal, state.currency),
    [state.phases, state.depositDate, principal, state.currency],
  )
}
```

`useInputs` is unchanged.

- [ ] **Step 3: Run tests and lint**

Run: `pnpm test`
Expected: PASS — full suite green (hook output is bit-identical for reachable inputs; the marathon math is now asserted in `lib/marathon.test.ts`).

Run: `pnpm run lint`
Expected: clean — no unused imports remain.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useMarathonSavings.ts
git commit -m "refactor: slim useMarathonSavings hook to an adapter"
```

---

## Self-Review Notes

- **Spec coverage:** every agreed contract is implemented: `computePhaseDays` (Task 1), timeline adapter + blank-label fix (Task 2), `computeMarathonSavings` (Task 3), type consolidation (Task 4), hook adapter (Task 5).
- **Review Focus mapping:** line 1 → Tasks 1, 2, 3; line 2 → Task 1; line 3 → Task 3; line 4 → Task 3; line 5 → Tasks 1, 3.
- **Type consistency:** `PhaseDays`/`PhaseDaysResult` (Task 1) are consumed by name in Task 3 via `computePhaseDays`; `PhaseResult`/`MarathonSavingsResult` (Task 3) are consumed in Task 5 and by `InterestBreakdown` in Task 4. No name drift.
- **Proportion:** test assertions carry the pinned numeric values; function bodies are given only for the allocation algorithm and the money composition, which the signatures and tests alone would not fully determine.
