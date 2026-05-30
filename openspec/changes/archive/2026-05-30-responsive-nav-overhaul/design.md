## Responsive Navigation Design

### Architecture Overview

```
Mobile (<1024px)                    Desktop (≥1024px)
┌──────────────────────┐           ┌────┬────────────────────┐
│   [Banner - sticky]  │           │    │   [Banner - sticky] │
│                       │           │ 🏠 │                     │
│   Header (sticky)    │           │首頁 │   Header (sticky)   │
│   top: bannerHt      │           │    │   top: bannerHt     │
│                       │           │    │   padL: 80px        │
│   Content             │           │    │                     │
│   padB: nav-bottom   │           │    │   Content            │
│                       │           │    │   padL: 80px         │
│                       │           │    │                     │
│  ┌─────────────────┐  │           │    │                     │
│  │  🏠 首頁 ⚙️ 設定│  │           │ ⚙️ │                     │
│  └─────────────────┘  │           │設定 │                     │
│   (floating capsule)  │           └────┴────────────────────┘
└──────────────────────┘              sidebar (80px, bg-muted)
```

### Component Structure

```tsx
// Layout.tsx (simplified)
<div className="min-h-dvh">
  <SkipToContent />          {/* sr-only focus:not-sr-only */}
  <InstallBanner />          {/* sticky top-0, in-flow, z-50 */}
  <UpdateBanner />           {/* sticky z-50, dynamic top: installBannerHeight, stacks below InstallBanner */}
  <header style={{ top: totalBannerHeight }} className="sticky z-30 bg-background transition-none">
    ...
  </header>
  <SideNav />                {/* hidden desktop-nav:flex */}
  <main id="main-content" style={{
    paddingBottom: 'var(--nav-bottom-offset)',
    paddingLeft: 'var(--nav-left-offset)',
  }} className="transition-[padding] duration-150 ease-out">
    <Outlet />
  </main>
  <TabBar />                {/* desktop-nav:hidden */}
</div>
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/breakpoints.ts` | `DESKTOP_NAV_PX = 1024`, `SIDE_NAV_WIDTH = 80`, `useIsDesktopNav()` hook |
| `src/components/SideNav.tsx` | Desktop sidebar, `<nav aria-label="主導航">`, Home top, Settings bottom |

### Files to Modify

| File | Changes |
|------|---------|
| `src/lib/constants.ts` | `TAB_BAR_HEIGHT` 56→64, add `SIDE_NAV_WIDTH = 80` |
| `src/index.css` | Theme tokens update, `@custom-variant desktop-nav`, `--nav-*` CSS custom properties, `slide-down` keyframes, remove `slide-up`, print styles |
| `src/components/Layout.tsx` | CSS custom property offsets, render SideNav, dynamic `top` on header, skip-to-content link, `transition-[padding] duration-150` on main only |
| `src/components/TabBar.tsx` | Refactor to floating capsule, `<nav aria-label="底部導航">`, `desktop-nav:hidden` |
| `src/components/InstallBanner.tsx` | Sticky top positioning, full-width (over sidebar), `slide-down` animation |
| `src/components/UpdateBanner.tsx` | Sticky top positioning (stacks below InstallBanner via `top: installBannerHeight`), `slide-down` animation |
| `src/hooks/useBannerManager.ts` | `totalBannerHeight` used for header `top` offset (not bottom padding) |
| `src/components/Layout.test.tsx` | Update 72px→80px assertion, restructure for top banners, add sidebar/tests |
| `src/pages/Settings.tsx` | Remove `主題` row |
| `src/pages/Home.tsx` | `text-white` → `text-foreground` |
| `src/pages/FxDepositCompare.tsx` | `text-white` → `text-foreground` |
| `src/pages/MarathonSavings.tsx` | `text-white` → `text-foreground` |
| `src/components/ui/banner-action-button.tsx` | `text-white` → `text-primary-foreground` (on primary bg) |
| `vite.config.ts` | Update `theme_color` to match new `--background` |

### CSS Custom Properties

```css
:root {
  --nav-bottom-offset: calc(104px + env(safe-area-inset-bottom));
  /* 104px = 64px capsule height + 16px spacing + 24px capsule bottom offset */
  --nav-left-offset: 0px;
}

@media (min-width: 1024px) {
  :root {
    --nav-bottom-offset: 0px;
    --nav-left-offset: 80px;
  }
}

@media print {
  :root {
    --nav-left-offset: 0 !important;
    --nav-bottom-offset: 0 !important;
  }
  nav, [role="alert"] { display: none !important; }
}
```

### Breakpoint Module

