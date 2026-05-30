## Phase 1: RED — Write failing tests first

### 1.1 Interest primitives test suite: DAY_BASE_MAP, calculateSimpleInterest, calculateCompoundDayBased

- [x] RED: Create `src/lib/calculator.test.ts` with `Day_BASE_MAP` value tests (HKD=365, USD=360) and parametrized `it.each` tests for `calculateSimpleInterest` (9 data-driven cases + edge cases) migrated from `interest.test.ts`
- [x] RED: Add parametrized `it.each` tests for `calculateCompoundDayBased` (12 data-driven cases including empty array, zero principal, zero rate) migrated from `interest.test.ts`
- [x] VERIFY: Run `pnpm test -- src/lib/calculator.test.ts` — all tests fail because `calculator.ts` module does not exist

### 1.2 PeriodInfo class test

- [x] RED: Add parametrized `it.each` tests for `PeriodInfo.length` getter covering same-day interval (length=1) and normal interval (length=31 for May 12 → Jun 11)
- [x] VERIFY: Run `pnpm test -- src/lib/calculator.test.ts` — new PeriodInfo tests fail (class does not exist)

### 1.3 computeEndDate parametrized test suite

- [x] RED: Add parametrized `it.each` tests for `computeEndDate` with data table covering all edge cases from `useCalculator.test.ts`: same-day subtraction, clamped months (31-Jan → 28-Feb), leap year (29-Feb → 28-Mar), multi-month chains, month-end edge (31-Mar → 30-Apr), 12-month same-day subtraction
- [x] VERIFY: Run `pnpm test -- src/lib/calculator.test.ts` — new computeEndDate tests fail (function not yet in calculator.ts)

### 1.4 computePeriods parametrized test suite

- [x] RED: Add parametrized `it.each` tests for `computePeriods` with data table covering: single period with no clamping, single period with clamping (31-Jan + 1mo), chaining (period 1 starts day after period 0 ends), 3-month periods with correct day counts, clamped chaining (31-Jan x2), leap year (29-Feb-2028 x2 and x3), total days sum match, and end-to-end scenarios migrated from `useCalculator.test.ts`
- [x] VERIFY: Run `pnpm test -- src/lib/calculator.test.ts` — new computePeriods tests fail (function not yet in calculator.ts)

## Phase 2: GREEN — Implement calculator.ts

### 2.1 Implement interest primitives

- [x] GREEN: Create `src/lib/calculator.ts` with `DAY_BASE_MAP` (`as const`), `Currency` type (`keyof typeof DAY_BASE_MAP`), `calculateSimpleInterest`, and `calculateCompoundDayBased` copied from `interest.ts`; hoist `Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })` to module level
- [x] VERIFY: Run `pnpm test -- src/lib/calculator.test.ts` — DAY_BASE_MAP, calculateSimpleInterest, and calculateCompoundDayBased tests pass

### 2.2 Implement PeriodInfo class

- [x] GREEN: Add `PeriodInfo` class with constructor parameters `startDate: Date` and `endDate: Date`, and `get length()` returning `differenceInDays(endDate, startDate) + 1` (inclusive day count); export it from `calculator.ts`
- [x] VERIFY: Run `pnpm test -- src/lib/calculator.test.ts` — PeriodInfo tests pass

### 2.3 Implement computeEndDate and computePeriods

- [x] GREEN: Add `computeEndDate` to `calculator.ts` (rename `foo` parameter to `targetDate`) and `computePeriods` using `new PeriodInfo(...)` and `p.length` instead of manual `{ startDate, endDate, days }` objects; export both from `calculator.ts`
- [x] VERIFY: Run `pnpm test -- src/lib/calculator.test.ts` — all calculator tests pass

## Phase 3: REFACTOR — Update imports, migrate consumers, clean up

### 3.1 Update useCalculator.ts

- [x] REFACTOR: Remove `PeriodInfo` interface, `computeEndDate`, and `computePeriods` definitions from `src/hooks/useCalculator.ts`; import `PeriodInfo`, `computeEndDate`, `computePeriods` from `../lib/calculator`; update all `.days` property accesses to `.length` (`p.days` → `p.length`, `per.days` → `per.length`)

### 3.2 Update useMarathonSavings.ts

- [x] REFACTOR: Update `src/hooks/useMarathonSavings.ts` to import `calculateSimpleInterest`, `DAY_BASE_MAP`, and `Currency` from `../lib/calculator` instead of `../lib/interest`

### 3.3 Update useCalculator.test.ts

- [x] REFACTOR: Remove migrated `computeEndDate` and `computePeriods` `describe` blocks from `src/hooks/useCalculator.test.ts`; keep only `useCalculator` hook tests and end-to-end scenario tests that still reference `computeEndDate`; import `computeEndDate` and `computePeriods` from `../lib/calculator` where still needed

### 3.4 Remove old files

- [x] REFACTOR: Delete `src/lib/interest.ts` and `src/lib/interest.test.ts` (all logic migrated to calculator.ts)
- [x] VERIFY: Run `pnpm test -- src/lib/calculator.test.ts` — all calculator tests still pass after deletion

### 3.5 Final verification

- [x] VERIFY: Run `pnpm test` — full test suite passes (171+ tests)
