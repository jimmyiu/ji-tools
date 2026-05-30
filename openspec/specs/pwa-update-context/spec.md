## ADDED Requirements

### Requirement: PWA update banner visibility is driven by a single `visible` state

The system SHALL maintain a single `visible` boolean that determines whether the PWA update banner is shown. The `visible` state SHALL be persisted to `localStorage` under the key `pwa_update_visible`. On fresh load with no localStorage entry, `visible` SHALL default to `false`. All visibility changes (dismiss, update click, Settings toggle, needRefresh event) SHALL set this single field.

On initialization, the system SHALL remove the orphaned localStorage keys `pwa_update_dismissed` and `pwa_update_force_show` (from the previous dual-state design).

#### Scenario: Banner shows when needRefresh fires
- **WHEN** the service worker detects a new version and sets `needRefresh` to `true`
- **THEN** the `visible` flag SHALL be set to `true`
- **THEN** the update banner SHALL be rendered

#### Scenario: Banner hides on dismiss
- **WHEN** the user clicks the dismiss (X) button
- **THEN** the `visible` flag SHALL be set to `false`
- **THEN** the update banner SHALL NOT be rendered

#### Scenario: Banner hides on update click
- **WHEN** the user clicks the update button
- **THEN** the `visible` flag SHALL be set to `false` before the SW update is triggered
- **THEN** the banner SHALL NOT be rendered immediately

#### Scenario: Settings toggle flips visibility
- **WHEN** the user clicks the toggle in Settings
- **THEN** the `visible` flag SHALL be toggled to `!visible`
- **THEN** the toggle text SHALL reflect the new `visible` state

#### Scenario: Dismiss and toggle-off produce the same result
- **WHEN** the banner is `visible`
- **THEN** both the dismiss (X) action and the Settings toggle (from ON to OFF) SHALL set `visible` to `false` through the same mutation path

#### Scenario: Settings reflects real state across navigation
- **WHEN** the banner is dismissed on one page
- **THEN** navigating to Settings SHALL show the toggle in the OFF position
- **WHEN** a `needRefresh` event fires on one page
- **THEN** navigating to Settings SHALL show the toggle in the ON position

#### Scenario: Dismissed banner stays hidden when needRefresh remains true
- **WHEN** the banner is dismissed while `needRefresh` is `true`
- **THEN** the banner SHALL remain hidden despite `needRefresh` still being `true`
- **THEN** the banner SHALL only reappear when a subsequent `needRefresh` event fires (new detection)

### Requirement: UpdateBanner prop renamed to `visible`

The `UpdateBanner` component SHALL accept a `visible` prop instead of `needRefresh` to reflect that the prop now represents the unified visibility state, not the raw SW refresh signal.

#### Scenario: UpdateBanner renders based on visible prop
- **WHEN** `visible` is `true`
- **THEN** the update banner SHALL be rendered
- **WHEN** `visible` is `false`
- **THEN** the update banner SHALL NOT be rendered

### Requirement: Update button handles undefined promise safely

The system SHALL use optional chaining (`?.`) when calling `updateServiceWorker(true)` to prevent a crash when the SW registration is not ready.

#### Scenario: updateServiceWorker returns undefined
- **WHEN** `updateServiceWorker(true)` returns `undefined`
- **THEN** no error SHALL be thrown
- **THEN** the banner SHALL remain hidden (visible was set to false before the call)

### Requirement: State is shared between Layout and Settings via React context

The system SHALL provide a `PwaUpdateContext` with a provider component and a consumer hook. Layout SHALL use the provider. Both Layout and Settings SHALL use the consumer hook.

#### Scenario: Layout and Settings see the same visible state
- **WHEN** the banner is dismissed in the Layout component
- **THEN** the Settings component SHALL reflect `visible = false` without a page refresh
- **WHEN** the toggle is switched in the Settings component
- **THEN** the Layout component SHALL reflect the updated `visible` state
