# currency-toggle Specification

## Purpose
TBD - created by archiving change global-ui-ux-overhaul. Update Purpose after archive.
## Requirements
### Requirement: Currency toggle displays HKD and USD rates simultaneously
The system SHALL display both HKD and USD actual equivalent annual interest rates side by side at the top of the MarathonSavings page.

#### Scenario: Both currencies visible on page load
- **WHEN** the MarathonSavings page loads
- **THEN** both HKD and USD rates SHALL be visible as two side-by-side cards

#### Scenario: Rates update with latest calculation
- **WHEN** the user modifies any input parameter
- **THEN** both HKD and USD rates SHALL reflect the recalculated values

### Requirement: Currency selection via radio dot toggle
The system SHALL allow the user to select the active currency by tapping either card. The active card SHALL display a filled radio dot (12px) at top-right with 8px inset from top and right edges. The inactive card SHALL display an outline radio dot (12px, 2px stroke).

#### Scenario: Tap to switch currency
- **WHEN** the user taps the inactive currency card
- **THEN** that card becomes active (filled dot, primary border, primary bg tint) and the previously active card becomes inactive (outline dot, subtle border, dimmed at 0.5 opacity)

#### Scenario: Active state has primary border and tint
- **WHEN** a currency card is active
- **THEN** it SHALL have `border-primary` (2px) and `bg-primary/5` background

#### Scenario: Inactive state has subtle border and dimmed
- **WHEN** a currency card is inactive
- **THEN** it SHALL have `border-border` (1px) and `opacity-50`

### Requirement: Currency toggle filters all page content
The selected currency SHALL filter the phase rate timeline, interest calculations, and interest breakdown table on the same page.

#### Scenario: Switching currency recalculates results
- **WHEN** the user switches from HKD to USD
- **THEN** phase rates, interest calculations, and totals SHALL update to reflect USD rates and 360-day convention

#### Scenario: Currency indicator updates on amounts
- **WHEN** the active currency changes
- **THEN** all monetary amounts SHALL use the corresponding prefix (HK$ or US$)

### Requirement: Currency dropdown removed from form
The "存款貨幣" SelectField SHALL be removed from BasicParameters. Currency state SHALL be controlled exclusively by the hero toggle.

#### Scenario: No currency selector in deposit settings
- **WHEN** the user views the deposit settings section
- **THEN** there SHALL be no currency selector dropdown visible