```ts
// src/lib/breakpoints.ts
export const DESKTOP_NAV_PX = 1024
export const SIDE_NAV_WIDTH = 80

export function useIsDesktopNav() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(`(min-width: ${DESKTOP_NAV_PX}px)`).matches
      : false
  )
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_NAV_PX}px)`)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return isDesktop
}
```

### SideNav Layout

```
┌──────────┐
│  env     │ ← safe-area-inset-top
│   🏠     │ ← Home (flex-start)
│  首頁     │
│          │
│ (spacer) │
│          │
│   ⚙️     │ ← Settings (flex-end)
│  設定     │
│  env     │ ← safe-area-inset-bottom
└──────────┘
```

- `position: fixed; left: 0; top: 0; bottom: 0; width: 80px; z-40`
- Background: `bg-muted` (darker purple-tinted token, not hardcoded hex)
- Border: `border-r border-border`
- Active state: `bg-primary/15 rounded-xl text-primary`
- Inactive state: `text-muted-foreground hover:text-foreground`
- Safe areas: `pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]`
- `<nav aria-label="主導航">`
- CSS: `hidden desktop-nav:flex`

### TabBar Capsule Layout (mobile)

```
  ┌────────────────────────┐
  │   🏠        ⚙️         │  ← 22px icons
  │  首頁      設定         │  ← 12px labels, 4px gap
  └────────────────────────┘
       ↑ rounded-2xl, bg-card backdrop-blur-lg, shadow-lg
       position: fixed
       bottom: calc(24px + env(safe-area-inset-bottom))
       left: 16px; right: 16px
       height: 64px; max-width: 280px
       margin: 0 auto
```

- `<nav aria-label="底部導航">`
- CSS: `desktop-nav:hidden`
- `TAB_BAR_HEIGHT = 64` (was 56)

### Banner Positioning

- **Both banners:** `position: sticky; top: 0; z-50; w-full`
- **Banners are full-width on desktop** (spanning over the sidebar)
- **InstallBanner:** `top: 0` by default, `paddingTop: env(safe-area-inset-top)` to avoid device notch
- **UpdateBanner:** `top: ${installBannerHeight}px` to stack below InstallBanner
- **Header:** `style={{ top: totalBannerHeight }}` so it sticks below the banner area
- **Animation:** `slide-down` keyframes (`translateY(-100%)` → `translateY(0)`) replacing `slide-up`; remove old `slide-up` keyframes and `.animate-slide-up` class
- **No banner height in `paddingBottom`** — banners take document space naturally at the top, and the header's dynamic `top` compensates

### z-index Stack

| Element | z-index |
|---------|---------|
| Header | z-30 |
| Sidebar / TabBar | z-40 |
| Banners | z-50 |

### Safe Area Handling

- **Mobile capsule:** `bottom: calc(24px + env(safe-area-inset-bottom))` (single property, no double-counting)
- **Desktop sidebar:** `padding-top: env(safe-area-inset-top)`, `padding-bottom: env(safe-area-inset-bottom)`, `padding-left: env(safe-area-inset-left)` (landscape notch)
- **Header:** Already handles `env(safe-area-inset-top)` — unchanged

### Transition

- `<main>`: `transition-[padding] duration-150 ease-out` — smooth breakpoint resize
- `<header>` outer element: `paddingLeft: var(--nav-left-offset)` on desktop (NOT the inner max-w-5xl container, which must preserve `px-4` on mobile where --nav-left-offset is 0px)
- `<main>`: **NO transition** on header — conflicts with JS scroll animation
- Nav elements: instant show/hide via CSS `hidden`/`flex` toggle

### Theme Update

Update `.dark {}` color tokens to purple-tinted values matching prototype palettes. All colors via CSS tokens — no hardcoded hex in components.

| Token | Current (oklch) | New |
|-------|-----------------|-----|
| --background | 0.115 0.006 260 | Purple-tinted deep dark |
| --card | 0.155 0.008 260 | Purple-tinted card |
| --popover | 0.17 0.01 260 | Purple-tinted |
| --border | 0.21 0.008 260 | Purple-tinted border |
| --muted | 0.17 0.008 260 | Purple-tinted muted |
| --muted-foreground | 0.55 0.02 260 | Adjusted |
| --secondary | 0.195 0.01 260 | Purple-tinted |
| --accent | 0.195 0.01 260 | Purple-tinted |
| --input | 0.19 0.01 260 | Purple-tinted |

Replace all 17 `text-white` instances:
- 16 instances in pages/components → `text-foreground`
- 1 instance in `banner-action-button.tsx` → `text-primary-foreground` (on primary bg)

Remove static `主題` row from Settings page.
Update PWA manifest `theme_color` from `#0f1117` to new background hex.

### Accessibility

- Skip-to-content link: `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">跳到主內容</a>` as first element in Layout
- `id="main-content"` on `<main>`
- SideNav: `<nav aria-label="主導航">`
- TabBar: `<nav aria-label="底部導航">`
- `useIsDesktopNav()` handles SSR (returns `false` on server)

### Test Updates

- `Layout.test.tsx`: `72px` → `80px` in padding assertion (TAB_BAR_HEIGHT 64 + SPACING 16)
- Bottom offset assertions restructured (no banner height in `paddingBottom`)
- Test `top` style on header includes `totalBannerHeight` when banners visible
- New tests: sidebar visibility at breakpoint, `--nav-left-offset` value, `--nav-bottom-offset` value
- Test skip-to-content link renders with correct href