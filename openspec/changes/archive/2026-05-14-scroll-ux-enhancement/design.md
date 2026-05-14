## Context

ji-tools is a React PWA (TailwindCSS + react-router-dom) targeting mobile users in Hong Kong. It has a Layout component with a sticky header that collapses on scroll, powered by a `useScrollPosition` hook returning a binary `isScrolled` boolean at 44px threshold. Short pages (Home, Settings) suffer from rubber-banding/wobble because the viewport scrolls even when content fits. Long pages (FxDepositCompare, MarathonSavings) have an abrupt header snap that makes the transition feel jarring.

The app uses: React 19, TailwindCSS v4, vite, react-router-dom v7, vitest for testing. Current files involved: `Layout.tsx`, `useScrollPosition.ts`, `useScrollPosition.test.ts`, `index.css`.

## Goals / Non-Goals

**Goals:**
- Lock short pages (content fits viewport) — no wobble, bounce, or unnecessary scroll
- Smoothly collapse header on long pages — title tracks scroll position continuously from large to compact, not a binary snap
- All pages follow identical scroll UX rules — consistent, professional feel
- Maintain existing compact header visual design — same colors, fonts, border, just animated instead of snapped
- Zero functional regressions — header collapses at same threshold, same final appearance

**Non-Goals:**
- Redesigning header visual appearance (colors, typography, layout)
- Adding new pages or navigation features
- Implementing pull-to-refresh or other gesture-based interactions
- Changing the tab bar or install banner behavior
- Supporting desktop scroll UX differently from mobile

## Decisions

### 1. Continuous `scrollProgress` over binary `isScrolled`

**Decision**: Upgrade `useScrollPosition` to return `scrollProgress: number` (0→1 range) alongside `isScrolled: boolean` for backward compatibility.

**Rationale**: Scroll-driven animation requires continuous values. A `scrollProgress` of 0.5 means "half collapsed" — the header can interpolate styles precisely. Keeping `isScrolled` avoids breaking any future code that might depend on the boolean.

**Alternative**: Keep `isScrolled` only and add CSS transitions. Rejected because threshold-triggered animation doesn't give 1:1 scroll feel.

### 2. Single animated header element over crossfade

**Decision**: One `<header>` with a single title element whose `font-size`, `padding-top`, and `padding-bottom` are computed from `scrollProgress` via inline styles.

**Rationale**: Crossfading two elements risks layout jumps and requires managing opacity on overlapping elements. A single element smoothly scaling is simpler, no layout instability, and fewer DOM nodes.

**Implementation**: Use `calc()` expressions or interpolation in JS:
- `fontSize`: lerp from `1.5rem` (text-2xl) to `1rem` (text-base) based on progress
- `paddingTop/Y`: lerp from expanded values to compact values
- `border-b`: conditional on `isScrolled` (opacity 0→1)

### 3. ResizeObserver-based scroll lock

**Decision**: New `useScrollLock` hook uses `ResizeObserver` on `<main>` content to compare `scrollHeight` vs `clientHeight`. When content fits, sets `overflow: hidden` on `<html>`.

**Rationale**: Route-based detection is fragile (new pages need manual classification) and doesn't handle dynamic content changes or orientation changes. ResizeObserver is reactive and handles all cases automatically.

**Alternative**: Route-based CSS classes. Rejected because it requires manual maintenance per route and doesn't handle dynamic content.

### 4. `requestAnimationFrame` for scroll performance

**Decision**: Use `requestAnimationFrame` to throttle scroll-driven style updates in `useScrollPosition`.

**Rationale**: Scroll events fire at high frequency. Batching style updates with rAF prevents layout thrashing while maintaining smooth 60fps animation.

### 5. CSS custom properties for interpolation

**Decision**: Set `--scroll-progress` as a CSS custom property on the header element, and use `calc()` in CSS where possible. Fall back to direct inline styles for properties that need it.

**Rationale**: CSS custom properties enable declarative styling in Tailwind/CSS with minimal JS. However, `font-size` and `padding` interpolation requires JS since Tailwind v4 doesn't have built-in CSS custom property interpolation for these.

## Risks / Trade-offs

- **[Risk] ResizeObserver not triggering on initial mount** → Mitigation: Also check on first render in a `useLayoutEffect`, and re-check when `canInstall`/banner changes affect layout height.
- **[Risk] Overscroll on iOS Safari with `overflow: hidden`** → Mitigation: The existing `overscroll-behavior-y: contain` in `index.css` already addresses this. The `overflow: hidden` lock prevents Scroll content from being scrollable at all, so there's nothing to overscroll.
- **[Risk] `font-size` interpolation causing layout thrashing** → Mitigation: Use `requestAnimationFrame` batching and `will-change: font-size, padding` for GPU compositing hints. Font-size changes are lightweight since they only affect one text node.
- **[Risk] Edge case: banner appearance/disappearance changes content height** → Mitigation: `useScrollLock` observes the `<main>` content area, and `useScrollPosition` already re-evaluates on each scroll frame. The `bannerHeight` state change in Layout triggers re-render which re-evaluates the lock.