# bottom-update-banner Specification

## Purpose
TBD - created by archiving change move-update-banner-to-bottom. Update Purpose after archive.
## Requirements
### Requirement: UpdateBanner SHALL be positioned fixed at the bottom above the TabBar

The UpdateBanner SHALL use `position: fixed; z-50` and be positioned at `bottom: calc(TAB_BAR_HEIGHT + 24px + env(safe-area-inset-bottom))` to sit directly above the TabBar capsule. The banner SHALL be full-width (`w-full`) and SHALL include `paddingBottom: env(safe-area-inset-bottom)` only when no TabBar is present (desktop), otherwise the TabBar already accounts for safe area. The UpdateBanner SHALL accept `needRefresh`, `update`, and `dismiss` props only — the `installBannerHeight` prop SHALL be removed.

#### Scenario: UpdateBanner is fixed above TabBar on mobile
- **WHEN** the UpdateBanner is visible and the viewport is narrower than 1024px
- **THEN** it SHALL have `position: fixed` and `bottom: calc(TAB_BAR_HEIGHT + 24px + env(safe-area-inset-bottom))`
- **THEN** it SHALL have `z-50`
- **THEN** it SHALL be full-width

#### Scenario: UpdateBanner is fixed at bottom on desktop
- **WHEN** the UpdateBanner is visible and the viewport is 1024px or wider
- **THEN** it SHALL have `position: fixed` and `bottom: calc(24px + env(safe-area-inset-bottom))` (no TabBar offset since TabBar is hidden)
- **THEN** it SHALL have `z-50`

#### Scenario: UpdateBanner does not receive installBannerHeight prop
- **WHEN** the UpdateBanner is rendered
- **THEN** it SHALL NOT accept or use an `installBannerHeight` prop

---

### Requirement: UpdateBanner SHALL animate in with slide-up animation

The UpdateBanner SHALL use a `slide-up` animation (`translateY(100%); opacity: 0` → `translateY(0); opacity: 1`) over 300ms ease-out, replacing the previous `slide-down` animation.

#### Scenario: Banner appears with slide-up animation
- **WHEN** UpdateBanner becomes visible (`needRefresh` transitions to `true`)
- **THEN** it SHALL animate in from the bottom using `slide-up` keyframes over 300ms ease-out

#### Scenario: Banner dismisses immediately
- **WHEN** the user dismisses the banner or refreshes
- **THEN** the banner SHALL be removed from the DOM immediately (no exit animation)

---

### Requirement: UpdateBanner SHALL NOT affect header top offset or main content padding

The UpdateBanner's height SHALL NOT be included in `totalBannerHeight`. The header SHALL only offset by `installBannerHeight`. The `<main>` element's `paddingBottom` SHALL remain `var(--nav-bottom-offset)` unchanged.

#### Scenario: Header offset excludes UpdateBanner height
- **WHEN** the UpdateBanner is visible
- **THEN** the header's `top` style SHALL NOT include UpdateBanner height
- **THEN** the header's `top` style SHALL equal `installBannerHeight` in pixels only

#### Scenario: Main content padding excludes UpdateBanner height
- **WHEN** the UpdateBanner is visible
- **THEN** the `<main>` element's `paddingBottom` SHALL be `var(--nav-bottom-offset)` only

