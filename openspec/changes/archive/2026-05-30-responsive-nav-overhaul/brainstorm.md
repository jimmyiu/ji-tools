## Design Summary

Replace the fixed bottom tab bar with a responsive navigation system: a **floating capsule** on mobile (<1024px) and a **sidebar** on desktop (≥1024px). Centralize breakpoints into a shared module. Move PWA banners (install/update) to the top of the screen as sticky in-flow elements. Update the dark theme to purple-tinted colors.

### Problems Solved
- Current 56px tab bar is too short and text/icon too packed on mobile
- No responsive adaptation for wider screens — same bottom bar on desktop
- Breakpoints scattered / undefined as project constants
- PWA banners awkwardly stacked above bottom bar
- Hardcoded `text-white` instead of semantic tokens throughout the app
- Theme colors are near-gray instead of the intended purple-tinted dark palette

### Visual Prototype Reference
See brainstorm server mockups: approach-c-prototype.html, desktop-options.html, sidebar-styles.html, banner-positioning.html, banner-scrolling.html, layout-structure.html, theme-comparison.html, resize-transition.html

## Alternatives Considered

### 方案 A：Increase height + spacing only
- **做法**：Keep fixed edge-to-edge bottom bar, increase TAB_BAR_HEIGHT from 56→64, add gap between icon and label, bump text from 10px→12px
- **優點**：Smallest change, single constant drives everything, no responsive logic needed
- **缺點**：Doesn't solve desktop UX — same cramped bar stretched wide, doesn't leverage screen real estate
- **為何未採用**：User explicitly chose the floating capsule + sidebar approach after seeing visual prototypes

### 方案 B：Floating capsule only (no sidebar)
- **做法**：Floating rounded capsule on all screen widths, keeping bottom positioning throughout
- **優點**：Single component, simpler responsive logic
- **缺點**：On desktop, a narrow floating capsule at the bottom looks detached and doesn't use available horizontal space well
- **為何未採用**：User chose sidebar for desktop after seeing side-by-side mockup comparison

### 方案 C（採用）：Floating capsule (mobile) + Sidebar (desktop)
- **做法**：Responsive navigation with CSS @media at 1024px breakpoint: floating capsule below 1024px, vertical sidebar at 1024px+. Banners move to top of screen as sticky in-flow elements. Theme updated to purple-tinted palette. All hardcoded colors replaced with CSS tokens.
- **優點**：Optimal UX at both sizes, sidebar uses desktop horizontal space, capsule provides better mobile touch targets, centralized breakpoints, semantic color tokens
- **缺點**：More components to build (TabBar refactor + new SideNav), dual layout model increases test surface, layout offset logic more complex
- **為何採用**：User selected after visual prototype review; best mobile and desktop experience

### Banner positioning: Sticky in-flow (chosen)
- **做法**：Banners are `position: sticky; top: 0; z-50` in document flow, before the header. Header gets dynamic `top: totalBannerHeight` so it sticks below banners.
- **優點**：Natural document flow — no manual padding compensation needed for content. Banner dismissal shifts header up naturally.
- **缺點**：Requires dynamic `top` style on header
- **Alternative 考慮並未採用**：Fixed overlay banners require `paddingTop` + `top` compensation, more moving parts for same result.

### Sidebar background: Darker bg (chosen)
- **做法**：Sidebar uses `bg-muted` (darker than card, purple-tinted), creating visual distinction from content area
- **優點**：Pronounced sidebar feel, clear visual separation
- **Alternative 考慮並未採用**：Same-as-card blend in; glass/blur unnecessary for fixed sidebar

## Agreed Approach

### Mobile (< 1024px): Floating Capsule
- **Width:** `max-w-[280px]`, centered with `mx-auto`
- **Height:** 64px (up from current 56px), updated `TAB_BAR_HEIGHT = 64`
- **Position:** `position: fixed; bottom: calc(24px + env(safe-area-inset-bottom)); left: 16px; right: 16px` — single property, no double-counting
- **Background:** `bg-card backdrop-blur-lg shadow-lg`
- **Internal spacing:** Icon 22px, label 12px font-size, gap 4px, py-2 on each tab trigger
- **Tab items:** Same tabs array (首頁, 設定), icon + label stacked vertically, centered
- **ARIA:** `<nav aria-label="底部導航">`
- **CSS:** `desktop-nav:hidden`

### Desktop (≥ 1024px): Sidebar
- **Width:** 80px fixed, left side, full height
- **Position:** `position: fixed; left: 0; top: 0; bottom: 0; z-40`
- **Style:** Icon (24px) + label (11px) vertically stacked, active `bg-primary/15 rounded-xl text-primary`, inactive `text-muted-foreground`
- **Background:** `bg-muted border-r border-border` (darker, purple-tinted — no hardcoded hex)
- **Settings at bottom:** Home at top (flex-start), Settings pinned to bottom (flex-end)
- **Safe areas:** `pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]`
- **ARIA:** `<nav aria-label="主導航">`
- **CSS:** `hidden desktop-nav:flex`

