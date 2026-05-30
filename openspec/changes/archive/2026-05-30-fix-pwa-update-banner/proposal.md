## Why

The PWA update banner has two bugs: clicking "update" throws a JavaScript error (`.catch()` on `undefined`), and the dismiss (X) button and Settings toggle are out of sync because they control separate state variables. On iOS PWA, clicking update does nothing — no refresh, no dismiss. The logic is fragmented across `usePwaUpdate`, `useBannerManager`, and `Settings.tsx` with no single source of truth.

## What Changes

- Consolidate all PWA update banner logic into a single `usePwaUpdate` hook with one `visible` backing field
- Share state between Layout and Settings via `PwaUpdateContext` instead of localStorage events
- Fix `updateServiceWorker(true).catch(...)` crash with optional chaining
- Immediately hide banner on update click so iOS PWA gets visual feedback even if SW update doesn't trigger page reload
- Unify dismiss (X), update button, and Settings toggle — all call the same `setVisible(false/true)` mutation, persisted to localStorage
- Strip PWA update logic from `useBannerManager` (keep only install banner height concerns)

## Capabilities

### New Capabilities
- `pwa-update-context`: React context provider + consumer hook that shares a single `visible` state between Layout (banner) and Settings (toggle)

### Modified Capabilities
<!-- No existing specs to modify — this is a refactor of existing code, not a new spec-level feature -->

## Impact

- `src/hooks/usePwaUpdate.ts` — rewritten with single `visible` state + localStorage persistence
- `src/hooks/useBannerManager.ts` — remove update banner dismiss/toggle logic
- `src/contexts/PwaUpdateContext.tsx` — new file: context provider and consumer hook
- `src/components/Layout.tsx` — use context instead of separate hooks
- `src/components/UpdateBanner.tsx` — no/minimal changes
- `src/pages/Settings.tsx` — use context, remove direct localStorage access
- All existing tests updated to match new API
