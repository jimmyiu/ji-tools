# iOS Form Layout Fix — Design Spec

**Date:** 2026-05-31
**Status:** Draft
**Author:** Jimmy + AI

## Problem Statement

Form input fields (specifically `type="date"`) overflow their parent containers and overlap adjacent elements in side-by-side grid layouts on iOS devices. The UI renders correctly on desktop browsers and mobile simulators. Root cause: iOS Safari injects native chrome (calendar icon, date format padding) into `<input type="date">` that has a minimum intrinsic width overriding CSS `w-full`, causing grid children to overflow their columns.

## Scope

Minimal global fix at the base `Input` component level, plus a defensive CSS reset in `index.css`. No per-page or per-form patches — the fix propagates to all forms automatically.

## Design Decisions

### 1. Base Input Component (`src/components/ui/input.tsx`)

Add `appearance-none` to the existing className string:

```tsx
"h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm bg-input/30 disabled:bg-input/80 aria-invalid:border-destructive/50 aria-invalid:ring-destructive/40 appearance-none"
```

**Why global (not date-only):** `type="number"` inputs also have native stepper UI on iOS that adds ~16px of extra width — could cause the same bleed in tight `grid-cols-2` layouts. Applying `appearance-none` globally proactively prevents this. All our inputs are fully custom-styled (border, bg, padding), so OS-native appearance has no design value. The native date picker still opens on tap; only the visual calendar icon is removed.

**`min-w-0` is already present** in the base Input class list — no additional class needed for flex/grid shrink behavior.

### 2. DateField Component (`src/components/DateField.tsx`)

**No changes needed.** The existing layout (`flex flex-col h-full` wrapper + `flex-1` on Input) works correctly once `appearance-none` removes iOS's intrinsic width override. The base Input already provides `min-w-0` and `w-full`.

### 3. Global CSS Reset (`src/index.css`)

Add a defensive reset in the existing `@layer base` block:

```css
input[type="date"] {
  min-width: 0;
  max-width: 100%;
}
```

Belt-and-suspenders — ensures any date input rendered outside the Input component is also constrained. No behavior change for properly-wired components.

## Files Changed

| File | Change | Type |
|------|--------|------|
| `src/components/ui/input.tsx` | Add `appearance-none` to className | Edit |
| `src/index.css` | Add `input[type="date"]` reset in `@layer base` | Edit |

## Verification

- `pnpm build` — must pass TypeScript + Vite build
- `pnpm test` — must pass Vitest suite (no logic changes, but regression check)
- Visual: form fields in `PhaseRateEditForm` (grid-cols-2 date pair) and `FxDepositCompare` (grid-cols-2 date row) must not overflow on iOS Safari/Chrome/PWA
