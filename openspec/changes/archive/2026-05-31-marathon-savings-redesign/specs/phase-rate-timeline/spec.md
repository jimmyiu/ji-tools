## ADDED Requirements

### Requirement: Dual-Label Bar

The timeline SHALL render a horizontal bar with segments proportional to each phase's full calendar duration (endDate - startDate + 1, minimum 1). Each segment SHALL display the HKD rate on the top line (purple text) and the USD rate on the bottom line (green text). Segment widths SHALL use CSS `flex: N` where N is the full phase duration in days. The parent container SHALL use `flex flex-row w-full gap-1`. Each segment SHALL have `min-w-[4.5rem] whitespace-nowrap overflow-hidden` to prevent text breakage on narrow segments.

#### Scenario: Proportional segment widths
- **WHEN** phases have durations of 59, 32, and 29 days
- **THEN** the bar segments SHALL use `flex: 59`, `flex: 32`, and `flex: 29` respectively

#### Scenario: Narrow segment text protection
- **WHEN** a phase has only 2 days while another has 100 days
- **THEN** the 2-day segment SHALL have `min-w-[4.5rem]` and `overflow-hidden` to prevent rate text from overflowing

#### Scenario: Dual rate display per segment
- **WHEN** a phase has HKD rate 1.85% and USD rate 3.0%
- **THEN** the segment SHALL display "HKD 1.85%" on the top line and "USD 3%" on the bottom line (JavaScript number formatting drops trailing zeros)

#### Scenario: Increasing opacity progression
- **WHEN** the bar renders with multiple segments
- **THEN** each successive segment SHALL have a higher background opacity than the previous one

---

### Requirement: Boundary-Aligned Date Labels

The timeline SHALL display date labels at each segment boundary, positioned using absolute positioning with calculated percentages: `boundary[i] = (cumulative full duration up to phase i / total full duration) * 100%`. The first label (phase 1 start) SHALL be at 0% (left edge), the last label (final phase end) SHALL be at 100% (right edge). All viewports SHALL show the same date labels — no viewport-dependent behavior or phase duration labels.

#### Scenario: Boundary position calculation
- **WHEN** total full duration is 120 and phase 1 has 59 days duration
- **THEN** the boundary between phase 1 and phase 2 SHALL be positioned at `left: 49.17%`

#### Scenario: First and last date positioning
- **WHEN** the timeline renders with any valid phases
- **THEN** the first date (phase 1 start) SHALL be at `left: 0` and the last date (phase 3 end) SHALL be at `right: 0`

#### Scenario: Date format
- **WHEN** a phase start date is `2026-05-04`
- **THEN** the date SHALL be displayed as `04-May`

#### Scenario: No phase duration labels
- **WHEN** the timeline renders
- **THEN** there SHALL be no "階段 X · N 日" or other phase duration labels below the bar

---

### Requirement: Effective Days Calculation

The effective days per phase SHALL be computed independently from the bar width calculation. Effective days determine whether a segment is muted (opacity 0.4) and whether the "存款日期在所有階段之後" message is shown. They SHALL NOT affect segment width — bar widths SHALL always use full calendar duration.

#### Scenario: Deposit date within phase range
- **WHEN** deposit date is `2026-05-15` and phase 1 is `2026-05-04` to `2026-07-01`
- **THEN** phase 1 effective days SHALL be calculated from `2026-05-15` to `2026-07-01` (inclusive)

#### Scenario: Deposit date after all phases
- **WHEN** deposit date is after the last phase's end date
- **THEN** all phases SHALL have 0 effective days, and the "存款日期在所有階段之後" message SHALL be displayed

---

### Requirement: Phase Duration Calculation

The timeline SHALL compute each phase's full calendar duration as `differenceInDays(endDate, startDate) + 1`, with a minimum of 1 day. This duration SHALL be used for segment widths via `flex: duration` and for boundary position calculations.

#### Scenario: Full duration used for width
- **WHEN** a phase is `2026-07-02` to `2026-08-02`
- **THEN** the full duration SHALL be 32 days, and the segment SHALL use `flex: 32`

#### Scenario: Duration minimum floor
- **WHEN** startDate equals endDate (0 calendar days)
- **THEN** the duration SHALL be 1 (minimum floor to prevent CSS rendering errors)

---

### Requirement: Zero Effective Days Edge Cases

When a phase has 0 effective days (deposit date after phase end), the segment SHALL render with muted styling (opacity 0.4) while maintaining its proportional width from full duration. When total effective days across all phases is 0, the timeline SHALL display the message "存款日期在所有階段之後" instead of the bar.

#### Scenario: Phase with zero effective days
- **WHEN** a phase has 0 effective days (deposit date after phase end)
- **THEN** the segment SHALL render with `opacity: 0.4` while keeping its proportional `flex: duration` width

#### Scenario: All phases have zero effective days
- **WHEN** total effective days across all phases is 0
- **THEN** the timeline SHALL display the message "存款日期在所有階段之後"

---

### Requirement: Props Interface

The `PhaseRateTimeline` component SHALL accept `phases` (array of `PhaseState`) and `depositDate` (string in `yyyy-MM-dd` format) as props.

#### Scenario: Valid props rendering
- **WHEN** the component receives 3 phases and a valid deposit date
- **THEN** the timeline SHALL render the dual-label bar with boundary-aligned date labels
