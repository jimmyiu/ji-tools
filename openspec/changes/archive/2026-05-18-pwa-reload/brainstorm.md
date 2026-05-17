## Design Summary

Add a "new version available" toast/banner prompt that appears when a new PWA version is deployed. Uses `vite-plugin-pwa`'s built-in `registerType: 'prompt'` mechanism to detect waiting service worker updates and let users tap to refresh.

## Alternatives Considered

### Option A: Built-in `registerType: 'prompt'` (Agreed Approach)
- **做法**: Switch `registerType` from `'autoUpdate'` to `'prompt'` in vite config. Use `useRegisterSW()` from `virtual:pwa-register/react` to get `needRefresh` signal. Show a fixed-bottom banner when update is detected.
- **優點**: Minimal code, well-documented, uses plugin's native feature path. Only a single vite config change + one component + one hook needed.
- **缺點**: SW stays in "waiting" state until user confirms — slightly delayed update timing.
- **為何採用**: Cleanest separation of concerns, least maintenance burden, matches plugin authors' recommended pattern.

### Option B: Custom lifecycle on top of autoUpdate
- **做法**: Keep `registerType: 'autoUpdate'`. Add `onServiceWorkerUpdate` callback, manually post `SKIP_WAITING` message, listen for `controllerchange`, then reload.
- **優點**: Full control over timing and lifecycle.
- **缺點**: More manual wiring, more surface area for bugs, duplicates what the plugin already handles.
- **為何未採用**: Unnecessary complexity when the plugin's `registerType: 'prompt'` exists and works.

### Option C: Third-party wrapper (@vite-pwa/react)
- **做法**: Install the framework-specific wrapper package for React hooks/components.
- **優點**: Slightly more ergonomic React integration.
- **缺點**: Additional dependency, abstraction layer over a simple API.
- **為何未採用**: Marginal benefit over native `useRegisterSW()` hook from the plugin itself.

## Agreed Approach

**Option A: Built-in `registerType: 'prompt'`** — the most maintainable, best-documented path. The plugin's `prompt` mode was designed exactly for this use case: it keeps the new SW in "waiting" state, exposes a `needRefresh` boolean, and provides a `updateServiceWorker()` function that triggers `skipWaiting()` followed by page reload.

## Key Decisions

| Decision | Choice |
|---|---|
| Plugin config | `registerType: 'prompt'` (change from `'autoUpdate'`) |
| Banner position | Stacked at bottom, above TabBar (Option A) |
| Banner style | Same as InstallBanner: `bg-card border-t border-border` |
| Animation | Slide-up/fade-in CSS transition on mount |
| Dismiss behavior | Local state, hides until next app open |
| Content offset | Layout.tsx computes combined height of both banners |
| Settings fallback | Show "Update Available" in Settings when needRefresh is true and banner was dismissed |
| Dependencies | None beyond existing `vite-plugin-pwa@^1.3.0` |

## Open Questions

- Should we also show the banner on `offlineReady` (first-time install)? Yes, but lower priority — defer to separate change.
