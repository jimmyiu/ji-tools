# Interest Library Extraction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract shared interest calculation logic into a standalone testable library with 100% coverage.

**Architecture:** Create `src/lib/interest.ts` with `DAY_BASE_MAP` and `calculateSimpleInterest`. Migrate `useMarathonSavings.ts`'s `phaseInterest` to use the shared primitive. Refactor `calculateCompoundDayBased` in `useCalculator.ts` to delegate per-period interest to `calculateSimpleInterest`. Add UI footnote about day count convention.

**Tech Stack:** TypeScript, decimal.js, Vitest

---

### File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/interest.ts` | **Create** | `DAY_BASE_MAP`, `calculateSimpleInterest` |
| `src/lib/interest.test.ts` | **Create** | 100% coverage of `interest.ts` |
| `src/hooks/useMarathonSavings.ts` | **Modify** | Replace local `phaseInterest` with import |
| `src/hooks/useCalculator.ts` | **Modify** | Delegate per-period interest to `calculateSimpleInterest` |
| `src/pages/FxDepositCompare.tsx` | **Modify** | Add day count convention footnote |

### Task 1: Create `src/lib/interest.ts`

**Files:**
- Create: `src/lib/interest.ts`

- [x] **Step 1: Write the module**

```typescript
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
```

- [x] **Step 2: Check it compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

- [x] **Step 3: Commit**

```bash
git add src/lib/interest.ts
git commit -m "feat: add interest calculation library with DAY_BASE_MAP"
```

### Task 2: Create `src/lib/interest.test.ts`

**Files:**
- Create: `src/lib/interest.test.ts`

- [x] **Step 1: Write the test with 9 parameterized cases + edge cases**

```typescript
import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { calculateSimpleInterest, DAY_BASE_MAP } from './interest'

describe('DAY_BASE_MAP', () => {
  it('HKD uses 365 days', () => {
    expect(DAY_BASE_MAP.HKD).toBe(365)
  })

  it('USD uses 360 days', () => {
    expect(DAY_BASE_MAP.USD).toBe(360)
  })
})

describe('calculateSimpleInterest', () => {
  const cases = [
    { principal: 100000, annualRate: 0.023, days: 1, dayBase: 365, expected: 6.30136986 },
    { principal: 100000, annualRate: 0.023, days: 365, dayBase: 365, expected: 2300.00000000 },
    { principal: 100000, annualRate: 0.023, days: 730, dayBase: 365, expected: 4600.00000000 },
    { principal: 100000, annualRate: 0.023, days: 999, dayBase: 365, expected: 6295.06849315 },
    { principal: 9123.4567, annualRate: 0.0225, days: 92, dayBase: 365, expected: 51.74124759 },
    { principal: 100000, annualRate: 0.033, days: 1, dayBase: 360, expected: 9.16666667 },
    { principal: 100000, annualRate: 0.033, days: 360, dayBase: 360, expected: 3300.00000000 },
    { principal: 100000, annualRate: 0.033, days: 365, dayBase: 360, expected: 3345.83333333 },
    { principal: 9123.4567, annualRate: 0.0333, days: 92, dayBase: 360, expected: 77.64061652 },
  ] as const

  it.each(cases)(
    '$principal @ $annualRate for $days days (dayBase=$dayBase) → $expected',
    ({ principal, annualRate, days, dayBase, expected }) => {
      const result = calculateSimpleInterest(
        new Decimal(principal),
        new Decimal(annualRate),
        days,
        dayBase,
      )
      expect(result.toNumber()).toBeCloseTo(expected, 8)
    },
  )

  it('returns 0 for zero principal', () => {
    const result = calculateSimpleInterest(new Decimal(0), new Decimal(0.023), 365, 365)
    expect(result.toNumber()).toBe(0)
  })

  it('returns 0 for zero annual rate', () => {
    const result = calculateSimpleInterest(new Decimal(100000), new Decimal(0), 365, 365)
    expect(result.toNumber()).toBe(0)
  })

  it('returns 0 for zero days', () => {
    const result = calculateSimpleInterest(new Decimal(100000), new Decimal(0.023), 0, 365)
    expect(result.toNumber()).toBe(0)
  })
})
```

