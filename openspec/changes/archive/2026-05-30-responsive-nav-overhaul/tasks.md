## 1. Breakpoint System & CSS Custom Properties

- [x] 1.1 Create `src/lib/breakpoints.ts` with `DESKTOP_NAV_PX = 1024`, `SIDE_NAV_WIDTH = 80`, and `useIsDesktopNav()` hook (returns boolean based on `matchMedia`, handles SSR)
- [x] 1.2 Update `src/lib/constants.ts`: change `TAB_BAR_HEIGHT` from 56 to 64, add `SIDE_NAV_WIDTH = 80`
- [x] 1.3 Add `@custom-variant desktop-nav` in `src/index.css` using `@media (min-width: 1024px)`, add `--breakpoint-desktop-nav: 1024px` to `@theme inline` block
- [x] 1.4 Add CSS custom properties `--nav-bottom-offset` and `--nav-left-offset` to `src/index.css` with mobile defaults and desktop overrides at 1024px breakpoint
- [x] 1.5 Add `slide-down` keyframes to `src/index.css` (`translateY(-100%); opacity: 0` → `translateY(0); opacity: 1`) and remove old `slide-up` keyframes and `.animate-slide-up` class
- [x] 1.6 Add print styles to `src/index.css`: zero nav offsets, hide `nav` and `[role="alert"]`

## 2. Theme Update

- [x] 2.1 Update all color tokens in `.dark {}` block in `src/index.css` to purple-tinted palette values
- [x] 2.2 Replace all 17 `text-white` instances across components/pages with `text-foreground` (16 instances) or `text-primary-foreground` (1 instance: `banner-action-button.tsx` which is on `bg-primary`). Note: the `主題` row in Settings (1 of the 17) will be removed by task 2.4, so replace the remaining 16.
- [x] 2.3 Update PWA manifest `theme_color` in `vite.config.ts` to match new `--background` hex value
- [x] 2.4 Remove the static `主題` row from `src/pages/Settings.tsx`

## 3. SideNav Component

- [x] 3.1 Create `src/components/SideNav.tsx` with `<nav aria-label="主導航">`, fixed left sidebar, `hidden desktop-nav:flex`, `bg-muted border-r border-border`, icon + label layout, Home at top, Settings at bottom, active state `bg-primary/15 rounded-xl text-primary`
- [x] 3.2 Add safe area padding to SideNav: `pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]`

## 4. TabBar Refactor

- [x] 4.1 Refactor `src/components/TabBar.tsx` to floating capsule style: `fixed` positioning, `bottom: calc(24px + env(safe-area-inset-bottom))`, `left-4 right-4 max-w-[280px] mx-auto`, `h-16 rounded-2xl bg-card backdrop-blur-lg`, `z-40`, `desktop-nav:hidden`, `<nav aria-label="底部導航">`
- [x] 4.2 Update TabBar internal styling: icon 22px, label 12px font, gap 4px, py-2 on triggers

## 5. Banner Repositioning

- [x] 5.1 Refactor `src/components/InstallBanner.tsx`: change from fixed bottom to `sticky top-0 z-50 w-full` with `slide-down` animation class, remove `TAB_BAR_HEIGHT` and safe-area bottom positioning
- [x] 5.2 Refactor `src/components/UpdateBanner.tsx`: change from fixed bottom to `sticky z-50 w-full` with `style={{ top: \`${installBannerHeight}px\` }}` for stacking below InstallBanner, apply `slide-down` animation
- [x] 5.3 Update `src/hooks/useBannerManager.ts`: `totalBannerHeight` is now used for header `top` offset, not for bottom padding calculation

## 6. Layout Restructure

- [x] 6.1 Restructure `src/components/Layout.tsx`: move banners before header in DOM, add dynamic `top: totalBannerHeight` style on header, add `paddingLeft: var(--nav-left-offset)` to the outer `<header>` element on desktop (NOT the inner max-w-5xl container), add `paddingBottom: var(--nav-bottom-offset)` and `paddingLeft: var(--nav-left-offset)` on `<main>`, remove old `bottomOffset` calc that included `TAB_BAR_HEIGHT + totalBannerHeight`
- [x] 6.2 Add `transition-[padding] duration-150 ease-out` class to `<main>` element only (NOT to header which has JS-driven scroll animation)
- [x] 6.3 Add `<SideNav />` component to Layout
- [x] 6.4 Add skip-to-content link: `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">跳到主內容</a>` as first element
- [x] 6.5 Add `id="main-content"` to `<main>` element
- [x] 6.6 Remove `TAB_BAR_HEIGHT` import and `bottomOffset` calculation from Layout (now handled by CSS custom properties)

## 7. Test Updates

- [x] 7.1 Update `src/components/Layout.test.tsx`: change `72px` assertion to `80px` (TAB_BAR_HEIGHT 64 + SPACING 16), restructure bottom-offset tests to use `var(--nav-bottom-offset)` instead of inline calc, add test for header `top` style when banners visible
- [x] 7.2 Add tests for skip-to-content link rendering and href
- [x] 7.3 Add tests verifying `--nav-left-offset` and `--nav-bottom-offset` CSS custom property values at mobile and desktop breakpoints