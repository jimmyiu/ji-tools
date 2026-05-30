# Currency-aware dayBase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix USD using incorrect 365-day base by making `calculateCompoundDayBased` accept `dayBase` as a parameter, moving it to `interest.ts`, and updating all callers.

**Architecture:** `calculateCompoundDayBased` moves from `useCalculator.ts` to `interest.ts`, switches from `PeriodInfo[]` to `number[]` input, and gains a `dayBase` param. The `useCalculator` hook derives `dayCounts` once, then passes `DAY_BASE_MAP.HKD`/`.USD` per currency call. Hook integration tests are added first as a regression safety net.

**Tech Stack:** TypeScript, Decimal.js, date-fns, Vitest

---

### Task 1: Add useCalculator hook integration tests

**Files:**
- Modify: `src/hooks/useCalculator.test.ts` — add 4 integration test cases
- Import from: `src/hooks/useCalculator.ts` — `useCalculator`

- [ ] **Step 1: Add `useCalculator` to existing import and add integration test block**

First, update the existing import block (lines 3-9) to include `useCalculator`:

```ts
import {
  computeEndDate,
  computePeriods,
  calculateCompoundDayBased,
  DAY_BASE,
  useCalculator,
  type PeriodInfo,
} from '../hooks/useCalculator'
```

Then insert after the last `describe` block (after line 273) in `src/hooks/useCalculator.test.ts`:

```ts
describe('useCalculator', () => {
  const defaults = {
    startDate: '2025-05-12',
    initialPrincipal: 100000,
    depositMonths: 3,
    iterate: 1,
    hkdRate: 2.25,
    usdRate: 3.2,
    bankSellRate: 7.8468,
    bankBuyRate: 7.8103,
  }

  function run(overrides: Partial<typeof defaults>) {
    return useCalculator({ ...defaults, ...overrides })
  }

  it('returns correct values for default inputs (HKD wins, break-even triggered)', () => {
    const r = run({})
    expect(r.hkdTotal).toBeCloseTo(100567.12328767, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(100337.66572326, 8)
    expect(r.difference).toBeCloseTo(-229.45756441, 8)
    expect(r.usdWins).toBe(false)
    expect(r.breakEvenIterate).toBe(2)
    expect(r.breakEvenDays).toBe(184)
    expect(r.breakEvenMonths).toBe(6)
    expect(r.totalDays).toBe(92)
  })

  it('returns correct values for iterate=2 (USD wins)', () => {
    const r = run({ iterate: 2 })
    expect(r.hkdTotal).toBeCloseTo(101137.46286358, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(101146.96459419, 8)
    expect(r.difference).toBeCloseTo(9.50173061, 8)
    expect(r.usdWins).toBe(true)
    expect(r.breakEvenIterate).toBeNull()
    expect(r.totalDays).toBe(184)
  })

  it('returns correct values for zero rates', () => {
    const r = run({ hkdRate: 0, usdRate: 0 })
    expect(r.hkdTotal).toBeCloseTo(100000, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(99534.84222868, 8)
    expect(r.difference).toBeCloseTo(-465.15777132, 8)
    expect(r.usdWins).toBe(false)
    expect(r.breakEvenIterate).toBeNull()
    expect(r.totalDays).toBe(92)
  })

  it('returns 0 for zero principal', () => {
    const r = run({ initialPrincipal: 0 })
    expect(r.hkdTotal).toBe(0)
    expect(r.usdTotalInHkd).toBe(0)
    expect(r.difference).toBe(0)
    expect(r.usdWins).toBe(true)
    expect(r.breakEvenIterate).toBeNull()
    expect(r.totalDays).toBe(92)
  })
})
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
pnpm test -- src/hooks/useCalculator.test.ts
```

