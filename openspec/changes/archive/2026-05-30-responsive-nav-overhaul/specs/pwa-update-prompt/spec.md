## MODIFIED Requirements

### Requirement: Update Banner Component

The application SHALL render a sticky-top `UpdateBanner` component when `needRefresh` is `true`, showing a "重新整理" button and a dismiss button. The banner SHALL use `position: sticky; z-50` and appear in the document flow before the header. When both UpdateBanner and InstallBanner are visible, UpdateBanner SHALL be positioned at `top: ${installBannerHeight}px` (dynamic value) to stack below InstallBanner. The banner SHALL use `slide-down` animation (`translateY(-100%); opacity: 0` → `translateY(0); opacity: 1`) instead of the previous `slide-up` animation.

#### Scenario: Banner appears at top with slide-down animation
- **WHEN** `needRefresh` becomes `true`
- **THEN** the UpdateBanner SHALL slide down from the top of the screen into view

#### Scenario: Banner stacks below InstallBanner
- **WHEN** both UpdateBanner and InstallBanner are visible
- **THEN** UpdateBanner SHALL be positioned at `top: ${installBannerHeight}px`
- **THEN** UpdateBanner SHALL appear directly below InstallBanner

#### Scenario: Refresh button triggers update
- **WHEN** the user taps "重新整理"
- **THEN** `update()` SHALL be called and the page SHALL reload with new content

#### Scenario: Dismiss hides banner
- **WHEN** the user taps the dismiss (✕) button
- **THEN** the banner SHALL hide until the next app session

---

### Requirement: Layout Integration

The Layout component SHALL use `totalBannerHeight` from `useBannerManager` to set a dynamic `top` style on the header element, NOT to compute bottom padding. The `<main>` element's `paddingBottom` SHALL use only `var(--nav-bottom-offset)` without any banner height contribution. Both banners SHALL appear in the document flow before the header element.

#### Scenario: Header top offset includes banner height
- **WHEN** one or more banners are visible
- **THEN** the header `style.top` SHALL equal `${totalBannerHeight}px`

#### Scenario: No banner height in main bottom padding
- **WHEN** banners are visible
- **THEN** the `<main>` element's `paddingBottom` SHALL NOT include `totalBannerHeight`
- **THEN** the `<main>` element's `paddingBottom` SHALL equal `var(--nav-bottom-offset)` only

#### Scenario: Banners in DOM before header
- **WHEN** the Layout renders
- **THEN** InstallBanner and UpdateBanner SHALL appear before the `<header>` element in the DOM

---

### Requirement: Service Worker Registration

The application SHALL use `registerType: 'prompt'` in the PWA plugin configuration so the new service worker waits in "installed" state for user confirmation before activating. This requirement is unchanged.

#### Scenario: SW waits for user confirmation
- **WHEN** a new version is deployed and the user visits the app
- **THEN** the new service worker downloads and enters the "waiting" state without activating

---

### Requirement: Update Detection Hook

The application SHALL provide a `usePwaUpdate` hook that wraps `useRegisterSW` from `virtual:pwa-register/react` and exposes `needRefresh: boolean` and `update: () => void`. This requirement is unchanged.

#### Scenario: Hook returns needRefresh as false initially
- **WHEN** the hook mounts and no new service worker is detected
- **THEN** `needRefresh` SHALL be `false`

---

### Requirement: TypeScript Type Support

The application SHALL reference `vite-plugin-pwa/client` types to resolve the `virtual:pwa-register/react` module for TypeScript. This requirement is unchanged.

#### Scenario: Build succeeds with PWA types
- **WHEN** `pnpm build` is run
- **THEN** TypeScript SHALL compile without errors related to the `virtual:pwa-register/react` module