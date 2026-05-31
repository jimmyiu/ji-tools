## Why

The Dialog and Sheet components use `bg-background` as their content background while every other floating card uses `bg-card` — different shades in the dark theme create a visual disconnect. A broader audit reveals multiple instances of hardcoded Tailwind color literals (`green-500`, `red-400`, `purple-200`, `white`, `black`) and inline `rgba()` values that bypass the project's CSS custom property token system.

## What Changes

- Add `--positive`, `--positive-foreground`, `--negative`, `--negative-foreground`, `--tab-bar-shadow` CSS custom properties to `index.css`
- Fix Dialog and Sheet content background to use `bg-card`
- Replace hardcoded color literals in TabBar, PhaseRateTimeline, HeroMetrics, FxDepositCompare with design tokens
- Replace dynamic `rgba()` inline style in PhaseRateTimeline with `color-mix()` referencing `--color-primary`
- Strip redundant `dark:` modifiers from shadcn UI components (project is dark-only)
- Update AGENTS.md with retrospective principle

## Capabilities

### New Capabilities
- `design-token-audit`: Systematic audit and alignment of all component styling with the project's CSS custom property tokens and existing visual-theme/design-tokens specs

### Modified Capabilities
- None — existing `visual-theme` and `design-tokens` spec requirements are unchanged; this change enforces compliance

## Impact

- `src/index.css` — new CSS variables
- `src/components/ui/dialog.tsx` — bg token fix
- `src/components/ui/sheet.tsx` — bg token fix
- `src/components/ui/input.tsx`, `select.tsx`, `tabs.tsx` — strip redundant `dark:` modifiers
- `src/components/TabBar.tsx` — tokenize border and shadow
- `src/components/PhaseRateTimeline.tsx` — tokenize colors and inline style
- `src/components/HeroMetrics.tsx` — tokenize USD card
- `src/pages/FxDepositCompare.tsx` — tokenize win/loss display
- `AGENTS.md` — retrospective principle
