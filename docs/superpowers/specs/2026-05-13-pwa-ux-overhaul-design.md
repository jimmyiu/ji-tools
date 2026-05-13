# PWA UX Overhaul Design

## Goal

Transform JI Tools from a "website in fullscreen" to a native-feeling iOS PWA by fixing the Dynamic Island overlap, eliminating scroll bounce, adding a bottom tab bar, implementing a collapsing large title, and polishing micro-interactions.

## Context

- React + Vite + Tailwind app with two tool pages (FX Deposit Compare, Marathon Savings) and a Home page
- Already has PWA support (vite-plugin-pwa, manifest, service worker, install banner)
- `index.html` already has `viewport-fit=cover` and `apple-mobile-web-app-status-bar-style: black-translucent`
- `index.css` has a `:root { padding-bottom: env(safe-area-inset-bottom) }` hack that needs replacing
- The app is primarily designed for mobile use as a PWA

## Approach

Layered CSS-first fixes + new React components (Approach A). Each change is testable independently. Safe area and scroll fixes are pure CSS; the tab bar, collapsing title, and settings page are new components with hooks.

## Design

### 1. Safe Area & Viewport Fix

The header overlaps the Dynamic Island because the app shell has no top safe area padding.

**Changes:**

- The outermost container in `Layout.tsx` gets `padding-top: env(safe-area-inset-top)` and `padding-bottom: env(safe-area-inset-bottom)`. This ensures all content sits below the Dynamic Island and above the home indicator.
- Remove the `:root { padding-bottom: env(safe-area-inset-bottom) }` hack from `index.css` — proper inset handling moves to the Layout component.
- Remove the `.safe-area-bottom` utility class from `index.css`.
- The bottom tab bar will handle its own `padding-bottom: env(safe-area-inset-bottom)` separately (see Section 3).
- The safe area padding creates a solid `#0f1117` background above the header, matching the app theme seamlessly.

### 2. Scroll Bounce Elimination

The iOS rubber-band bounce animation makes the app feel like a website rather than a native app.

**Changes:**

- Add `overscroll-behavior-y: contain` to `html` and `body` in `index.css`.
- Add `-webkit-overflow-scrolling: auto` as a fallback for older iOS Safari.
- Use `contain` rather than `none` to preserve scroll chaining within nested scrollable areas, which is more future-proof.
- Pure CSS solution — no JS scroll-locking hacks.

### 3. Layout Restructure — Bottom Tab Bar

Replace the current top navigation header and bottom footer with a minimal top title bar and a bottom tab bar.

**Top header:**

- Compact title bar showing only the current page name.
- No navigation links (those move to the tab bar).
- Sits inside the safe-area-padded container, always below the Dynamic Island.

**Bottom tab bar (`TabBar` component):**

- Fixed to the bottom of the viewport.
- Two tabs: **Home** (inline SVG icon + "首頁") and **Settings** (inline SVG icon + "設定"). Uses Chinese labels matching the app's `zh-Hant` locale. No icon library dependency — only 2 icons needed, embedded as inline SVGs.
- `padding-bottom: env(safe-area-inset-bottom)` to clear the iPhone home indicator.
- Background: `#1a1d27` with a top border `#2e303a` (matching existing card backgrounds).
- Active tab: `text-white` with `#6366f1` accent indicator.
- Inactive tab: `text-[#9ca3af]`.
- Uses `NavLink` from react-router-dom for routing.
- Content height: ~56px + safe area inset at bottom.

**Footer:**

- Removed entirely. The "JI Tools" footer text serves no functional purpose with the tab bar present.

**Main content area:**

- `<main>` gets bottom padding equal to the tab bar height to prevent content from scrolling behind it.

**Desktop behavior:**

- Tab bar remains at the bottom on all screen sizes. The app is designed for mobile PWA use and doesn't need a desktop-specific layout.

### 4. Collapsing Large Title

iOS-style large title that starts big and collapses into a compact header on scroll.

