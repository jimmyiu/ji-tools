## Context

The PWA update banner logic is currently split across three independent concerns: SW registration (`usePwaUpdate`), banner visibility management (`useBannerManager`), and a Settings toggle (`Settings.tsx`). Two separate state variables (`forceShow`, `dismissed`) control the same banner, using localStorage events for cross-component sync. This fragmentation causes two bugs: `updateServiceWorker(true).catch(...)` throws on `undefined` (crash on update click), and dismiss/toggle state diverges because they update different variables.

## Goals / Non-Goals

**Goals:**
- Single `visible` boolean as the sole source of truth for update banner visibility
- Unify dismiss, update, and toggle into the same mutation (`setVisible(false)`)
- Fix the `.catch` crash with optional chaining
- Hide banner immediately on update click (fixes iOS PWA case where no page reload occurs)
- Share state between Layout and Settings via React context (no more localStorage events for PWA update)

**Non-Goals:**
- No changes to the install banner (`useInstallPrompt`, `InstallBanner`, `useBannerManager` install height logic)
- No changes to how `UpdateBanner` renders (CSS, animations, layout)

## Decisions

- **Single `visible` field over dual `forceShow`/`dismissed`**: Simplifies state management. All visibility changes flow through one code path. Dismiss = toggle-off. needRefresh = toggle-on. Settings toggle = flip.
- **React context over localStorage events**: Direct React state sharing between Layout and Settings avoids the round-trip through `CustomEvent` dispatching. Simpler to reason about and debug.
- **Optional chaining on `updateServiceWorker(true)`**: `?` prevents crash when the SW registration isn't ready or returns `undefined` (iOS PWA timing edge case).
- **Immediate `setVisible(false)` before update call**: Ensures the banner hides regardless of whether the SW update promise resolves or even returns a promise. Fixes the iOS case where update silently fails.

## Architecture

```
Layout
 ├─ calls usePwaUpdate() ← sources visible state, registers SW
 ├─ wraps children in <PwaUpdateContext.Provider value={...}>
 ├─ reads showUpdateBanner from context → passes to <UpdateBanner>
 └─ Settings reads showUpdateBanner from context → renders toggle
```

### Shared interface (usePwaUpdate ↔ context value)

```ts
interface PwaUpdateContextValue {
  showUpdateBanner: boolean   // single source of truth
  update: () => void          // dismiss + trigger SW update
  dismiss: () => void         // dismiss (X button)
  toggleShow: () => void      // flip visibility (Settings toggle)
}
```

`usePwaUpdate` is called once inside the provider (Layout). It owns the `visible` React state and the `useRegisterSW` call. The context distributes the value + actions to both Layout and Settings. Settings does NOT call `usePwaUpdate` directly — it only uses the consumer hook.

### Testing strategy for cross-component scenarios

Cross-component scenarios (dismiss in Layout → reflects in Settings, toggle in Settings → reflects in Layout) SHALL be tested by rendering a test provider wrapper with two consumer components and asserting shared state via `renderHook` or a lightweight integration render. No need for full Layout + Settings DOM rendering.

## Risks / Trade-offs

## Risks / Trade-offs

- [Context re-render] The context value may cause both Layout and Settings to re-render on any visibility change → acceptable since this is a single boolean, minimal impact
- [Stale needRefresh] When user dismisses an active SW update (`needRefresh=true`), the banner hides but the SW is still waiting. The banner won't re-appear unless a *new* `needRefresh` event fires → acceptable, the user explicitly dismissed it
- [localStorage for toggle persistence] If the user dismisses and the toggle was ON, `visible=false` is persisted. On page refresh the flag is restored → consistent behavior: `visible` state always matches what the user last set
