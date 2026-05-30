# top-positioned-banners Specification

## MODIFIED Requirements

### Requirement: Banners SHALL be positioned sticky at the top of the screen

InstallBanner SHALL use `position: sticky; top: 0; z-50` and appear in the normal document flow, placed before the header element in the DOM. InstallBanner SHALL include `paddingTop: env(safe-area-inset-top)` to avoid being hidden behind device notches. UpdateBanner is no longer positioned at the top — it is positioned at the bottom (see `bottom-update-banner` spec). The header's `top` offset SHALL account for `installBannerHeight` only. Banners at the top SHALL use `slide-down` animation (`translateY(-100%); opacity: 0` → `translateY(0); opacity: 1`).

#### Scenario: InstallBanner is sticky at top
- **WHEN** InstallBanner is visible
- **THEN** it SHALL stick to the top of the viewport with `position: sticky; top: 0; z-50`
- **THEN** it SHALL be full-width across the entire viewport

#### Scenario: InstallBanner appears with slide-down animation
- **WHEN** InstallBanner becomes visible
- **THEN** it SHALL animate in from the top using `slide-down` keyframes over 300ms ease-out

#### Scenario: InstallBanner is in document flow before the header
- **WHEN** the Layout renders with a visible InstallBanner
- **THEN** the InstallBanner element SHALL precede the header element in the DOM order

---

### Requirement: Banners SHALL stack vertically at the top

UpdateBanner SHALL NOT be positioned at the top of the viewport. Only InstallBanner occupies the top banner area. `totalBannerHeight` SHALL equal `installBannerHeight` only (no UpdateBanner height). `useBannerManager` SHALL NOT track `updateBannerHeight` or provide `updateBannerRef`.

#### Scenario: Header offset uses installBannerHeight only
- **WHEN** InstallBanner is visible
- **THEN** the header SHALL have a dynamic `top` style equal to `installBannerHeight` in pixels

#### Scenario: Header at top when no InstallBanner
- **WHEN** InstallBanner is not visible (installBannerHeight is 0)
- **THEN** the header SHALL have `top: 0` (or no top offset)

#### Scenario: totalBannerHeight excludes UpdateBanner
- **WHEN** both InstallBanner and UpdateBanner are visible
- **THEN** `totalBannerHeight` SHALL equal `installBannerHeight` only