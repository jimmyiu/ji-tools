## ADDED Requirements

### Requirement: Background Surface Color
The application background SHALL use a deep slate color with OKLCH lightness between 0.11 and 0.12.
The background hue SHALL be 260° (blue-grey slate) with chroma no greater than 0.01.

#### Scenario: Default background renders as deep slate
- **WHEN** the application renders any page
- **THEN** the `--background` CSS variable SHALL be `oklch(0.115 0.006 260)` or perceptually equivalent

### Requirement: Card Elevation
Card surfaces SHALL be visually distinct from the background by having OKLCH lightness at least 0.03 higher than `--background`.
Card surfaces SHALL use the same 260° hue as the background with chroma no greater than 0.01.

#### Scenario: Card surfaces float above background
- **WHEN** a card component renders
- **THEN** the `--card` CSS variable SHALL be `oklch(0.155 0.008 260)` or perceptually equivalent
- **THEN** `--card` lightness SHALL be at least 0.03 higher than `--background` lightness

### Requirement: Input Field Distinction
Input fields SHALL be visually distinct from both cards and borders by having OKLCH lightness between `--card` and `--border`.

#### Scenario: Input surfaces are distinguishable from cards
- **WHEN** an input field renders
- **THEN** the `--input` CSS variable SHALL be `oklch(0.19 0.01 260)` or perceptually equivalent
- **THEN** `--input` lightness SHALL be between `--card` lightness and `--border` lightness

### Requirement: Border Visibility
Borders SHALL be visible but subtle, with OKLCH lightness at least 0.015 higher than `--input` and no higher than 0.25.

#### Scenario: Borders outline surfaces clearly
- **WHEN** a bordered element renders
- **THEN** the `--border` CSS variable SHALL be `oklch(0.21 0.008 260)` or perceptually equivalent

### Requirement: Primary CTA Color
Primary call-to-action elements SHALL use an indigo color with OKLCH hue 270° and chroma between 0.15 and 0.22.

#### Scenario: Primary buttons render in indigo
- **WHEN** a primary button renders
- **THEN** the `--primary` CSS variable SHALL be `oklch(0.53 0.19 270)` or perceptually equivalent

### Requirement: Focus Ring
The focus ring color SHALL match the primary CTA color for consistent interactive feedback.

#### Scenario: Focus rings use indigo
- **WHEN** an element receives keyboard focus
- **THEN** `--ring` SHALL equal `--primary` in value

### Requirement: Elevation Hierarchy
All surface-level CSS variables SHALL follow a monotonic lightness ladder where each token is strictly lighter than the previous: background < card < input < border.

#### Scenario: Lightness ladder is monotonic
- **WHEN** any page renders
- **THEN** `--background` lightness < `--card` lightness < `--input` lightness < `--border` lightness
