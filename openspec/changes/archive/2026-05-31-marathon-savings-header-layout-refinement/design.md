## Context

The Marathon Savings page uses two form block components — `BasicParameters` (read-only) and `EditableSection` (with edit toggle) — that currently have different header treatments. `BasicParameters` uses a standalone `<h2>` with bottom margin, while `EditableSection` uses a flex row with inline button. Both need a consistent, reusable header pattern.

The design spec document at `docs/superpowers/specs/2026-05-31-marathon-savings-header-and-layout-refinement-design.md` provides the exact implementation details.

## Goals / Non-Goals

**Goals:**
- Create a reusable `SectionHeader` component with accent bar, title, and optional action slot
- Unify header treatment across `BasicParameters` and `EditableSection`
- Improve mobile touch targets for `SelectItem` dropdown options
- Arrange currency + principal fields in a two-column grid for compact layout

**Non-Goals:**
- Changing FxDepositCompare page headers (keeps existing treatment)
- Modifying form field components (`InputField`, `SelectField`, `DateField`)
- Changing `BasicParameters` prop interface or consumer code

## Decisions

1. **SectionHeader as a dedicated component** — Extracting the header pattern into its own component ensures consistency and makes it easy for future card sections to adopt the same treatment. Alternative: keeping inline headers and just aligning CSS classes — rejected because it doesn't prevent drift.

2. **mb-5 built into SectionHeader** — The 20px bottom spacing between header and content is consistent across all card sections, so baking it into the component eliminates per-consumer margin adjustments.

3. **Accent bar via div, not CSS pseudo-element** — A simple `div` with fixed dimensions (`3px × 16px`) is more readable and easier to theme than `::before` pseudo-elements.

4. **Two-column grid for currency + principal** — These two fields are semantically related (currency defines the unit for the principal value) and visually benefit from side-by-side placement. The date field remains full-width above.

5. **SelectItem padding increase** — `py-2.5 pl-2.5 pr-10` provides adequate touch targets (44px+ height) for mobile users without affecting desktop layout significantly.

## Risks / Trade-offs

- **Risk**: `SectionHeader` mb-5 may not suit all future card sections → **Mitigation**: Low risk; 20px is the established rhythm. If a section needs different spacing, it can use negative margin or the component can accept an optional `className` override later.
- **Trade-off**: Grid layout may feel cramped on very narrow screens → **Mitigation**: The existing `gap-3` provides 12px gutter; form fields already handle overflow gracefully.
