## ADDED Requirements

### Requirement: calculator-lib

The application SHALL provide a `calculator.ts` module at `src/lib/calculator.ts` that consolidates all pure interest and period calculation logic. The module SHALL export the following functions and types with parametrized unit tests (`it.each`) covering all exported functions.

#### Scenario: Module exports DAY_BASE_MAP with correct day bases
- **WHEN** importing `DAY_BASE_MAP` from `calculator.ts`
- **THEN** `DAY_BASE_MAP.HKD` SHALL be `365`
- **THEN** `DAY_BASE_MAP.USD` SHALL be `360`

#### Scenario: Module exports Currency type
- **WHEN** importing `Currency` from `calculator.ts`
- **THEN** it SHALL be `'HKD' | 'USD'`

### Requirement: calculateSimpleInterest returns correct interest

The `calculateSimpleInterest(principal, annualRate, days, dayBase)` function SHALL compute `principal * annualRate * days / dayBase` using Decimal 40-digit precision.

#### Scenario: Parametrized test coverage
- **WHEN** called with a variety of principal, rate, days, and dayBase values
- **THEN** the result SHALL match expected values to 8 decimal places

### Requirement: calculateCompoundDayBased compounds interest across periods

The `calculateCompoundDayBased(principal, annualRate, dayCounts[], dayBase)` function SHALL compound interest sequentially: for each day count, calculate interest on the current balance and add it to the principal.

#### Scenario: Single period equals calculateSimpleInterest plus principal
- **WHEN** called with `dayCounts: [n]`
- **THEN** the result SHALL equal `principal + calculateSimpleInterest(principal, rate, n, dayBase)`

#### Scenario: Multiple periods compound correctly
- **WHEN** called with `dayCounts: [a, b, c]`
- **THEN** interest for period 2 SHALL be calculated on the balance after period 1 interest was added

### Requirement: PeriodInfo computes length from dates

`PeriodInfo` SHALL be a class with a `length` getter that returns `differenceInDays(endDate, startDate) + 1` (inclusive day count).

#### Scenario: Same day produces length of 1
- **WHEN** creating `new PeriodInfo(date, sameDate)`
- **THEN** `length` SHALL be `1`

#### Scenario: Normal period produces correct inclusive day count
- **WHEN** creating `new PeriodInfo(May 12, Jun 11)`
- **THEN** `length` SHALL be `31`

### Requirement: computeEndDate returns correct period end date

The `computeEndDate(startDate, depositMonths)` function SHALL compute the effective end date: if `addMonths` lands on the same day of month, subtract 1 day (unless it's the last day of the month); otherwise return the clamped date.

#### Scenario: Same day match subtracts 1 day
- **WHEN** `computeEndDate(May 12, 1)` is called
- **THEN** the result SHALL be `Jun 11`

#### Scenario: Shorter month returns clamped date
- **WHEN** `computeEndDate(Jan 31, 1)` is called
- **THEN** the result SHALL be `Feb 28` (non-leap) or `Feb 29` (leap)

### Requirement: computePeriods generates non-overlapping contiguous periods

`computePeriods(startDateStr, depositMonths, iterate)` SHALL generate `iterate` consecutive `PeriodInfo` instances, each starting the day after the previous period ends.

#### Scenario: iterate=1 produces one period with correct dates and day count
- **WHEN** `computePeriods('2025-05-12', 1, 1)` is called
- **THEN** the result SHALL be an array of 1 period, with `startDate: 2025-05-12`, `endDate: 2025-06-11`, and `length: 31`

#### Scenario: Multiple iterations chain correctly
- **WHEN** `computePeriods('2025-05-12', 1, 2)` is called
- **THEN** period 1 SHALL start the day after period 0 ends

#### Scenario: Leap year dates are handled correctly
- **WHEN** `computePeriods('2028-02-29', 1, 3)` is called
- **THEN** period 0 SHALL have length 29, period 1 SHALL have length 31, period 2 SHALL have length 30
