## Context

The project uses Tailwind v4 with CSS custom property tokens defined in `src/index.css` under `.dark` and `@theme inline`. All shadcn/ui components reference these tokens. However, several components bypass the token system with hardcoded Tailwind palette colors (`green-500`, `red-400`, `purple-200`, `white`, `black`) and inline `rgba()` values. The Dialog and Sheet content containers use `bg-background` (page canvas) instead of `bg-card` (card surface), breaking the elevation hierarchy.

Existing specs (`visual-theme`, `design-tokens`) already require token-only styling — this change enforces compliance.

## Goals / Non-Goals

**Goals:**
- Replace all hardcoded color literals in component files with CSS custom property references
- Fix Dialog/Sheet container bg to match card surfaces (`bg-background` → `bg-card`)
- Add `--positive`, `--positive-foreground`, `--negative`, `--negative-foreground`, `--tab-bar-shadow` CSS variables for green/red and the TabBar shadow
- Strip redundant `dark:` modifiers from shadcn UI components
- Update AGENTS.md with a retrospective principle

**Non-Goals:**
- No new component architecture or layout changes
- No changes to the color palette values themselves (only how they're referenced)
- No behavioral or logic changes

## Decisions

**1. Dialog/Sheet overlay keeps `bg-black/80`** — The overlay is a backdrop dimmer, not a content surface. Using `bg-background` would produce a too-subtle dim on dark screens. Keeping `bg-black/80` is conventional and functionally correct.

**2. `color-mix()` for dynamic opacity on primary** — The PhaseRateTimeline phase bar uses a dynamic opacity value with a purple color. Replacing the inline `rgba(124, 58, 237, opacity)` with `color-mix(in oklab, var(--color-primary) X%, transparent)` keeps the dynamic opacity behavior while referencing the design token. Supported in all modern browsers (Chrome 111+, Safari 16.2+, Firefox 113+).

**3. New CSS variables** — Five new tokens added to `.dark` and `@theme inline`:

| Variable | Value |
|----------|-------|
| `--positive` | `oklch(0.6 0.18 150)` |
| `--positive-foreground` | `oklch(0.98 0 0)` |
| `--negative` | `oklch(0.6 0.2 25)` (same as `--destructive`) |
| `--negative-foreground` | `oklch(0.98 0 0)` |
| `--tab-bar-shadow` | `0 -4px 12px 0 oklch(0 0 0 / 0.3)` |

`--negative` is a standalone variable (not a `var(--destructive)` alias) to avoid fragile references. Foreground tokens follow the established pattern of `--primary-foreground` and `--destructive-foreground`.

**4. Strip `dark:` modifiers directly** — In a dark-only project every `dark:X` class is always active. Replacing `dark:bg-input/30` with `bg-input/30` (and removing overridden light-mode base classes) produces identical visual output with smaller CSS and no false specificity. The impact is zero-risk since there is no light-mode toggle.

## Risks / Trade-offs

- **[Low] `color-mix()` is new CSS** → Supported in Chrome 111+, Safari 16.2+, Firefox 113+. No polyfill is needed for this project's target audience.
- **[None] `dark:` modifier removal** → Pure code cleanup. Light mode doesn't exist. Verified by grep for `color-scheme` and absence of any light-mode toggle.
