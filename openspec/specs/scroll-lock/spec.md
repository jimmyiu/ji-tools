# scroll-lock Specification

## Purpose
TBD - created by archiving change scroll-ux-enhancement. Update Purpose after archive.
## Requirements
### Requirement: Viewport Overflow Lock

The system SHALL lock scrolling on pages where the main content fits within the viewport. When the content area's `scrollHeight` is less than or equal to its `clientHeight` (accounting for the tab bar and safe area insets), the system MUST set `overflow: hidden` on the document root element to prevent any scroll, bounce, or rubber-band behavior.

#### Scenario: Short page has no scroll
- **WHEN** a page renders and its main content `scrollHeight` is less than or equal to the viewport `clientHeight` minus tab bar and safe area padding
- **THEN** the document root element SHALL have `overflow: hidden` applied, preventing any scroll interaction on that page

#### Scenario: Long page allows scroll
- **WHEN** a page renders and its main content `scrollHeight` exceeds the viewport `clientHeight` minus tab bar and safe area padding
- **THEN** the document root element SHALL NOT have `overflow: hidden` applied, allowing normal scroll behavior

#### Scenario: Content resize re-evaluates lock
- **WHEN** dynamic content changes cause the page to go from fitting the viewport to overflowing (or vice versa)
- **THEN** the system SHALL re-evaluate and update the overflow lock state within the same render frame

#### Scenario: Orientation change re-evaluates lock
- **WHEN** the device orientation changes (e.g., portrait to landscape)
- **THEN** the system SHALL re-evaluate the overflow lock state to reflect the new viewport dimensions

---

### Requirement: ResizeObserver-Based Detection

The system SHALL use `ResizeObserver` on the main content area to detect content size changes. The hook MUST observe the `<main>` element (or its wrapper) and compare `scrollHeight` against `clientHeight` to determine scroll overflow status.

#### Scenario: ResizeObserver triggers on content change
- **WHEN** content inside the main area changes size (e.g., collapsible sections expand, data loads)
- **THEN** the ResizeObserver callback SHALL re-evaluate whether the page content overflows the viewport

#### Scenario: ResizeObserver triggers on viewport resize
- **WHEN** the viewport resized (e.g., orientation change, keyboard appearing on mobile)
- **THEN** the observation SHALL re-evaluate whether the page content overflows the viewport

---

### Requirement: Initial Lock Application

The system MUST apply the overflow lock on initial render using `useLayoutEffect` so that the lock is in place before the browser paints, preventing any flash of scrollable content on short pages.

#### Scenario: Short page locked before first paint
- **WHEN** a short page (content fits viewport) loads
- **THEN** `overflow: hidden` SHALL be applied to the document root before the first browser paint via `useLayoutEffect`

#### Scenario: Cleanup on unmount
- **WHEN** the component using the scroll lock unmounts
- **THEN** the system SHALL restore the document root's overflow to its original value

