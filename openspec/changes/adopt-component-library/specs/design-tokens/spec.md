## ADDED Requirements

### Requirement: CSS Custom Property Design Tokens

The system SHALL define all color values as CSS custom properties in HSL format within `index.css`, replacing the current hardcoded hex values (#0f1117, #1a1d27, #2e303a, #6366f1, #818cf8, #9ca3af, etc.). These variables SHALL be defined under `:root` and referenced by both Tailwind v4's `@theme` directive and shadcn/ui components.

#### Scenario: All hardcoded colors are centralized
- **WHEN** the design tokens are defined
- **THEN** no Tailwind arbitrary values (e.g., `bg-[#1a1d27]`, `text-[#9ca3af]`) SHALL remain in the codebase; all color references SHALL use CSS variables like `bg-background`, `text-foreground`, `border-border`

#### Scenario: Design tokens work with Tailwind v4 @theme directive
- **WHEN** Tailwind processes the CSS
- **THEN** the `@theme` block SHALL map CSS custom properties to Tailwind utility names (e.g., `--color-background: var(--background)`) so utilities like `bg-background` resolve correctly

#### Scenario: Dark mode tokens are defined
- **WHEN** CSS custom properties are defined
- **THEN** all color variables SHALL be set with dark-mode-appropriate values under `:root` (since the app is dark-only), and the `color-scheme: dark` declaration SHALL be preserved

---

### Requirement: shadcn/ui Theme Variable Mapping

The system SHALL define shadcn/ui's standard theme CSS variables (--background, --foreground, --card, --card-foreground, --primary, --primary-foreground, --muted, --muted-foreground, --border, --input, --ring) mapped to the app's current color palette converted to HSL format.

#### Scenario: Primary color matches current indigo accent
- **WHEN** the theme variables are defined
- **THEN** `--primary` SHALL be set to the HSL equivalent of #6366f1 (indigo-500), and `--primary-foreground` SHALL be set to a contrasting light color for text on primary backgrounds

#### Scenario: Background color matches current dark background
- **WHEN** the theme variables are defined
- **THEN** `--background` SHALL be set to the HSL equivalent of #0f1117, and `--card` SHALL be set to the HSL equivalent of #1a1d27

#### Scenario: Border and muted colors match current values
- **WHEN** the theme variables are defined
- **THEN** `--border` SHALL be set to the HSL equivalent of #2e303a, and `--muted-foreground` SHALL be set to the HSL equivalent of #9ca3af

---

### Requirement: Component Token Usage

All UI components (both shadcn/ui components and remaining custom components) SHALL reference design token CSS variables rather than hardcoded color values. Any new component added to the project SHALL follow this pattern.

#### Scenario: Custom Layout component uses design tokens
- **WHEN** the Layout component renders
- **THEN** all color references SHALL use CSS variables (e.g., `bg-background`, `border-border`, `text-muted-foreground`) instead of hardcoded hex values

#### Scenario: shadcn/ui components use theme automatically
- **WHEN** shadcn/ui components render
- **THEN** they SHALL automatically use the defined CSS variable theme without additional configuration