# Fix: Consistent Bottom Spacing & Bottom Bar Stacking

## Problem

Three interrelated issues in the mobile layout:

1. **Expanding gap**: When the browser chrome hides (giving more viewport), the gap between the last content card and the bottom nav stretches. Caused by `flex-1` on `<main>` inside a `min-h-[100dvh]` container — main stretches to fill viewport, inflating `pb-[72px]`.

2. **InstallBanner overlays TabBar**: Both use `fixed bottom-0` with different z-indices, causing the banner to cover the tab bar entirely.

3. **Missing safe-area handling**: `pb-[72px]` on main doesn't include `env(safe-area-inset-bottom)`, so on devices with safe-area insets, content can overlap the TabBar.

## Desired Behavior

- The gap between last content and the bottom bar zone is always a fixed 16px, regardless of browser chrome state or app mode.
- When the browser chrome hides, the user sees more content naturally — no rubber-band gap expansion.
- InstallBanner sits above TabBar (not overlapping it).
- TabBar stays anchored to the bottom edge of the screen.
- Safe-area insets are accounted for everywhere.

## Approach: CSS-only with dvh units + dynamic CSS variables

Minimal JS changes. Keep body as the scroll container. Remove the `flex-1` stretch, use a CSS custom property for dynamic bottom padding, and reposition the fixed elements.

### Visual Stack (bottom of screen, top to bottom)

```
[Content]
[Spacing — paddingBottom on <main>, always 16px]
[InstallBanner — fixed, bottom: calc(56px + env(safe-area-inset-bottom))]
[TabBar — fixed bottom-0, paddingBottom: env(safe-area-inset-bottom)]
```

## Changes

### Layout.tsx

- Remove `flex-1` from `<main>`. Keep `page-enter`.
- Move `useInstallPrompt` call from `InstallBanner` to `Layout` so Layout can read `canInstall`.
- Add `useLayoutEffect` + ref on `InstallBanner` to measure its rendered height when visible.
- Set a CSS custom property `--bottom-offset` on the outer `<div>`:
  - When banner visible: `16px (spacing) + bannerHeight + 56px (TabBar) + env(safe-area-inset-bottom)`
  - When banner hidden: `16px (spacing) + 56px (TabBar) + env(safe-area-inset-bottom)`
- Set `<main>` style: `paddingBottom: var(--bottom-offset)`.
- Pass `canInstall`, `dismiss`, `install`, `isIOS` as props to `InstallBanner`.

### InstallBanner.tsx

- Change from `fixed bottom-0` to `fixed`, with `bottom: calc(56px + env(safe-area-inset-bottom))` — sits above TabBar.
- Accept `canInstall`, `dismiss`, `install`, `isIOS` as props instead of using `useInstallPrompt` internally.
- Add a `ref` callback so Layout can measure the banner's rendered height.
- Remove `useInstallPrompt` import.

### TabBar.tsx

- No structural changes. Stays `fixed bottom-0` with `paddingBottom: env(safe-area-inset-bottom)`.

### useScrollPosition.ts

- No changes. Body remains the scroll container, so `window.scrollY` still works.

### index.css, App.tsx, Home.tsx, other pages

- No changes needed.

## Not in Scope

- Page transition scroll restoration.
- Changes to header/scroll collapse behavior.
- Responsive design beyond the mobile bottom bar.