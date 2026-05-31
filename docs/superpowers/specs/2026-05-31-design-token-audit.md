# Design Token Audit & Alignment — Design Spec

**Date:** 2026-05-31
**Status:** Draft
**Author:** Jimmy + AI

## Problem Statement

The Dialog and Sheet components (used in the Marathon Savings edit flow) use `bg-background` as their content background, while every other floating card on the page uses `bg-card`. In the dark theme these are different shades (`oklch(0.13 …)` vs `oklch(0.17 …)`), creating a visual disconnect where modals/drawers appear darker than the cards stacked above them.

A broader audit of the codebase reveals additional instances of hardcoded Tailwind color literals (`green-500`, `red-400`, `purple-200`, `white`, `black`) and inline `rgba()` values that bypass the project's design token system.

## Scope

Align all component styling with the project's CSS custom property tokens defined in `src/index.css`. Three categories of change:

1. **Container backgrounds** — Dialog, Sheet content bg → `bg-card`
2. **Semantic token replacement** — Add `--positive` / `--negative` / `--tab-bar-shadow` tokens; replace hardcoded green/red/purple/white with token references
3. **Dead code removal** — Strip redundant `dark:` modifiers from shadcn UI components (project is dark-only)

## Design Decisions

### 1. New CSS Variables (`src/index.css`)

```css
--positive: oklch(0.6 0.18 150);
--positive-foreground: oklch(0.98 0 0);
--negative: oklch(0.6 0.2 25);     /* same as --destructive */
--negative-foreground: oklch(0.98 0 0);
--tab-bar-shadow: 0 -4px 12px 0 oklch(0 0 0 / 0.3);
```

`--negative` aliases `--destructive` — no need for a different red hue. `--positive` is a new semantic green matching the app's visual language. Tokens added to the `.dark` block and `@theme inline`.

### 2. Dialog & Sheet Content

- `bg-background` → `bg-card` in `DialogContent` and `SheetContent`
- Overlay `bg-black/80` is kept as-is — the overlay is a backdrop dimmer, not a content surface; using `bg-background` would produce a too-subtle dim on dark screens

### 3. TabBar

- `border-white/10` → `border-border/10`
- Inline arbitrary shadow `shadow-[0_-4px_12px_0_rgba(0,0,0,0.3)]` → `shadow-tab-bar` (references CSS var)

### 4. PhaseRateTimeline

The phase bar uses a dynamic opacity `rgba(124, 58, 237, opacity)` inline style. Replace with CSS [`color-mix()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) to blend the `--color-primary` token with transparency at runtime:

```ts
backgroundColor: `color-mix(in oklab, var(--color-primary) ${opacity * 100}%, transparent)`
```

This keeps the dynamic opacity behavior while referencing the design token.

Other changes:
- `text-purple-200` → `text-primary-foreground`
- `text-green-300` → `text-positive`

### 5. HeroMetrics (USD card)

- `border-green-500/30 bg-green-500/5` → `border-positive/30 bg-positive/5`

### 6. FxDepositCompare (win/loss display)

All conditional green/red styling replaced with `positive` / `negative` tokens:
- Badge bg/text: `bg-positive/15 text-positive` / `bg-negative/15 text-negative`
- Card border/bg: `border-positive/30 bg-positive/5` / `border-negative/30 bg-negative/5`
- Difference amount: `text-positive` / `text-negative`

### 7. Redundant `dark:` modifiers

Strip from `input.tsx`, `select.tsx`, `tabs.tsx`. In a dark-only project every `dark:X` class is always active — the base class alone suffices. Examples:

- `dark:bg-input/30` → `bg-input/30` (the base already targets the dom in dark mode)
- `dark:text-muted-foreground` → already `text-muted-foreground`

### 8. AGENTS.md Retrospective

Append a principle capturing the pattern:

> **When adding new UI components or customizing library primitives** → Never use hardcoded color literals (Tailwind palette colors, inline rgba/hex). Always reference the project's CSS custom property tokens (`bg-card`, `border-border`, `text-foreground`, etc.) or define new semantic tokens in `index.css` when no existing token fits.

## Files Changed

| File | Change |
|------|--------|
| `src/index.css` | Add `--positive`, `--negative`, `--tab-bar-shadow` tokens |
| `src/components/ui/dialog.tsx` | `bg-background` → `bg-card` |
| `src/components/ui/sheet.tsx` | `bg-background` → `bg-card` |
| `src/components/ui/input.tsx` | Strip redundant `dark:` |
| `src/components/ui/select.tsx` | Strip redundant `dark:` |
| `src/components/ui/tabs.tsx` | Strip redundant `dark:` |
| `src/components/TabBar.tsx` | Tokenize border & shadow |
| `src/components/PhaseRateTimeline.tsx` | Tokenize colors, inline style |
| `src/components/HeroMetrics.tsx` | Tokenize USD card colors |
| `src/pages/FxDepositCompare.tsx` | Tokenize win/loss display |
| `AGENTS.md` | Add retrospective principle |

## Risks & Mitigations

- **`color-mix()` browser support** — Supported in all modern browsers (Chrome 111+, Safari 16.2+, Firefox 113+). No polyfill needed for this project's target audience (Hong Kong users on recent devices).
- **`dark:` modifier stripping** — Pure code cleanup with zero visual impact since the dark class is always present on `<html>`. Verify by ensuring no light-mode toggle exists (it doesn't).
- **`--positive` / `--negative` naming** — Check no conflicts with existing tokens. `--positive` and `--negative` are unused, confirmed by grep.
