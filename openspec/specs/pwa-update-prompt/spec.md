# pwa-update-prompt Specification

## Purpose

Detect new PWA version via service worker and prompt user to refresh with a dismissible banner.

## Requirements

### Requirement: Service Worker Registration

The application SHALL use `registerType: 'prompt'` in the PWA plugin configuration so the new service worker waits in "installed" state for user confirmation before activating.

#### Scenario: SW waits for user confirmation
- **WHEN** a new version is deployed and the user visits the app
- **THEN** the new service worker downloads and enters the "waiting" state without activating

#### Scenario: Config is applied at build time
- **WHEN** the project is built with `pnpm build`
- **THEN** the generated service worker uses the prompt-based registration strategy

---

### Requirement: Update Detection Hook

The application SHALL provide a `usePwaUpdate` hook that wraps `useRegisterSW` from `virtual:pwa-register/react` and exposes `needRefresh: boolean` and `update: () => void`.

#### Scenario: Hook returns needRefresh as false initially
- **WHEN** the hook mounts and no new service worker is detected
- **THEN** `needRefresh` SHALL be `false`

#### Scenario: Hook detects waiting SW
- **WHEN** a new service worker enters the waiting state
- **THEN** `needRefresh` SHALL become `true`

#### Scenario: Update function activates waiting SW
- **WHEN** `update()` is called while `needRefresh` is `true`
- **THEN** the waiting service worker SHALL activate via `skipWaiting` and the page SHALL reload

---

### Requirement: Update Banner Component

The application SHALL render a fixed-bottom `UpdateBanner` component when `needRefresh` is `true`, showing a "重新整理" button and a dismiss button.

#### Scenario: Banner appears on update detection
- **WHEN** `needRefresh` becomes `true`
- **THEN** the UpdateBanner SHALL slide up into view at the bottom of the screen

#### Scenario: Refresh button triggers update
- **WHEN** the user taps "重新整理"
- **THEN** `update()` SHALL be called and the page SHALL reload with new content

#### Scenario: Dismiss hides banner
- **WHEN** the user taps the dismiss (✕) button
- **THEN** the banner SHALL hide until the next app session

#### Scenario: Banner position adapts to InstallBanner height
- **WHEN** both UpdateBanner and InstallBanner are visible
- **THEN** UpdateBanner SHALL be positioned directly above InstallBanner

---

### Requirement: Layout Integration

The Layout component SHALL compute the combined height of UpdateBanner and InstallBanner to set the main content area's bottom padding, preventing content from being hidden behind the banners.

#### Scenario: Content padding includes banner heights
- **WHEN** either banner is visible
- **THEN** the main content area's `paddingBottom` SHALL include the combined height of all visible banners plus the TabBar height

#### Scenario: No banners leaves default padding
- **WHEN** no banners are visible
- **THEN** the main content area SHALL use the default TabBar-only bottom padding

---

### Requirement: TypeScript Type Support

The application SHALL reference `vite-plugin-pwa/client` types to resolve the `virtual:pwa-register/react` module for TypeScript.

#### Scenario: Build succeeds with PWA types
- **WHEN** `pnpm build` is run
- **THEN** TypeScript SHALL compile without errors related to the `virtual:pwa-register/react` module