- [x] **Step 2: Run tests to verify they pass**

Run: `pnpm test -- src/lib/interest.test.ts`
Expected: 14 tests pass (2 for DAY_BASE_MAP + 9 parameterized + 3 edge cases)

- [x] **Step 3: Verify no existing tests broke**

Run: `pnpm test`
Expected: All tests pass

- [x] **Step 4: Commit**

```bash
git add src/lib/interest.test.ts
git commit -m "feat: add 100% coverage tests for interest library"
```

### Task 3: Migrate `useMarathonSavings.ts` to use shared primitive

**Files:**
- Modify: `src/hooks/useMarathonSavings.ts`

- [x] **Step 1: Replace `phaseInterest` with import**

Current code (lines 102-104):
```typescript
function phaseInterest(principal: number, rate: number, days: number, currency: Currency): number {
  const dayBase = currency === 'USD' ? 360 : 365
  return new Decimal(principal).times(rate).div(100).times(days).div(dayBase).toNumber()
}
```

Replace with import and inline. At top of file, add import:
```typescript
import { calculateSimpleInterest, DAY_BASE_MAP } from '../lib/interest'
```

Replace the function:
```typescript
function phaseInterest(principal: number, rate: number, days: number, currency: Currency): number {
  return calculateSimpleInterest(
    new Decimal(principal),
    new Decimal(rate).div(100),
    days,
    DAY_BASE_MAP[currency],
  ).toNumber()
}
```

- [x] **Step 2: Run tests to verify nothing broke**

Run: `pnpm test`
Expected: All existing tests still pass. Note: useMarathonSavings has no dedicated tests, so this is regression-checking only.

- [x] **Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds

- [x] **Step 4: Commit**

```bash
git add src/hooks/useMarathonSavings.ts
git commit -m "refactor: use shared interest calculation in marathon savings"
```

### Task 4: Refactor `calculateCompoundDayBased` to use shared primitive

**Files:**
- Modify: `src/hooks/useCalculator.ts`

- [x] **Step 1: Add import and delegate to `calculateSimpleInterest`**

Add import at top of file:
```typescript
import { calculateSimpleInterest } from '../lib/interest'
```

Replace internals of `calculateCompoundDayBased`:
```typescript
export function calculateCompoundDayBased(
  principal: Decimal,
  rate: Decimal,
  periods: PeriodInfo[],
  iterate: number
): Decimal {
  const dayBase = DAY_BASE
  let current = principal
  for (let i = 0; i < iterate; i++) {
    const interest = calculateSimpleInterest(current, rate, periods[i].days, dayBase)
    current = current.plus(interest)
  }
  return current
}
```

Signature stays the same — no breaking changes.

- [x] **Step 2: Run tests**

Run: `pnpm test`
Expected: All tests pass

- [x] **Step 3: Commit**

```bash
git add src/hooks/useCalculator.ts
git commit -m "refactor: calculateCompoundDayBased now delegates to calculateSimpleInterest"
```

### Task 5: Add UI footnote to FxDepositCompare

**Files:**
- Modify: `src/pages/FxDepositCompare.tsx`

- [x] **Step 1: Add day count convention footnote**

Find the closing `</div>` of the outer container (line 215). Add before it:
```typescript
      <p className="text-xs text-muted-foreground/50 mt-6 text-center">
        *利息以每年365日（港元）及360日（美元）計算
      </p>
```

- [x] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds

- [x] **Step 3: Commit**

```bash
git add src/pages/FxDepositCompare.tsx
git commit -m "feat: add day count convention footnote to deposit compare page"
```

### Task 6: Final verification

- [x] **Step 1: Run full test suite**

Run: `pnpm test`
Expected: All tests pass

- [x] **Step 2: Run full build**

Run: `pnpm build`
Expected: Build succeeds
