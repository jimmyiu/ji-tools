## Context

Currently, pure calculation logic is split across `src/lib/interest.ts` (interest primitives), `src/hooks/useCalculator.ts` (period computation), and `src/hooks/useMarathonSavings.ts` (marathon-specific helpers). The interest primitives already have parametrized unit tests at 100% line coverage, but period logic and marathon helpers are either untested or only covered through hook integration tests. This makes it impossible to independently verify calculation correctness and track coverage at the function level.

## Goals / Non-Goals

**Goals:**
- Consolidate all interest and period calculation logic into `src/lib/calculator.ts`
- Convert `PeriodInfo.days` to a computed `length` getter via class (derived from startDate/endDate)
- Add parametrized unit tests (`it.each`) covering all exported functions and branches in `calculator.ts`
- Update hook files to import from `calculator.ts` instead of `interest.ts` or inline definitions
- Delete `interest.ts` and `interest.test.ts` after migration

**Non-Goals:**
- Marathon savings logic (`effectiveDays`, `phaseInterest`, result computation) — deferred to a future change
- Break-even loop in `useCalculator.ts` — stays in the hook for now
- Any behavioral changes to the calculations themselves

## Decisions

- **Single file**: `calculator.ts` for all pure logic rather than multiple files — keeps scope focused for this increment; marathon logic can be added later
- **Class getter for `PeriodInfo.length`**: Using a class with `get length()` instead of a stored `days` field eliminates data duplication and the risk of stale values; the derived value is always correct
- **Parametrized tests via `it.each`**: Follows the existing pattern in `interest.test.ts` — compact coverage with explicit input/expected pairs, easy to extend
- **`Decimal.set({ precision: 40 })` hoisted to `calculator.ts`**: Was duplicated in both hook files; single declaration in the lib file is cleaner

## Risks / Trade-offs

- **Risk**: Existing hook tests reference `PeriodInfo` as an interface — converting to a class may require test adjustments
  - **Mitigation**: Tests use `format(startOfDay(...))` comparisons which work identically with class instances; only `.days` → `.length` needs updating
- **Risk**: Class getter vs plain object in `computePeriods` — consumers like `useCalculator.ts` destructure or access `.days`
  - **Mitigation**: All consumers use direct property access (`p.days` → `p.length`), which works identically on class instances