**Two states:**

- **Expanded:** Page title displayed large (text-2xl/font-bold), left-aligned, below the header bar area. The header bar is transparent/hidden — only the large title is visible.
- **Collapsed:** A compact header bar (approximately h-14) with the page title at normal size (text-sm/text-base). Solid `#0f1117` background.

**Scroll tracking:**

- Custom `useScrollPosition` hook tracks `window.scrollY` (the page-level scroll position, not a nested container).
- Title collapses when scroll exceeds a threshold (40-50px).
- Transition animated with `transition-all duration-200` for smooth collapse/expand in both directions.

**Per-page titles:**

- Home: "JI Tools"
- FX Deposit Compare: "港美定存比較"
- Marathon Savings: "馬拉松存款"
- Settings: "設定"

**Implementation:**

- The header area in `Layout.tsx` renders both the large title and the compact header.
- The compact header starts with `opacity-0` and transitions to `opacity-100` on scroll.
- The large title starts with `opacity-100` and fades to `opacity-0` as scroll increases.
- The header always occupies the `env(safe-area-inset-top)` space regardless of state.
- On the Home page, the large title includes the subtitle "前端工具集" in the expanded state.

### 5. Settings Page

A minimal settings page that completes the app feel.

**New route:** `/settings`

**Content:**

- **App info:** "JI Tools" name with current version number.
- **Reset install prompt:** A button that clears `localStorage.getItem('pwa_install_dismissed')`, re-enabling the install banner if previously dismissed.
- **GitHub link:** Link to the repository.
- **Theme section:** Shows current theme (dark only, following system).

**Styling:** Matches existing dark card style (`bg-[#1a1d27] border border-[#2e303a] rounded-xl`). Each setting is a row with border separators, similar to iOS Settings app rows.

**State management:** No complex state needed — purely reads/writes localStorage for the install prompt flag.

**New files:**

- `src/pages/Settings.tsx` — the settings page component
- Route added in `App.tsx` as `<Route path="/settings" element={<Settings />} />` inside the Layout group.

### 6. Micro-interactions & Polish

Finishing touches that eliminate "website" feel and add "native app" feel.

**Remove tap highlight:**

- Add `-webkit-tap-highlight-color: transparent` to the root/body in `index.css`.

**Active state press feedback:**

- Home page cards: `:active` → `transform: scale(0.97)` with `transition: transform 150ms ease`.
- Tab bar items: `:active` → slight opacity change (`opacity-0.7`) with transition.
- Buttons (Install, etc.): `:active` → `opacity: 0.9` with transition.

**Page transitions:**

- Subtle fade-in on route changes via CSS `@keyframes fadeIn` applied to `<main>` content.
- Duration under 150ms for snappy feel.

**Touch optimization:**

- Add `touch-action: manipulation` on interactive elements to prevent 300ms click delay and double-tap zoom.

**Status bar color:** Already set to `#0f1117` via `theme-color` meta tag and `black-translucent` status bar style — no changes needed.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/Layout.tsx` | Restructure with safe area padding, collapsing title, remove footer, add tab bar |
| `src/components/TabBar.tsx` | New — bottom tab bar component |
| `src/pages/Settings.tsx` | New — settings page |
| `src/hooks/useScrollPosition.ts` | New — scroll position tracking hook |
| `src/hooks/useInstallPrompt.ts` | Modify — expose reset function |
| `src/App.tsx` | Add `/settings` route |
| `src/index.css` | Add overscroll, tap highlight, animations, remove safe-area hack |

## Success Criteria

- Header content is fully visible below the Dynamic Island on iPhone (no overlap)
- No rubber-band bounce when scrolling past page edges
- Bottom tab bar with Home and Settings is always visible, clearing the home indicator
- Page titles collapse from large to compact on scroll and expand back on scroll-to-top
- Settings page is accessible and functional
- Footer is removed
- Card taps feel responsive with press feedback
- No blue/gray tap highlight on any interactive element