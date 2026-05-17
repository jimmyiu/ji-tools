## Why

JI Tools uses `vite-plugin-pwa` with `registerType: 'autoUpdate'`, which silently activates new service workers. Users don't realize a new version is available — they see stale content even after deployment. This is especially problematic for a calculator tool where rates and terms change. Adding an update prompt gives users control over when to refresh, ensuring they always see the latest data without disrupting their workflow.

## What Changes

**Service Worker Registration Strategy**
- From: `registerType: 'autoUpdate'` — new SW activates on next navigation, no user awareness
- To: `registerType: 'prompt'` — new SW stays in waiting state until user confirms
- Reason: Users need visibility into available updates and control over when to apply them
- Impact: Non-breaking; existing users get the prompt on their next visit

**Bottom Banner Area**
- From: Only InstallBanner + TabBar at bottom
- To: UpdateBanner stacked above InstallBanner (when visible), both above TabBar
- Reason: Consistent UX pattern — all notifications live at the bottom, within thumb reach
- Impact: Non-breaking; Layout.tsx dynamically accounts for combined banner heights

**Settings Page**
- From: Shows version number only
- To: Optional "更新可用" indicator when update was dismissed
- Reason: Fallback for users who dismissed the banner
- Impact: Non-breaking; conditional UI addition

## Capabilities

### New Capabilities
- `pwa-update-prompt`: Detect new PWA version via service worker and prompt user to refresh with a dismissible banner

### Modified Capabilities
- *(none — no existing spec has requirement changes)*

## Impact

- **vite.config.ts**: Single line change — `registerType: 'autoUpdate'` → `'prompt'`
- **New file**: `src/hooks/usePwaUpdate.ts` — wraps `useRegisterSW()`
- **New file**: `src/components/UpdateBanner.tsx` — banner UI component
- **Modified**: `src/components/Layout.tsx` — render UpdateBanner, compute combined bottom offset
- **Optional**: `src/pages/Settings.tsx` — show update indicator when dismissed
- **Dependencies**: `workbox-window` (peer dep for `registerType: 'prompt'`); `vite-plugin-pwa@^1.3.0` already installed
