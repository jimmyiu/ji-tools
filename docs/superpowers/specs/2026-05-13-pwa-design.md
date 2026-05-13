# PWA Support for JI Tools

## Goal

Make JI Tools installable as a Progressive Web App on iPhone (iOS Safari) and Android, so users can add it to their home screen and use it like a native app.

## Context

- JI Tools is a React + Vite + Tailwind app hosted on GitHub Pages at `/ji-tools/`
- Two pages: FX deposit comparison and Marathon savings calculator
- All computation is local; data persists in localStorage
- Currently no PWA support on `main` (no manifest, no service worker, no icons)
- Starting from `main` branch (not the existing mobile-first feature branch)

## Approach

Use `vite-plugin-pwa` (which wraps Workbox) to auto-generate the service worker and manifest at build time, plus a custom install prompt component for iOS Safari.

## Design

### 1. Web App Manifest & Icons

Configure `vite-plugin-pwa` in `vite.config.ts` to generate the manifest:

```ts
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'icons.svg'],
  manifest: {
    name: 'JI Tools',
    short_name: 'JI Tools',
    description: '前端工具集 - 港美定存比較、馬拉松存款計算機',
    theme_color: '#0f1117',
    background_color: '#0f1117',
    display: 'standalone',
    scope: '/ji-tools/',
    start_url: '/ji-tools/',
    icons: [
      { src: '/ji-tools/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/ji-tools/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/ji-tools/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    navigateFallbackDenylist: [/^\/api/],
  },
})
```

Icon generation: convert the existing `public/favicon.svg` to 192x192 and 512x512 PNGs, placed in `public/icons/`. This can be done as a one-time script using `sharp` or a similar tool, or manually via a browser/SVG export.

### 2. Service Worker (App Shell Cache)

- Strategy: `registerType: 'autoUpdate'` — when a new version is deployed, the service worker downloads it in the background and activates on next navigation
- `claims: true` not needed; the default behavior is sufficient since the app doesn't have long-lived WebSocket connections
- The service worker caches HTML, JS, CSS, and static assets so the app loads when offline
- No need to cache dynamic data since all computation is localStorage-based

### 3. iOS Install Prompt

Create a `useInstallPrompt` hook and `InstallBanner` component:

**Detection logic:**
- Check `navigator.standalone` / `window.matchMedia('(display-mode: standalone)')` — if already installed, don't show the banner
- On iOS Safari (detected via user agent): show a banner at the bottom of the screen with instructions: "Tap the Share button → Add to Home Screen" with a visual arrow pointing to the Safari share icon (the square-with-arrow-up icon)
- On browsers supporting `beforeinstallprompt` (Android Chrome): show a "Install App" button that triggers the native install dialog

**Dismissal:**
- Store a `pwa_install_dismissed` flag in localStorage when the user dismisses the banner
- Don't show the banner again after dismissal
- Show the banner after the user has visited at least once (use a visit counter in localStorage)

### 4. `<head>` Enhancements

Add to `index.html`:

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#0f1117">
<link rel="apple-touch-icon" href="/ji-tools/icons/icon-192.png">
```

- `apple-mobile-web-app-capable`: tells iOS this is a web app that should run in standalone mode
- `apple-mobile-web-app-status-bar-style: black-translucent`: makes the iOS status bar blend with the dark theme background
- `theme-color`: matches the app's dark background for browser chrome coloring
- `apple-touch-icon`: high-res icon for the home screen

### 5. Deployment Considerations

- GitHub Pages serves with correct MIME types for service workers (`application/javascript` for JS, etc.)
- The `vite-plugin-pwa` generates the service worker into the `dist/` directory, so the existing `cp dist/index.html dist/404.html` build step remains valid
- No changes needed to the GitHub Pages deployment workflow

## Files to Create/Modify

| File | Action |
|------|--------|
| `vite.config.ts` | Add `vite-plugin-pwa` config |
| `index.html` | Add PWA meta tags |
| `src/hooks/useInstallPrompt.ts` | New — install prompt detection hook |
| `src/components/InstallBanner.tsx` | New — install prompt UI component |
| `src/components/Layout.tsx` | Include `InstallBanner` |
| `public/icons/icon-192.png` | New — 192x192 icon (generated from favicon.svg) |
| `public/icons/icon-512.png` | New — 512x512 icon (generated from favicon.svg) |

## Success Criteria

- App is installable on iPhone via Safari's "Add to Home Screen"
- App launches in standalone mode (no Safari browser chrome)
- App loads offline after first visit (cached app shell)
- iOS users see an install prompt explaining how to add to home screen
- Existing functionality unchanged