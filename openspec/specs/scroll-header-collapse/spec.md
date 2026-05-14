# scroll-header-collapse Specification

## Purpose
TBD - created by archiving change scroll-ux-enhancement. Update Purpose after archive.
## Requirements
### Requirement: Continuous Scroll Progress

The `useScrollPosition` hook SHALL return a `scrollProgress` value in the range [0, 1] representing how far the user has scrolled relative to the collapse threshold. A value of 0 means no scroll (header fully expanded), and a value of 1 means scroll has reached or exceeded the threshold (header fully collapsed).

#### Scenario: Progress is 0 at top
- **WHEN** `window.scrollY` is 0
- **THEN** `scrollProgress` SHALL be 0

#### Scenario: Progress is 1 at or beyond threshold
- **WHEN** `window.scrollY` is greater than or equal to the collapse threshold (default 44px)
- **THEN** `scrollProgress` SHALL be 1

#### Scenario: Progress interpolates between 0 and threshold
- **WHEN** `window.scrollY` is between 0 and the threshold
- **THEN** `scrollProgress` SHALL equal `scrollY / threshold`, clamped to [0, 1]

---

### Requirement: Scroll-Driven Header Collapse

The header SHALL smoothly interpolate its visual properties based on `scrollProgress`. The large title state (progress 0) and the compact title state (progress 1) SHALL be rendered by a single header element whose `font-size`, `padding-top`, `padding-bottom`, and `border-bottom` opacity transition continuously based on scroll position.

#### Scenario: Header fully expanded at scroll top
- **WHEN** `scrollProgress` is 0
- **THEN** the header SHALL display the title at `2rem` (text-2xl equivalent) font-size with expanded vertical padding, and no bottom border

#### Scenario: Header fully collapsed at scroll threshold
- **WHEN** `scrollProgress` is 1
- **THEN** the header SHALL display the title at `1rem` (text-base equivalent) font-size with compact vertical padding equal to `h-11` (2.75rem total header height), and a `border-b border-[#2e303a]`

#### Scenario: Header interpolates during scroll
- **WHEN** `scrollProgress` is between 0 and 1 (e.g., 0.5)
- **THEN** the header font-size SHALL be linearly interpolated between 2rem and 1rem, padding between expanded and compact values, and the bottom border opacity SHALL scale with progress

---

### Requirement: Single Header Element

The header MUST use a single DOM element for the title that smoothly scales between the large and compact states. The system SHALL NOT use conditional rendering or element swapping to achieve the collapse effect.

#### Scenario: No element swapping during scroll
- **WHEN** the user scrolls through the collapse threshold
- **THEN** the header title element SHALL remain the same DOM node throughout, with only its style properties changing

---

### Requirement: RequestAnimationFrame-Throttled Updates

Scroll-driven style updates MUST be throttled via `requestAnimationFrame` to prevent layout thrashing. The hook SHALL batch scroll position reads and style writes within a single animation frame.

#### Scenario: Scroll events during animation frame
- **WHEN** multiple scroll events fire before the next animation frame
- **THEN** the system SHALL read `window.scrollY` once per frame and update style properties once per frame, not once per scroll event

---

### Requirement: Backward Compatible Return Type

The `useScrollPosition` hook SHALL continue to return `isScrolled` as a boolean (`scrollProgress >= 1`) alongside `scrollProgress` to maintain backward compatibility with any existing consumers.

#### Scenario: isScrolled derived from scrollProgress
- **WHEN** `scrollProgress` is less than 1
- **THEN** `isScrolled` SHALL be `false`
- **WHEN** `scrollProgress` is 1 or greater
- **THEN** `isScrolled` SHALL be `true`