### Breakpoint System
- `src/lib/breakpoints.ts`: `DESKTOP_NAV_PX = 1024`, `SIDE_NAV_WIDTH = 80`, `useIsDesktopNav()` hook
- `src/index.css`: `@custom-variant desktop-nav` at `--breakpoint-desktop-nav: 1024px`

### Banner Behavior
- **All screen sizes:** `position: sticky; top: 0; z-50; w-full` — in document flow, no manual padding needed
- **Full-width on desktop** (spans over sidebar)
- **InstallBanner:** `top: 0`
- **UpdateBanner:** `top: ${installBannerHeight}px` (stacks below InstallBanner)
- **Header:** dynamic `style={{ top: totalBannerHeight }}` to stick below banner area
- **Animation:** `slide-down` keyframes (`translateY(-100%); opacity: 0` → `translateY(0); opacity: 1`), replacing `slide-up`
- **InstallBanner safe area:** `paddingTop: env(safe-area-inset-top)` on InstallBanner to avoid device notch
- **No banner height in `paddingBottom`** — banners take document space naturally at top; `totalBannerHeight` used only for header `top` offset

### Layout Offsets
- CSS custom properties swap at breakpoint:
  - Mobile: `--nav-bottom-offset: calc(104px + env(safe-area-inset-bottom))` (64px capsule + 16px spacing + 24px bottom offset)
  - Desktop: `--nav-bottom-offset: 0px`, `--nav-left-offset: 80px`
- `<main>`: `paddingBottom: var(--nav-bottom-offset)`, `paddingLeft: var(--nav-left-offset)`
- `<header>` outer element: `paddingLeft: var(--nav-left-offset)` on desktop (NOT the inner max-w-5xl, which must keep `px-4`)
- `transition-[padding] duration-150 ease-out` on `<main>` only (not header — conflicts with JS scroll animation)

### Theme Update
- All 12 color tokens in `.dark {}` updated to purple-tinted values
- All 17 `text-white` → `text-foreground` (16 instances) or `text-primary-foreground` (1 instance on `bg-primary` buttons)
- PWA manifest `theme_color` updated to match new background
- Remove static `主題` row from Settings page

### Accessibility
- Skip-to-content link: first element in Layout, `sr-only focus:not-sr-only`, `href="#main-content"`
- `id="main-content"` on `<main>`
- Differentiated `aria-label`: `主導航` (SideNav), `底部導航` (TabBar)
- `useIsDesktopNav()` handles SSR (returns `false` on server)

### Print Styles
- Hide nav and banners: `nav, [role="alert"] { display: none !important; }`
- Zero offsets: `--nav-left-offset: 0 !important; --nav-bottom-offset: 0 !important;`

## Key Decisions

1. **Breakpoint at 1024px** — matches `max-w-5xl` content width; desktop nav appears when there's enough screen for sidebar
2. **Settings icon at bottom of sidebar** — common UX pattern (VS Code, many iOS apps)
3. **Banners sticky in-flow at top** — consistent across mobile/desktop, natural document flow, no manual padding compensation for content
4. **CSS custom properties for layout offsets** — avoids JS-based layout flicker at breakpoint
5. **Centralized breakpoint module** — single source of truth for future responsive features
6. **Darker sidebar background (`bg-muted`)** — creates clear visual distinction, uses CSS tokens not hardcoded hex
7. **Full-width banners over sidebar** — simpler CSS, more noticeable for install prompts
8. **`transition-[padding]` on main only** — not on header which has JS-driven scroll animation
9. **All colors via CSS tokens** — no hardcoded hex or `text-white` in components
10. **Remove static theme row** — app is dark-only, no theme switching

## Validated Review Findings

Addressed in design:
- Capsule uses `bottom: calc(24px + env(safe-area-inset-bottom))` — no double-count of safe-area
- `--nav-bottom-offset` includes `env(safe-area-inset-bottom)` in the calc
- Header gets dynamic `top: totalBannerHeight` to avoid overlap with sticky banner at top:0
- Banner height NOT included in `paddingBottom` — only in header `top`
- `text-white` on `bg-primary` buttons uses `text-primary-foreground` instead
- Print styles use `[role="alert"]` selector (not `.banner` which doesn't exist)
- Sidebar uses `bg-muted` CSS token, not hardcoded hex
- Old `slide-up` keyframes removed when adding `slide-down`
- Capsule `max-width` is exact: `max-w-[280px]`
- Different `aria-label` for each nav component