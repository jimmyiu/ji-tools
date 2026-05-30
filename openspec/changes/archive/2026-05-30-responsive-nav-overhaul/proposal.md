## Why

The current 56px bottom tab bar feels cramped on mobile — touch targets are too small and icon/label spacing too tight. On desktop, the same edge-to-edge bar wastes horizontal space. PWA banners stack awkwardly above the bottom bar. Additionally, the dark theme uses near-gray tones instead of the intended purple-tinted palette, and 17 hardcoded `text-white` instances bypass the design token system. This change addresses mobile touchability, desktop navigation UX, banner positioning, and theme consistency in a single coordinated redesign.

## What Changes

**Bottom Tab Bar → Responsive Navigation**
- From: Fixed 56px edge-to-edge bottom tab bar on all screen sizes
- To: Floating 64px capsule (mobile <1024px) + 80px vertical sidebar (desktop ≥1024px)
- Reason: Better touch targets on mobile, sidebar leverages desktop screen width, Settings pinned to bottom on sidebar
- Impact: Breaking — TabBar component refactored, new SideNav component, Layout offset logic changes

**PWA Banners: Bottom → Top**
- From: Fixed-position banners stacked above bottom tab bar with manual `bottom` calc
- To: Sticky in-flow banners at top of screen, full-width, header gets dynamic `top: totalBannerHeight`
- Reason: Eliminates complex bottom-stacking calculations, consistent across mobile/desktop, cleaner UX
- Impact: Breaking — InstallBanner, UpdateBanner, Layout offset logic, useBannerManager

**Theme Update**
- From: Near-gray dark palette (`--background: oklch(0.115 0.006 260)`) with 17 hardcoded `text-white`
- To: Purple-tinted dark palette with all colors via CSS custom properties, `text-white` → `text-foreground` / `text-primary-foreground`
- Reason: Matches intended brand aesthetic; semantic tokens enable future theme variations
- Impact: Visual change across all pages, PWA manifest `theme_color` update, Settings page removes static theme row

**Breakpoint System**
- From: No centralized breakpoints; `sm`, `lg`, `md` used ad-hoc from Tailwind defaults
- To: `src/lib/breakpoints.ts` with `DESKTOP_NAV_PX = 1024`, `@custom-variant desktop-nav`, `useIsDesktopNav()` hook
- Reason: Single source of truth for the 1024px nav breakpoint
- Impact: New file, CSS custom property additions

## Capabilities

### New Capabilities
- `responsive-navigation`: Floating capsule (<1024px) + sidebar (≥1024px) with show/hide at breakpoint, safe area handling, CSS custom property offset system, smooth transition, and skip-to-content link
- `top-positioned-banners`: Sticky in-flow banner positioning at top of screen with dynamic header offset, slide-down animation, and full-width display over sidebar

### Modified Capabilities
- `tab-bar`: Requirements change — from edge-to-edge fixed bar to floating capsule with `desktop-nav:hidden`, aria-label `底部導航`, max-w-[280px], and 64px height
- `visual-theme`: Requirements change — color tokens updated from gray-tinted to purple-tinted dark palette
- `pwa-update-prompt`: Requirements change — banner moves from fixed bottom to sticky top, stacks below InstallBanner via dynamic `top` offset
- `scroll-header-collapse`: Requirements change — header gains dynamic `top: totalBannerHeight` when banners visible, and `paddingLeft: var(--nav-left-offset)` on desktop

## Impact

- **Components**: TabBar refactored, SideNav created, Layout restructured, InstallBanner/UpdateBanner repositioned, Settings simplified
- **Hooks**: useBannerManager repurposed (totalBannerHeight for header top, not bottom padding), useIsDesktopNav added
- **Constants**: TAB_BAR_HEIGHT 56→64, SIDE_NAV_WIDTH=80, DESKTOP_NAV_PX=1024
- **CSS**: New @custom-variant, --nav-* custom properties, slide-down keyframes, theme token updates, print styles
- **Tests**: Layout.test.tsx assertions updated (72px→80px, bottom-offset restructured, new sidebar/breakpoint tests)
- **17 text-white replacements** across Home, FxDepositCompare, MarathonSavings, Settings, banner-action-button
- **No API changes**; no dependency additions