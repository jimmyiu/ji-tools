## Design Summary

Scroll UX enhancement for ji-tools mobile PWA. Two problems to solve:

1. **Short pages wobble**: Home and Settings pages allow scroll/bounce even when content fits the viewport. These pages should be locked solid.
2. **Header snaps abruptly**: When scrolling long pages (calculators), the header title instantly switches from large to small at 44px threshold. Instead, it should smoothly collapse in direct response to scroll position.

**Agreed approach**: Scroll-driven continuous collapse (Approach B) + resize-aware scroll lock.

## Alternatives Considered

### 方案 A：CSS-only Fixes
- **做法**: Use CSS overflow hidden on short pages via route-based classes; crossfade two header elements with CSS transitions
- **优点**: Mostly CSS, minimal JS changes
- **缺点**: Crossfade can cause layout jumps; measuring content via CSS alone is error-prone; route-based classes are fragile
- **为何未採用**: Crossfade header approach has layout jump risk; route-based approach doesn't handle dynamic content changes

### 方案 B：Smooth Scroll Hook + Overflow Lock (Agreed)
- **做法**: Upgrade `useScrollPosition` to return continuous `scrollProgress` (0→1); add `useScrollLock` hook using ResizeObserver; single header element that smoothly scales with scroll progress
- **优点**: True 1:1 scroll-driven animation; handles all page types reactively; extensible for future animations; no browser compatibility issues
- **缺点**: Slightly more JS than pure CSS approach
- **为何採用**: Provides the best UX with scroll-driven responsiveness; same DOM API already in use; simple to implement

### 方案 C：Hybrid (Scroll Lock + Smooth Threshold Animation)
- **做法**: Keep binary `isScrolled` but add CSS transitions so the header smoothly animates when crossing 44px threshold
- **优点**: Smallest code change; keeps existing hook
- **缺点**: Animation triggered at threshold, not driven by scroll position; doesn't feel direct/1:1
- **为何未採用**: Doesn't meet the "smoothly shrink" requirement as well — user explicitly chose scroll-driven feel

## Agreed Approach

Scroll-driven continuous header collapse (Approach B):

1. **`useScrollLock`**: New hook using ResizeObserver on `<main>` content. When `scrollHeight <= clientHeight`, sets `overflow: hidden` on `<html>`. Reactively handles resize/orientation changes.
2. **`useScrollPosition` upgrade**: Returns `scrollProgress: number` (0→1) instead of just `isScrolled: boolean`. `progress = clamp(scrollY / 44, 0, 1)`. Kept `isScrolled` as a derived boolean for backward compatibility.
3. **Single animated header element**: Instead of conditional render of two elements, one `<header>` smoothly interpolates `font-size`, `padding-top`, `padding-bottom` based on `scrollProgress`. Uses inline styles computed from progress for 1:1 scroll tracking.

## Key Decisions

- **Scroll-driven over threshold-triggered**: User values the 1:1 scroll feel over simpler implementation
- **Single element over crossfade**: Simpler DOM, no layout jump risk, scales font-size/padding smoothly
- **Keep existing visual design**: Compact bar looks the same as current `isScrolled` state — just animated instead of snapped
- **ResizeObserver over route detection**: Handles dynamic content, orientation changes, and any future pages automatically
- **Backward compatible**: `isScrolled` boolean retained for any existing consumers

## Open Questions

None — all key decisions resolved during brainstorming.