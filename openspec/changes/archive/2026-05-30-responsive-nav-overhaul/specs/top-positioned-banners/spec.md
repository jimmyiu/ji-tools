## ADDED Requirements

### Requirement: Banners SHALL be positioned sticky at the top of the screen

InstallBanner SHALL use `position: sticky; top: 0; z-50` and appear in the normal document flow, placed before the header element in the DOM. InstallBanner SHALL include `paddingTop: env(safe-area-inset-top)` to avoid being hidden behind device notches. UpdateBanner SHALL use `position: sticky; z-50` with a dynamic `top` equal to `installBannerHeight` in pixels to stack below InstallBanner. Both banners SHALL be full-width, spanning the entire viewport including over the sidebar on desktop. Banners SHALL use `slide-down` animation (`translateY(-100%); opacity: 0` → `translateY(0); opacity: 1`) instead of the previous `slide-up` animation.

#### Scenario: Banner is sticky at top
- **WHEN** a banner is visible
- **THEN** InstallBanner SHALL stick to the top of the viewport with `position: sticky; top: 0; z-50`
- **THEN** UpdateBanner SHALL stick below InstallBanner with `position: sticky; z-50` and `top: ${installBannerHeight}px`
- **THEN** it SHALL be full-width across the entire viewport

#### Scenario: Banner appears with slide-down animation
- **WHEN** a banner becomes visible
- **THEN** it SHALL animate in from the top using `slide-down` keyframes (`translateY(-100%); opacity: 0` → `translateY(0); opacity: 1`) over 300ms ease-out

#### Scenario: Banner is in document flow before the header
- **WHEN** the Layout renders with a visible banner
- **THEN** the banner element SHALL precede the header element in the DOM order

---

### Requirement: Banners SHALL stack vertically at the top

When both InstallBanner and UpdateBanner are visible, InstallBanner SHALL be at `top: 0` and UpdateBanner SHALL be at `top: ${installBannerHeight}px` to stack directly below. The combined height of all visible banners SHALL be provided by `useBannerManager` as `totalBannerHeight`, which SHALL be used to set the header's dynamic `top` style.

#### Scenario: InstallBanner at top position
- **WHEN** InstallBanner is visible
- **THEN** it SHALL have `top: 0` in its sticky positioning

#### Scenario: UpdateBanner stacks below InstallBanner
- **WHEN** both banners are visible
- **THEN** UpdateBanner SHALL have `top` set to the `installBannerHeight` in pixels
- **THEN** UpdateBanner SHALL appear directly below InstallBanner with no visual gap

#### Scenario: Header offset accounts for banner height
- **WHEN** one or more banners are visible
- **THEN** the header SHALL have a dynamic `top` style property equal to `totalBannerHeight` in pixels
- **THEN** the header SHALL stick below the banner area, not behind it

#### Scenario: Header at top when no banners
- **WHEN** no banners are visible (totalBannerHeight is 0)
- **THEN** the header SHALL have `top: 0` (or no top offset)

---

### Requirement: Banner height SHALL NOT be included in main content bottom padding

The `<main>` element's `paddingBottom` SHALL NOT include `totalBannerHeight`. Banner height is only used for the header's dynamic `top` offset. The `bottomOffset` calculation SHALL only include `--nav-bottom-offset` (which accounts for the capsule + spacing + safe area on mobile, and only spacing on desktop).

#### Scenario: Main paddingBottom excludes banner height
- **WHEN** a banner is visible
- **THEN** the `<main>` element's `paddingBottom` SHALL NOT include the banner's height
- **THEN** the `<main>` element's `paddingBottom` SHALL only equal `var(--nav-bottom-offset)`

#### Scenario: Header top includes banner height
- **WHEN** a banner is visible
- **THEN** the header's `top` style SHALL be set to `${totalBannerHeight}px`