Expected: All 4 new tests pass alongside existing 24 tests (28 total, 0 failures).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCalculator.test.ts
git commit -m "test: add useCalculator hook integration tests as regression baseline"
```

---

### Task 2: Add calculateCompoundDayBased to interest.ts

**Files:**
- Modify: `src/lib/interest.ts` — add `calculateCompoundDayBased` function
- Modify: `src/lib/interest.test.ts` — add parameterized tests

- [ ] **Step 1: Write the failing tests in interest.test.ts**

Append to `src/lib/interest.test.ts`:

```ts
import { calculateCompoundDayBased } from './interest'

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
  ] as const

  it.each(cases)(
    '$principal @ ${annualRate * 100}% for [$dayCounts] (base=$dayBase) → $expected',
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- src/lib/interest.test.ts
```

Expected: Failure — `calculateCompoundDayBased is not defined` or similar.

- [ ] **Step 3: Implement calculateCompoundDayBased in interest.ts**

Add after `calculateSimpleInterest` in `src/lib/interest.ts`:

```ts
export function calculateCompoundDayBased(
  principal: Decimal,
  rate: Decimal,
  dayCounts: number[],
  dayBase: number,
): Decimal {
  let current = principal
  for (let i = 0; i < dayCounts.length; i++) {
    const interest = calculateSimpleInterest(current, rate, dayCounts[i], dayBase)
    current = current.plus(interest)
  }
  return current
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- src/lib/interest.test.ts
```

Expected: All 12 `calculateCompoundDayBased` cases pass. No regressions in existing `DAY_BASE_MAP` and `calculateSimpleInterest` tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/interest.ts src/lib/interest.test.ts
git commit -m "feat: add calculateCompoundDayBased with dayBase param to interest.ts"
```

---

### Task 3: Refactor useCalculator.ts to use currency-aware dayBase

**Files:**
- Modify: `src/hooks/useCalculator.ts` — remove old code, update imports and call sites

- [ ] **Step 1: Update import and remove old code**

In `src/hooks/useCalculator.ts`:

1. Change import on line 4 from:
   ```ts
   import { calculateSimpleInterest } from '../lib/interest'
   ```
   to:
   ```ts
   import { DAY_BASE_MAP, calculateCompoundDayBased } from '../lib/interest'
   ```

2. Delete `export const DAY_BASE = 365` (line 8)

3. Delete the entire `calculateCompoundDayBased` function (lines 50-63)

- [ ] **Step 2: Update call sites in the hook**

Inside the `useMemo` callback (starting line 75):

After `const b = new Decimal(bankBuyRate)` (line 85), add:
```ts
const dayCounts = periods.map(p => p.days)
```

Change the HKD compound call (line 87) from:
```ts
const hkdTotal = calculateCompoundDayBased(p, rH, periods, iterate)
```
to:
```ts
const hkdTotal = calculateCompoundDayBased(p, rH, dayCounts, DAY_BASE_MAP.HKD)
```

Change the USD compound call (line 89) from:
```ts
const usdTotalInUSD = calculateCompoundDayBased(usdPrincipal, rU, periods, iterate)
```
to:
```ts
const usdTotalInUSD = calculateCompoundDayBased(usdPrincipal, rU, dayCounts, DAY_BASE_MAP.USD)
```

In the break-even loop (lines 97-108), change the loop body from:
```ts
for (let n = 1; n <= maxIterate; n++) {
  const testPeriods = allPeriods.slice(0, n)
  const testHKD = calculateCompoundDayBased(p, rH, testPeriods, n)
  const testUSD = calculateCompoundDayBased(p.div(s), rU, testPeriods, n).times(b)
  if (testUSD.gte(testHKD)) {
    breakEvenIterate = n
    breakEvenDays = testPeriods.reduce((sum, p) => sum + p.days, 0)
    break
  }
}
```
to:
```ts
const allDayCounts = allPeriods.map(p => p.days)
for (let n = 1; n <= maxIterate; n++) {
  const testDayCounts = allDayCounts.slice(0, n)
  const testHKD = calculateCompoundDayBased(p, rH, testDayCounts, DAY_BASE_MAP.HKD)
  const testUSD = calculateCompoundDayBased(p.div(s), rU, testDayCounts, DAY_BASE_MAP.USD).times(b)
  if (testUSD.gte(testHKD)) {
    breakEvenIterate = n
    breakEvenDays = testDayCounts.reduce((sum, d) => sum + d, 0)
    break
  }
}
```

- [ ] **Step 3: Run tests to see USD-related integration tests fail**

```bash
pnpm test -- src/hooks/useCalculator.test.ts
```

Expected: HKD integration tests still pass. USD-related assertions in integration tests fail (values changed from 365-base to 360-base). The compound and DAY_BASE tests also fail (they reference removed exports).

- [ ] **Step 4: Commit the refactoring (tests may still fail — intentional)**

```bash
git add src/hooks/useCalculator.ts
git commit -m "refactor: use currency-aware dayBase in useCalculator.ts"
```

---

### Task 4: Clean up useCalculator.test.ts and update USD assertions

**Files:**
- Modify: `src/hooks/useCalculator.test.ts` — remove old tests, update USD assertions, clean imports

- [ ] **Step 1: Remove unused imports (after Task 1 added `useCalculator` to the import)**

Change the import block (lines 1-15) from:
```ts
import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import {
  computeEndDate,
  computePeriods,
  calculateCompoundDayBased,
  DAY_BASE,
  useCalculator,
  type PeriodInfo,
} from '../hooks/useCalculator'
import {
  addDays,
  parseISO,
  startOfDay,
  format,
} from 'date-fns'
```
to:
```ts
import { describe, it, expect } from 'vitest'
import {
  computeEndDate,
  computePeriods,
  useCalculator,
} from '../hooks/useCalculator'
import {
  addDays,
  parseISO,
  startOfDay,
  format,
} from 'date-fns'
```

- [ ] **Step 2: Remove `makePeriods` helper**

Delete lines 17-26 (the `makePeriods` function).

- [ ] **Step 3: Remove `DAY_BASE` describe block**

Delete lines 28-32 (the entire `describe('DAY_BASE')` block).

- [ ] **Step 4: Remove `calculateCompoundDayBased` describe block**

Delete lines 161-217 (the entire `describe('calculateCompoundDayBased')` block — 5 tests).

- [ ] **Step 5: Update USD assertions in integration tests**

In the first test `'returns correct values for default inputs...'`:
- Change `usdTotalInHkd` expected from `100337.66572326` to `100348.81604957`
- Change `difference` expected from `-229.45756441` to `-218.30723810`

In the second test `'returns correct values for iterate=2...'`:
- Change `usdTotalInHkd` expected from `101146.96459419` to `101169.44636749`
- Change `difference` expected from `9.50173061` to `31.98350391`

- [ ] **Step 6: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass. No regressions.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useCalculator.test.ts
git commit -m "test: remove moved compound tests, update USD assertions to 360-day base"
```

---

### Task 5: Verify full suite

- [ ] **Step 1: Run all tests and lint**

```bash
pnpm test
pnpm run lint
```

Expected: All tests pass, lint clean.

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: Build succeeds without errors.
