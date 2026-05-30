# scroll-header-collapse Specification

## Purpose

Defines the scroll-driven header collapse behavior: the page title shrinks from a large hero-style heading to a compact bar as the user scrolls down, with smooth interpolation of visual properties and dynamic `top` offset for banner-aware sticky positioning.

## Requirements

### Requirement: Scroll-Driven Header Collapse

The header SHALL smoothly interpolate its visual properties based on `scrollProgress`. The large title state (progress 0) and the compact title state (progress 1) SHALL be rendered by a single header element whose `font-size`, `padding-top`, `padding-bottom`, and `border-bottom` opacity transition continuously based on scroll position. The header SHALL also have a dynamic `top` style property set to `${totalBannerHeight}px` when banners are visible, so the header sticks below the banner area. The outer `<header>` element SHALL have `paddingLeft: var(--nav-left-offset)` on desktop viewports (NOT the inner max-w-5xl container, which must preserve its `px-4` padding on mobile). The header SHALL NOT have CSS `transition` on padding (to avoid conflict with JS-driven scroll animation).

#### Scenario: Header fully expanded at scroll top
- **WHEN** `scrollProgress` is 0 and no banners are visible
- **THEN** the header SHALL display the title at `2rem` font-size with expanded vertical padding, no bottom border, and `top: 0px`

#### Scenario: Header fully collapsed at scroll threshold
- **WHEN** `scrollProgress` is 1
- **THEN** the header SHALL display the title at `1rem` font-size with compact vertical padding, and a visible bottom border

#### Scenario: Header with visible banners
- **WHEN** banners are visible with `totalBannerHeight` of N pixels
- **THEN** the header SHALL have `style={{ top: N }}` so it sticks below the banner area

#### Scenario: Header inner container has left offset on desktop
- **WHEN** viewport width is 1024px or greater
- **THEN** the outer `<header>` element SHALL have `paddingLeft: var(--nav-left-offset)` (80px), preserving the inner container's `px-4` padding

#### Scenario: Header with no banners
- **WHEN** no banners are visible (totalBannerHeight is 0)
- **THEN** the header SHALL have `top: 0px` (or no top offset applied)

---

### Requirement: Continuous Scroll Progress

The `useScrollPosition` hook SHALL return a `scrollProgress` value in the range [0, 1] representing how far the user has scrolled relative to the collapse threshold. A value of 0 means no scroll (header fully expanded), and a value of 1 means scroll has reached or exceeded the threshold (header fully collapsed). This requirement is unchanged from the previous specification.

#### Scenario: Scroll progress 0 at top of page
- **WHEN** the page is at scroll position 0
- **THEN** `scrollProgress` SHALL equal `0`

#### Scenario: Scroll progress increases with scroll distance
- **WHEN** the user scrolls down the page
- **THEN** `scrollProgress` SHALL increase proportionally toward `1`

#### Scenario: Scroll progress saturates at 1
- **WHEN** scroll distance reaches or exceeds the collapse threshold (44px)
- **THEN** `scrollProgress` SHALL equal `1`

---

### Requirement: Single Header Element

The scroll-driven collapse SHALL be achieved through inline style interpolation on a single header element, not through CSS class toggling or multiple header instances. The interpolation granularity SHALL be determined by the `lerp` (linear interpolation) utility. The existing `lerp` function SHALL be preserved.

#### Scenario: CSS classes are not toggled
- **WHEN** the user scrolls
- **THEN** the header SHALL NOT change CSS classes — only inline styles SHALL change
- **THEN** the header SHALL remain a single element in the DOM

---

### Requirement: RequestAnimationFrame-Throttled Updates

The scroll event handler SHALL be throttled using `requestAnimationFrame` for smooth visual updates without excessive re-layout. The hook SHALL use `useState` with `useEffect` and `requestAnimationFrame` for throttling.

#### Scenario: Scroll handler uses rAF throttling
- **WHEN** the user scrolls
- **THEN** the scroll progress update SHALL be scheduled via `requestAnimationFrame`

---

### Requirement: Backward Compatible Return Type

The `useScrollPosition` hook SHALL maintain backward compatibility with existing callers that destructure `{ scrollProgress }`.

#### Scenario: Return type provides scrollProgress
- **WHEN** a component calls `useScrollPosition(44)`
- **THEN** it SHALL receive an object with `scrollProgress` property
