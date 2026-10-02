# ji-tools

Hong Kong-focused, mobile-first calculators for FX deposit comparison and marathon savings.

## Project conventions

- The UI is Traditional Chinese (`zh-Hant`) and dark-only. Preserve mobile safe-area and touch behavior, and the `/ji-tools/` GitHub Pages base, when changing the app shell or routing.
- Use `pnpm` for project commands and dependency updates.
- For features gated by browser or system events (such as PWA updates or install prompts), add a Settings developer toggle so the state can be tested on demand.
- Use emoji for avatar placeholders instead of remote avatar URLs.
- Use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, `refactor:`, etc.). Keep development fixups one-line and squash-merge feature branches; a merge commit may include a summary body.

## Calculations and tests

- Keep formulas and calculations as pure functions in `src/lib/`. Hooks own UI state and compose these functions rather than duplicating logic.
- `DAY_BASE_MAP` in `src/lib/calculator.ts` is the source of truth for day-count bases: HKD uses 365 days and USD uses 360.
- Keep intermediate Decimal calculations at 40-digit precision; assert calculation results to 8 decimal places with `toBeCloseTo(expected, 8)`.
- Turn explicit calculation rules into standalone pure functions with parameterized unit tests before adding rendering.
- For TDD refactors, test the new location first (RED), implement it (GREEN), then update callers and remove the old implementation (REFACTOR).
- With `erasableSyntaxOnly`, declare class fields explicitly rather than using constructor parameter properties. In `it.each`, use mutable test-data arrays when consumers require them; avoid `as const` in that case.

## UI consistency

### Theme

- Use semantic color tokens from `src/index.css`; add a token there when existing tokens do not fit. Avoid hardcoded palette colors and redundant `dark:` variants.
- Put values requiring `env()` or responsive `calc()` in CSS custom properties in `src/index.css`, with media queries as needed, instead of scattering inline styles.

### Sections and cards

- Give every major section its own `px-4 py-4` wrapper. Section containers have no vertical margins.
- Use `<SectionHeader>` for every section title; pass supplementary text and controls through its `description` and `action` props.
- Separate sections with `<SectionSeparator />`. In multi-column desktop layouts, use `className="lg:hidden"` when a divider should appear only on mobile. Dividers within a section are fine.
- Put card styling inside the section wrapper so outer section spacing stays consistent; give the inner card its own padding, border, background, and radius.

### Fields

- Use the shared field components in `src/components/` rather than creating page-specific fields.
- Keep fields in the floating-label bounded-box style: `bg-input/30 border border-border rounded-lg`, a muted `text-[10px]` label, a prominent `text-base font-semibold` value, hover/focus border and ring feedback, and identical heights across field types.

## State and workflow

- When a toggle appears in both persistent UI and Settings, share state through React context rather than coordinating through localStorage and custom events.
- Set optimistic UI state before starting async work so the interface responds even if the operation stalls.
- CSS-only changes to theme variables in `.dark` may skip worktree isolation; use isolation for JavaScript, TypeScript, or behavior changes.
