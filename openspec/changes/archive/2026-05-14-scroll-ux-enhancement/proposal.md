## Why

The app's scroll behavior is inconsistent across pages. Short pages (Home, Settings) wobble and bounce despite fitting the viewport, feeling unstable. Long pages (calculators) have an abrupt header snap at 44px that makes the title disappear instantly instead of smoothly collapsing. This makes the app feel cheap and users can lose context about which tool they're using when the title vanishes.

## What Changes

**Short Page Scroll Lock**
- From: All pages can scroll freely, including pages where content fits the viewport, causing rubber-banding/wobble on iOS
- To: Pages where content fits the viewport are scroll-locked (`overflow: hidden`), feeling solid and stable
- Reason: Short pages should not have any scroll behavior — it serves no purpose and degrades perceived quality
- Impact: Non-breaking; no functional content is hidden since it all fits

**Header Collapse Animation**
- From: Header title snaps instantly between large (text-2xl) and small (text-base) states at 44px scroll threshold via conditional rendering
- To: Header title smoothly interpolates size based on continuous scroll progress (0→1), tracking the user's scroll position directly
- Reason: Smooth scroll-driven collapse feels professional and maintains context; abrupt snap feels jarring
- Impact: Non-breaking; same visual end-states, just animated transition

## Capabilities

### New Capabilities
- `scroll-lock`: Locks scroll on pages where content fits the viewport, preventing bounce/wobble behavior
- `scroll-header-collapse`: Smooth scroll-driven header collapse animation that interpolates title size and padding based on continuous scroll progress

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Files changed**: `Layout.tsx`, `useScrollPosition.ts`, `useScrollPosition.test.ts`, `index.css`
- **New files**: `useScrollLock.ts`, `useScrollLock.test.ts`
- **Dependencies**: None new — uses existing ResizeObserver (browser API) and requestAnimationFrame
- **API changes**: `useScrollPosition` return type expands from `{ isScrolled: boolean }` to `{ isScrolled: boolean; scrollProgress: number }`
- **Browser support**: All target browsers (iOS Safari 15+, Chrome Android) — no experimental APIs used