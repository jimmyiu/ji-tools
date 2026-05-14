## 1. Scroll Lock Hook

- [x] 1.1 Create `useScrollLock` hook in `src/hooks/useScrollLock.ts` — ResizeObserver on main content area, compares `scrollHeight` vs `clientHeight`, sets `overflow: hidden` on `document.documentElement` when content fits
- [x] 1.2 Write unit tests for `useScrollLock` in `src/hooks/useScrollLock.test.ts` — test: short page gets locked, long page stays scrollable, resize re-evaluates lock, cleanup on unmount
- [x] 1.3 Integrate `useScrollLock` into `Layout.tsx` — call the hook (observes document.body for content changes)

## 2. Scroll Position Hook Upgrade

- [x] 2.1 Update `useScrollPosition` to return `scrollProgress` (0→1) alongside `isScrolled` — use `clamp(scrollY / threshold, 0, 1)`, throttle updates via `requestAnimationFrame`, keep backward-compatible `isScrolled` boolean
- [x] 2.2 Update `useScrollPosition.test.ts` — add tests for `scrollProgress` at 0, at threshold, between 0 and threshold, beyond threshold; verify `isScrolled` is derived correctly from `scrollProgress`

## 3. Animated Header Component

- [x] 3.1 Refactor `Layout.tsx` header from conditional rendering to single animated element — replace `isScrolled ? <compact> : <expanded>` with one `<header>` element whose `font-size`, `padding-top`, `padding-bottom` are computed from `scrollProgress` via interpolation
- [x] 3.2 Implement border-bottom visibility based on `scrollProgress` — fade in `border-b border-[#2e303a]` as progress goes from 0 to 1 using `opacity` on a pseudo-element or inline style
- [x] 3.3 Ensure `safe-area-inset-top` padding is preserved in both expanded and compact states

## 4. Integration & Verification

- [x] 4.1 Manual verification on short pages (Home, Settings) — confirm no scroll/wobble/bounce when content fits viewport
- [x] 4.2 Manual verification on long pages (FxDepositCompare, MarathonSavings) — confirm smooth scroll-driven header collapse, no layout shift or jank
- [x] 4.3 Verify header appearance matches current design in both expanded and fully collapsed states — same colors, typography, border
- [x] 4.4 Run `npm run lint` and `npm run test` to ensure no regressions