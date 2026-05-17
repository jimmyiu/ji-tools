# PWA Update Reload

## Problem

When a new version of JI Tools is deployed to GitHub Pages, existing users with the installed PWA continue to see the old cached content. The current `registerType: 'autoUpdate'` configuration does detect the new service worker, but it silently activates on next navigation without the user knowing — resulting in a confusing "nothing changed" experience.

## Solution

Switch to `registerType: 'prompt'` and show a fixed-bottom banner ("新版本已可用" + "重新整理" button) when a new service worker is detected. The user taps to refresh, triggering `skipWaiting()` + `clients.claim()` + page reload.

## Architecture

### vite.config.ts
- Change `registerType: 'autoUpdate'` → `'prompt'`

### New: `src/hooks/usePwaUpdate.ts`
```ts
import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePwaUpdate() {
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(r) { console.log('SW registered:', r) },
    onRegisterError(e) { console.error('SW registration error:', e) },
  })
  return { needRefresh, update: updateServiceWorker }
}
```

### New: `src/components/UpdateBanner.tsx`
- Fixed-bottom banner, same visual pattern as `InstallBanner`
- `bg-card border-t border-border z-50`
- Positioned above TabBar, stacked above InstallBanner when both visible
- `bottom: calc(56px + ${installBannerHeight}px + env(safe-area-inset-bottom))`
- Slide-up/fade-in animation on mount
- Shows "重新整理" button → calls `updateServiceWorker()`
- Shows "✕" dismiss → local `useState` hides banner until next app open
- When `needRefresh` is false, renders nothing (not even a zero-height element)

### Modified: `src/components/Layout.tsx`
- Import and render `<UpdateBanner>` alongside `<InstallBanner>`
- Use separate ref for UpdateBanner or compute combined height
- `bottomOffset` for `<main>` accounts for max(InstallBanner, stack of both)

### Optional: `src/pages/Settings.tsx`
- If `needRefresh` is true and banner was dismissed, show "更新可用" indicator near version number

## User Flow

1. Developer deploys new version to GitHub Pages
2. User opens PWA — SW check finds new version
3. New SW downloads in background and enters "waiting" state
4. Banner slides up: "新版本已可用  [重新整理] [✕]"
5. User taps "重新整理"
6. New SW activates, page reloads with new content
7. Banner disappears until next deploy

## Not in Scope

- Offline-ready indicator (separate concern)
- Push notification-based update alerts
- Auto-update without user consent
