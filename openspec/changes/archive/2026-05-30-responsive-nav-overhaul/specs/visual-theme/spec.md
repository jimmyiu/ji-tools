## MODIFIED Requirements

### Requirement: Background Surface Color

The application background SHALL use a deep purple-tinted dark color. The hue SHALL be in the blue-purple range (approximately 260-270°) with chroma between 0.02 and 0.04, giving a perceptible purple tint distinguishable from pure gray.

#### Scenario: Default background renders as purple-tinted dark
- **WHEN** the application renders any page
- **THEN** the `--background` CSS variable SHALL be a purple-tinted dark color (e.g., approximately `#1a1a2e`)

---

### Requirement: Card Elevation

Card surfaces SHALL be visually distinct from the background by having noticeably higher lightness with a purple tint. The card color SHALL be noticeably different from the background, maintaining the elevation hierarchy.

#### Scenario: Card surfaces float above background
- **WHEN** a card component renders
- **THEN** the `--card` CSS variable SHALL be a purple-tinted surface color (e.g., approximately `#252540`)
- **THEN** `--card` lightness SHALL be at least 0.03 higher than `--background` lightness

---

### Requirement: Border Visibility

Borders SHALL be visible but subtle, using a purple-tinted color. The border lightness SHALL be at least 0.015 higher than input.

#### Scenario: Borders outline surfaces clearly
- **WHEN** a bordered element renders
- **THEN** the `--border` CSS variable SHALL be approximately `#333` or equivalent purple-tinted dark surface

---

### Requirement: Muted Foreground and Input Surfaces

Muted foreground text SHALL be easily readable against the background. Input surfaces SHALL be distinguishable from cards. All token colors SHALL have a consistent purple tint throughout the palette.

#### Scenario: Muted text is readable
- **WHEN** muted text renders
- **THEN** the `--muted-foreground` color SHALL be approximately `#888` or equivalent, maintaining WCAG readability

---

### Requirement: No Hardcoded Color Values in Components

All color references in React components SHALL use CSS custom property-based Tailwind classes (e.g., `text-foreground`, `bg-card`, `border-border`). The class `text-white` SHALL NOT be used anywhere in component code. For text on `bg-primary` backgrounds, `text-primary-foreground` SHALL be used instead.

#### Scenario: No text-white in component files
- **WHEN** any `.tsx` file is checked
- **THEN** the string `text-white` SHALL NOT appear in any className

#### Scenario: Text on primary backgrounds uses primary-foreground
- **WHEN** a button or element has `bg-primary` as background
- **THEN** its text color class SHALL be `text-primary-foreground`, not `text-white`

---

### Requirement: Primary CTA Color

Primary call-to-action elements SHALL use an indigo/purple color that is visually prominent against the dark purple-tinted background.

#### Scenario: Primary buttons render in purple
- **WHEN** a primary button renders
- **THEN** the `--primary` CSS variable SHALL be approximately `#8b5cf6` or equivalent vivid purple

---

### Requirement: Elevation Hierarchy

All surface-level CSS variables SHALL follow a monotonic lightness ladder where each token is strictly lighter than the previous: background < card < input < border. The purple tint SHALL be consistent across all surfaces.

#### Scenario: Lightness ladder is monotonic
- **WHEN** any page renders
- **THEN** `--background` lightness < `--card` lightness < `--input` lightness < `--border` lightness
- **THEN** all surface tokens SHALL share a consistent purple hue