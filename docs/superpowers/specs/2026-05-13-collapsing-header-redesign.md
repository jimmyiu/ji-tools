# Collapsing Header Redesign

## Problem

The current collapsing title implementation has a "jump" effect when scrolling. This is caused by two separate elements reacting to scroll position and fighting each other:

1. **CollapsingHeader** — a sticky header that appears (`max-h-0` → `max-h-20`) when scrolled past 44px
2. **Original title block in Layout** — disappears (`opacity-100` → `opacity-0 h-0`) when scrolled past 44px

Collapsing the original title removes layout space while the sticky header appears, creating a sudden content shift.

Additionally, the compact header uses `h-14` (56px) instead of Apple's recommended 44pt nav bar height, making it feel too tall relative to the dynamic island.

## Design

Replace the two-element swap with a **single sticky header** that smoothly transitions between "large title" and "compact bar" states.

### Layout structure

```html
<div class="min-h-screen flex flex-col">
  <header class="sticky top-0 z-30">
    <!-- single element, transitions between large and compact -->
  </header>
  <div class="h-[full-title-height]" /> <!-- static spacer -->
  <main class="flex-1">
    <Outlet />
  </main>
  <TabBar />
</div>
```

The spacer prevents content from being hidden behind the sticky header and ensures no layout shift.

### States

| State | Safe area padding | Content height | Details |
|---|---|---|---|
| Large (not scrolled) | `env(safe-area-inset-top)` | ~72pt | `text-2xl` font, includes subtitle |
| Compact (scrolled ≥44px) | `env(safe-area-inset-top)` | 44pt | `text-base` font, `h-11`, bottom border |

Both states use `transition-all duration-200` for smooth interpolation.

### Threshold

Same as current: 44px scroll distance triggers the transition, via the existing `useScrollPosition` hook.

## Changes

### Remove

- `src/components/CollapsingHeader.tsx` — deleted entirely

### Modify

- `src/components/Layout.tsx` — replace the two separate title blocks (collapsing original + CollapsingHeader) with a single `<header>` element that conditionally renders in large or compact mode based on `isScrolled`

### Keep

- `src/hooks/useScrollPosition.ts` — unchanged, threshold of 44px is fine

## Fallback

If smoothness isn't satisfactory on device testing, fall back to a static compact header (44pt bar always visible, no transitions).