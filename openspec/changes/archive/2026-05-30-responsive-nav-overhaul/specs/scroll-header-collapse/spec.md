## MODIFIED Requirements

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

The `useScrollPosition` hook SHALL return a `scrollProgress` value in the range [0, 1] representing how far the user has scrolled relative to the collapse threshold. This requirement is unchanged.

#### Scenario: Progress is 0 at top
- **WHEN** `window.scrollY` is 0
- **THEN** `scrollProgress` SHALL be 0

#### Scenario: Progress is 1 at or beyond threshold
- **WHEN** `window.scrollY` is greater than or equal to the collapse threshold (default 44px)
- **THEN** `scrollProgress` SHALL be 1

---

### Requirement: Single Header Element

The header MUST use a single DOM element for the title that smoothly scales between the large and compact states. The system SHALL NOT use conditional rendering or element swapping to achieve the collapse effect. This requirement is unchanged.

#### Scenario: No element swapping during scroll
- **WHEN** the user scrolls through the collapse threshold
- **THEN** the header title element SHALL remain the same DOM node throughout, with only its style properties changing

---

### Requirement: RequestAnimationFrame-Throttled Updates

Scroll-driven style updates MUST be throttled via `requestAnimationFrame` to prevent layout thrashing. This requirement is unchanged.

#### Scenario: Scroll events during animation frame
- **WHEN** multiple scroll events fire before the next animation frame
- **THEN** the system SHALL read `window.scrollY` once per frame and update style properties once per frame

---

### Requirement: Backward Compatible Return Type

The `useScrollPosition` hook SHALL continue to return `isScrolled` as a boolean alongside `scrollProgress`. This requirement is unchanged.

#### Scenario: isScrolled derived from scrollProgress
- **WHEN** `scrollProgress` is less than 1
- **THEN** `isScrolled` SHALL be `false`
- **WHEN** `scrollProgress` is 1 or greater
- **THEN** `isScrolled` SHALL be `true`