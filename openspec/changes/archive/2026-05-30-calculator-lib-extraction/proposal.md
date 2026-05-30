## Why

Pure calculation logic is mixed with React hook code in `useCalculator.ts` and `useMarathonSavings.ts`. While period functions (`computeEndDate`, `computePeriods`) have direct unit tests in `useCalculator.test.ts`, they inhabit a hook file — an architectural smell that prevents clean line-coverage tracking and independent verification. Marathon helpers (`effectiveDays`, `phaseInterest`) in `useMarathonSavings.ts` are completely untested. The `interest.ts` file already demonstrates the right pattern — pure functions with parametrized tests in a standalone lib file. Consolidating all pure logic into `calculator.ts` with parametrized unit tests eliminates this structural gap.

## What Changes

- Rename `src/lib/interest.ts` → `src/lib/calculator.ts`, add period logic from `useCalculator.ts`
- Convert `PeriodInfo.days` field to a computed `length` getter via class
- Add parametrized unit tests (`it.each`) covering all exported functions and branches in `calculator.ts`
- Update `useCalculator.ts` and `useMarathonSavings.ts` to import from `calculator.ts`
- Delete `interest.ts` and `interest.test.ts` (logic migrated to calculator.ts)

## Capabilities

### New Capabilities
- `calculator-lib`: Consolidated pure calculation library containing interest primitives (calculateSimpleInterest, calculateCompoundDayBased, DAY_BASE_MAP) and period logic (PeriodInfo, computeEndDate, computePeriods)

### Modified Capabilities
<!-- No existing spec requirements are changing — only implementation location and test coverage -->

## Impact

- `src/lib/interest.ts` — deleted
- `src/lib/interest.test.ts` — deleted
- `src/hooks/useCalculator.ts` — remove period logic, import from calculator.ts
- `src/hooks/useCalculator.test.ts` — import period functions from calculator.ts
- `src/hooks/useMarathonSavings.ts` — import from calculator.ts instead of interest.ts
