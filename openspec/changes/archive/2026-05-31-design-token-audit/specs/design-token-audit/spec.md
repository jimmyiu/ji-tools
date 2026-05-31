## ADDED Requirements

### Requirement: Dialog and Sheet use card background

The Dialog and Sheet content containers SHALL use the `--card` CSS custom property as their background color instead of `--background`, matching the elevation of other floating card surfaces in the application.

#### Scenario: Dialog content renders with card background
- **WHEN** a Dialog renders
- **THEN** the Dialog content container SHALL have a background using the `--card` token

#### Scenario: Sheet content renders with card background
- **WHEN** a Sheet renders
- **THEN** the Sheet content container SHALL have a background using the `--card` token

---

### Requirement: TabBar uses design tokens for border and shadow

The TabBar component SHALL use CSS custom property-based tokens for its top border and drop shadow, replacing hardcoded `white` and `rgba()` values.

#### Scenario: TabBar border uses border token
- **WHEN** the TabBar renders
- **THEN** its top border SHALL use the `--border` token at 10% opacity

#### Scenario: TabBar shadow uses design token
- **WHEN** the TabBar renders
- **THEN** its box shadow SHALL reference the `--tab-bar-shadow` custom property

---

### Requirement: PhaseRateTimeline uses design tokens for all colors

The PhaseRateTimeline component SHALL use design tokens for its phase bar background color, phase bar text, and phase rate text, replacing hardcoded `rgba()`, `purple-200`, and `green-300` values.

#### Scenario: Phase bar uses primary token with dynamic opacity
- **WHEN** a phase segment renders
- **THEN** its background color SHALL combine `--color-primary` with its dynamic opacity value using `color-mix()`

#### Scenario: Phase bar label uses primary-foreground
- **WHEN** the phase bar label text renders
- **THEN** it SHALL use `text-primary-foreground` instead of `text-purple-200`

#### Scenario: Phase rate text uses positive token
- **WHEN** a phase rate value renders
- **THEN** it SHALL use `text-positive` instead of `text-green-300`

---

### Requirement: HeroMetrics uses positive token for USD card

The USD rate card in HeroMetrics SHALL use the `--positive` design token instead of hardcoded `green-500`.

#### Scenario: USD card renders with positive tokens
- **WHEN** the USD card renders
- **THEN** its border and background SHALL use the `--positive` token at the appropriate opacities

---

### Requirement: FxDepositCompare uses semantic positive/negative tokens

The win/loss comparison display in FxDepositCompare SHALL use `--positive` and `--negative` design tokens instead of hardcoded `green-*` and `red-*` palette colors.

#### Scenario: Winning comparison renders with positive tokens
- **WHEN** USD wins and the result card renders
- **THEN** the badge SHALL use `--positive` at 15% opacity background and full opacity text
- **THEN** the card border SHALL use `--positive` at 30% opacity
- **THEN** the card background SHALL use `--positive` at 5% opacity
- **THEN** the difference amount SHALL use `--positive` at full opacity

#### Scenario: Losing comparison renders with negative tokens
- **WHEN** HKD wins and the result card renders
- **THEN** the badge SHALL use `--negative` at 15% opacity background and full opacity text
- **THEN** the card border SHALL use `--negative` at 30% opacity
- **THEN** the card background SHALL use `--negative` at 5% opacity
- **THEN** the difference amount SHALL use `--negative` at full opacity

---

### Requirement: shadcn UI components strip redundant dark: modifiers

The input, select, and tabs shadcn UI components SHALL NOT contain redundant `dark:` class variants, since the project is dark-only and `<html class="dark">` is always present.

#### Scenario: Input component has no dark: modifiers
- **WHEN** the input component file is checked
- **THEN** NO `dark:` prefixed class SHALL appear in its className string

#### Scenario: Select component has no dark: modifiers
- **WHEN** the select component file is checked
- **THEN** NO `dark:` prefixed class SHALL appear in its className string

#### Scenario: Tabs component has no dark: modifiers
- **WHEN** the tabs component file is checked
- **THEN** NO `dark:` prefixed class SHALL appear in its className string

---

### Requirement: New positive, negative, and shadow CSS variables

The system SHALL define `--positive`, `--positive-foreground`, `--negative`, `--negative-foreground`, and `--tab-bar-shadow` CSS custom properties in `src/index.css` under the `.dark` block, and map them in the `@theme inline` block for Tailwind utility use.

#### Scenario: Positive token is usable via Tailwind
- **WHEN** the CSS is processed
- **THEN** `bg-positive`, `text-positive`, `border-positive` SHALL resolve via `@theme inline`

#### Scenario: Positive foreground token is usable via Tailwind
- **WHEN** the CSS is processed
- **THEN** `text-positive-foreground` SHALL resolve via `@theme inline`

#### Scenario: Negative token is usable via Tailwind
- **WHEN** the CSS is processed
- **THEN** `bg-negative`, `text-negative`, `border-negative` SHALL resolve via `@theme inline`

#### Scenario: Negative foreground token is usable via Tailwind
- **WHEN** the CSS is processed
- **THEN** `text-negative-foreground` SHALL resolve via `@theme inline`

#### Scenario: Tab bar shadow token is usable via Tailwind
- **WHEN** the CSS is processed
- **THEN** `shadow-tab-bar` SHALL resolve via `@theme inline`

---

### Requirement: AGENTS.md contains retrospective principle

The AGENTS.md file SHALL contain a retrospective principle in the "Retrospective learning" section that codifies the rule of using design tokens instead of hardcoded color values when adding new components.

#### Scenario: Principle exists in AGENTS.md
- **WHEN** AGENTS.md is read
- **THEN** it SHALL contain a principle advising use of CSS custom property tokens over hardcoded color literals
