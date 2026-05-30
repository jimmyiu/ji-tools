# pwa-update-prompt Specification

## MODIFIED Requirements

### Requirement: Update Banner Component

The application SHALL render a fixed-bottom `UpdateBanner` component when `needRefresh` is `true`, showing a "重新整理" button and a dismiss button. The banner SHALL use `position: fixed; z-50` positioned above the TabBar capsule with `bottom: calc(TAB_BAR_HEIGHT + 24px + env(safe-area-inset-bottom))` on mobile and `bottom: calc(24px + env(safe-area-inset-bottom))` on desktop. The banner SHALL use `slide-up` animation (`translateY(100%); opacity: 0` → `translateY(0); opacity: 1`) instead of the previous `slide-down` animation. The banner SHALL NOT receive `installBannerHeight` as a prop. The banner SHALL NOT be in the sticky top flow — it renders independently at the bottom of the viewport.

#### Scenario: Banner appears at bottom with slide-up animation
- **WHEN** `needRefresh` becomes `true`
- **THEN** the UpdateBanner SHALL slide up from the bottom of the screen into view

#### Scenario: Banner is positioned above TabBar on mobile
- **WHEN** `< 1024px` viewport and UpdateBanner is visible
- **THEN** it SHALL have `position: fixed; bottom: calc(TAB_BAR_HEIGHT + 24px + env(safe-area-inset-bottom)); z-50`

#### Scenario: Banner is positioned at bottom on desktop
- **WHEN** viewport is `≥ 1024px` and UpdateBanner is visible
- **THEN** it SHALL have `position: fixed; bottom: calc(24px + env(safe-area-inset-bottom)); z-50`

#### Scenario: Banner is not in top sticky flow
- **WHEN** UpdateBanner is visible
- **THEN** it SHALL NOT contribute to `totalBannerHeight`
- **THEN** it SHALL NOT be positioned with `sticky` or `top` properties

#### Scenario: Refresh button triggers update
- **WHEN** the user taps "重新整理"
- **THEN** `update()` SHALL be called and the page SHALL reload with new content

#### Scenario: Dismiss hides banner
- **WHEN** the user taps the dismiss (✕) button
- **THEN** the banner SHALL hide until the next app session

## ADDED Requirements

### Requirement: Settings page SHALL provide a force-show toggle for the update banner

The Settings page SHALL render a "顯示更新提示" / "隱藏更新提示" toggle button that force-shows the UpdateBanner without requiring a real PWA service worker update. The toggle SHALL persist its state in `localStorage` under `pwa_update_force_show`. When activated, the toggle SHALL also reset any prior dismissal. A custom event (`app-storage`) SHALL be dispatched so the Layout's `useBannerManager` hook reactively picks up the change without a page reload. The `showUpdateBanner` logic SHALL be `(needRefresh || forceShowUpdate) && !dismissedUpdate`.

#### Scenario: Force-show makes banner visible without SW update
- **WHEN** the user taps "顯示更新提示" in Settings
- **THEN** `localStorage.pwa_update_force_show` SHALL be set to `'true'`
- **THEN** `localStorage.pwa_update_dismissed` SHALL be cleared
- **THEN** navigating away from Settings SHALL show the UpdateBanner even without a real SW update

#### Scenario: Toggle hides banner when already force-shown
- **WHEN** the banner is force-shown and the user returns to Settings
- **THEN** the button SHALL read "隱藏更新提示"
- **WHEN** the user taps "隱藏更新提示"
- **THEN** `localStorage.pwa_update_force_show` SHALL be removed
- **THEN** the banner SHALL disappear

#### Scenario: Dismissed banner can be re-shown via toggle
- **WHEN** the user dismissed the banner (✕) and then returns to Settings
- **THEN** tapping "顯示更新提示" SHALL reset the dismissed flag AND set the force-show flag
- **THEN** the banner SHALL appear again

#### Scenario: Force-show state is persisted in localStorage
- **WHEN** the user refreshes the page with force-show enabled
- **THEN** the banner SHALL reappear on load