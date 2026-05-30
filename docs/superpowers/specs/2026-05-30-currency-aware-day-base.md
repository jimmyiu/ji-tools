# Currency-aware dayBase for calculateCompoundDayBased

## Problem

`calculateCompoundDayBased` in `src/hooks/useCalculator.ts` hardcodes `const dayBase = DAY_BASE` (=365). Both HKD and USD calls use this same function with the same 365-day base. The FxDepositCompare disclaimer claims USD uses 360-day base, but the code doesn't deliver this — a correctness bug.

## Solution

Move `calculateCompoundDayBased` to `src/lib/interest.ts`, add `dayBase` as a parameter, and switch its period input from `PeriodInfo[]` to `number[]` (day counts only). This keeps `interest.ts` pure (zero new dependencies) and eliminates the need to move `PeriodInfo`.

### `src/lib/interest.ts` changes

Add:
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

No new imports — still only `decimal.js`.

### `src/hooks/useCalculator.ts` changes

- Remove `DAY_BASE = 365` constant
- Remove `calculateCompoundDayBased` function
- Update import: add `calculateCompoundDayBased`, `DAY_BASE_MAP` from `'../lib/interest'`
- Four call sites updated:
  - `calculateCompoundDayBased(p, rH, dayCounts, DAY_BASE_MAP.HKD)` — HKD still 365
  - `calculateCompoundDayBased(usdPrincipal, rU, dayCounts, DAY_BASE_MAP.USD)` — USD now 360
  - Break-even loop: same pattern with HKD/USD day bases
- `computeEndDate`, `computePeriods`, `PeriodInfo` stay in place (separate change to follow)

The `dayCounts` array is derived once from `periods.map(p => p.days)`.

### `src/lib/interest.test.ts` additions

Parameterized `calculateCompoundDayBased` tests:

| Category | Principal | Rate | Day counts | Day base | Expected (total) |
|---|---|---|---|---|---|
| Simple | 100000 | 2.30% | [1] | 365 | 100006.30136986 |
| Simple | 100000 | 3.65% | [365] | 365 | 103650.00 |
| Simple | 100000 | 3.65% | [365] | 360 | 103700.69444444 |
| Compound | 9123.4567 | 2.25% | [31,28,31] | 365 | 9174.16669710 |
| Compound | 9123.4567 | 2.25% | [31,28,31] | 360 | 9174.87232091 |
| Compound | 100000 | 2.25% | [183,182] | 365 | 102262.65615500 |
| Compound | 100000 | 2.25% | [183,182] | 360 | 102294.26015625 |
| Compound | 100000 | 3.0% | [31,30,31] | 365 | 100758.07170774 |
| Multi-day | 100000 | 10% | [1,1,1,1,1] | 365 | 100137.06138292 |
| Edge | 0 | 5% | [365] | 365 | 0 |
| Edge | 100000 | 0% | [365] | 365 | 100000 |
| Edge | 100000 | 5% | [] | 365 | 100000 |

All assertions via `toBeCloseTo(expected, 8)`.

### `src/hooks/useCalculator.test.ts` removals

Remove these items (no edit, delete entirely):

- **`DAY_BASE` describe block** (lines 28-32) — constant no longer exists
- **`calculateCompoundDayBased` describe block** (lines 161-217) — 5 test cases, function moved to `interest.ts`
- **`makePeriods` helper** (lines 17-26) — only used by compound tests
- **`import Decimal from 'decimal.js'`** (line 2) — only used by `makePeriods` and compound tests
- **`calculateCompoundDayBased`, `DAY_BASE`, `type PeriodInfo`** from the import block (lines 6, 8) — no longer exported by `useCalculator.ts`

Remaining untouched: `computeEndDate` (9 tests), `computePeriods` (8 tests), end-to-end (7 tests).

**No test duplication arises.** The new `calculateCompoundDayBased` tests cover the compound function; existing `calculateSimpleInterest` tests cover the simple function. Overlap in a simple 1-period compound case is integration coverage, not duplication.

### Integration tests: `src/hooks/useCalculator.test.ts` additions

Add a new `describe('useCalculator')` block. All assertions use `toBeCloseTo(expected, 8)` for numeric fields. Tests are written with **current buggy expected values** (USD=365) FIRST — they pass before refactoring. After refactoring, USD-related assertions are updated to correct 360-day base values.

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

  // CASE 1: Defaults — HKD wins (1-period), break-even at iterate=2
  it('returns correct values for default inputs (HKD wins, break-even triggered)', () => {
    const r = run({})
    expect(r.hkdTotal).toBeCloseTo(100567.12328767, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(100337.66572326, 8)  // BUGGY 365 — update to 100348.81604957 after fix
    expect(r.difference).toBeCloseTo(-229.45756441, 8)       // update to -218.30723810
    expect(r.usdWins).toBe(false)
    expect(r.breakEvenIterate).toBe(2)
    expect(r.breakEvenDays).toBe(184)
    expect(r.breakEvenMonths).toBe(6)
    expect(r.totalDays).toBe(92)
  })

  // CASE 2: 2 periods — USD wins, no break-even
  it('returns correct values for iterate=2 (USD wins)', () => {
    const r = run({ iterate: 2 })
    expect(r.hkdTotal).toBeCloseTo(101137.46286358, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(101146.96459419, 8)  // update to 101169.44636749
    expect(r.difference).toBeCloseTo(9.50173061, 8)           // update to 31.98350391
    expect(r.usdWins).toBe(true)
    expect(r.breakEvenIterate).toBeNull()
    expect(r.totalDays).toBe(184)
  })

  // CASE 3: Zero rates — no interest earned, FX loss only
  it('returns correct values for zero rates', () => {
    const r = run({ hkdRate: 0, usdRate: 0 })
    expect(r.hkdTotal).toBeCloseTo(100000, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(99534.84222868, 8)
    expect(r.difference).toBeCloseTo(-465.15777132, 8)
    expect(r.usdWins).toBe(false)
    expect(r.breakEvenIterate).toBeNull()
    expect(r.totalDays).toBe(92)
  })

  // CASE 4: Zero principal — everything is 0
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

### Out of scope (next change)

- Moving `computeEndDate`, `computePeriods`, `PeriodInfo` to `interest.ts`
- MarathonSavings — already correctly uses `DAY_BASE_MAP[currency]` via `calculateSimpleInterest`
