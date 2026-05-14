# Scroll UX Enhancement Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development
> to implement this plan task-by-task.

**Goal:** Fix inconsistent scroll behavior across the app by locking short pages from bouncing and making the header collapse smoothly scroll-driven on long pages.

**Architecture:** Two new React hooks (`useScrollLock` and upgraded `useScrollPosition`) power the changes. `useScrollLock` uses ResizeObserver to detect when content fits the viewport and sets `overflow: hidden`. `useScrollPosition` returns continuous `scrollProgress` (0→1) instead of binary `isScrolled`. The Layout header renders a single animated element that interpolates styles based on scroll progress.

**Tech Stack:** React 19 hooks, ResizeObserver API, requestAnimationFrame, vitest, TailwindCSS v4

---

## Task 1: useScrollLock Hook

- [ ] **Step 1:** Create `src/hooks/useScrollLock.ts` with a hook that accepts a `React.RefObject<HTMLElement>`, sets up a `ResizeObserver` on the ref element, compares `scrollHeight` vs `clientHeight`, and sets/toggles `overflow: hidden` on `document.documentElement`. Use `useLayoutEffect` for initial evaluation and cleanup.
- [ ] **Step 2:** Create `src/hooks/useScrollLock.test.ts`. Test cases: (1) short page locks overflow, (2) long page allows scroll, (3) content resize re-evaluates, (4) hook cleanup restores original overflow. Use `jsdom` with `ResizeObserver` mock.
- [ ] **Step 3:** Run `npx vitest run src/hooks/useScrollLock.test.ts` and verify all tests pass.
- [ ] **Commit:** `feat: add useScrollLock hook for viewport overflow detection`

## Task 2: Upgrade useScrollPosition Hook

- [ ] **Step 1:** Update `src/hooks/useScrollPosition.ts` — change return type to `{ isScrolled: boolean; scrollProgress: number }`. Compute `scrollProgress = Math.min(1, Math.max(0, window.scrollY / threshold))`. Throttle scroll handler via `requestAnimationFrame` — store a `ticking` flag, only schedule one rAF per frame, read `scrollY` in the rAF callback.
- [ ] **Step 2:** Update `src/hooks/useScrollPosition.test.ts` — add tests for: `scrollProgress` is 0 when at top, 1 when at/beyond threshold, linearly interpolates between. Verify `isScrolled` still works as derived boolean.
- [ ] **Step 3:** Run `npx vitest run src/hooks/useScrollPosition.test.ts` and verify all tests pass.
- [ ] **Commit:** `feat: upgrade useScrollPosition to return continuous scrollProgress`

## Task 3: Animated Header in Layout

- [ ] **Step 1:** Update `src/components/Layout.tsx` — destructure `scrollProgress` from `useScrollPosition`. Add `useScrollLock` call with a ref to the `<main>` element. Replace the conditional header render (`isScrolled ? <compact> : <expanded>`) with a single `<header>` element that computes inline styles from `scrollProgress`.
- [ ] **Step 2:** Implement style interpolation in `Layout.tsx` — `fontSize` interpolates from `1.5rem` (text-2xl) to `1rem` (text-base), `paddingTop` and `paddingBottom` interpolate from expanded values to compact `h-11` height. Border-bottom opacity scales with `scrollProgress`. Compute these as JS values and apply via inline styles.
- [ ] **Step 3:** Add a `ref` to the `<main>` element in `Layout.tsx` and pass it to `useScrollLock`. Ensure `safe-area-inset-top` padding is preserved at the top of the header in both states.
- [ ] **Step 4:** Run `npx vitest run src/components/Layout.test.tsx` and verify existing tests still pass.
- [ ] **Commit:** `feat: smooth scroll-driven header collapse and scroll lock for short pages`

## Task 4: Verification

- [ ] **Step 1:** Run `npm run lint` and fix any issues.
- [ ] **Step 2:** Run `npm run test` and ensure all tests pass.
- [ ] **Step 3:** Build the project with `npm run build` and verify no TypeScript or Vite errors.
- [ ] **Step 4:** Visually verify — check that Home/Settings pages don't wobble, and that calculator pages have smooth scroll-driven header collapse.