# pwa-update-prompt Specification

## Purpose

Detect new PWA version via service worker and prompt user to refresh with a dismissible banner positioned at the top of the viewport.

## Requirements

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

The application SHALL provide a `usePwaUpdate` hook that returns `needRefresh: boolean` and `update: () => void`. The hook SHALL manage service worker lifecycle events internally.

#### Scenario: Hook returns needRefresh state
- **WHEN** a new service worker is waiting
- **THEN** `needRefresh` SHALL be `true`

#### Scenario: Hook provides update function
- **WHEN** the user wants to refresh
- **THEN** calling `update()` SHALL activate the waiting service worker

---

### Requirement: TypeScript Type Support

The application SHALL provide type definitions for the `usePwaUpdate` hook and its usage with `vite-plugin-pwa`.

#### Scenario: Types are exported from hooks module
- **WHEN** TypeScript compiles the project
- **THEN** no type errors SHALL occur related to PWA update hooks
