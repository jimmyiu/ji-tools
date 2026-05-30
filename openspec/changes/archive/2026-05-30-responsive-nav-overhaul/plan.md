# Responsive Nav Overhaul Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development
> to implement this plan task-by-task.

**Goal:** Replace the fixed bottom tab bar with a responsive navigation system (floating capsule on mobile, sidebar on desktop), move banners to sticky top, and update the theme to purple-tinted palette.

**Architecture:** CSS custom properties (`--nav-bottom-offset`, `--nav-left-offset`) swap at the 1024px breakpoint to control layout offsets. Banners are sticky in-flow at top with the header getting a dynamic `top: totalBannerHeight`. SideNav (desktop) and TabBar (mobile) are CSS-shown/hidden via `@custom-variant desktop-nav`.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS 4, shadcn/ui, pnpm, Vitest

---

## Task 1: Breakpoint System & CSS Custom Properties

- [ ] **Step 1.1:** Create `src/lib/breakpoints.ts` with `DESKTOP_NAV_PX = 1024`, `SIDE_NAV_WIDTH = 80`, and `useIsDesktopNav()` hook that uses `matchMedia` with `useState`/`useEffect`, returning `false` for SSR (`typeof window === 'undefined'`). Export all three.
- [ ] **Step 1.2:** Update `src/lib/constants.ts`: change `TAB_BAR_HEIGHT = 56` to `TAB_BAR_HEIGHT = 64`, add `export const SIDE_NAV_WIDTH = 80`. Add comment: `// Must match CSS values in index.css`
- [ ] **Step 1.3:** In `src/index.css`, add after the existing `@custom-variant dark` line: `@custom-variant desktop-nav (&:is(@media (min-width: 1024px)));`. In the `@theme inline` block, add `--breakpoint-desktop-nav: 1024px;`
- [ ] **Step 1.4:** In `src/index.css`, add a `:root {}` block (before `.dark {}`) with `--nav-bottom-offset: calc(104px + env(safe-area-inset-bottom)); --nav-left-offset: 0px;`. Add a `@media (min-width: 1024px) { :root { --nav-bottom-offset: 0px; --nav-left-offset: 80px; } }` rule. Add print styles: `@media print { :root { --nav-left-offset: 0 !important; --nav-bottom-offset: 0 !important; } nav, [role="alert"] { display: none !important; } }`
- [ ] **Step 1.5:** Add `@keyframes slide-down` to `src/index.css` with `from { transform: translateY(-100%); opacity: 0; }` and `to { transform: translateY(0); opacity: 1; }`. Add `.animate-slide-in { animation: slide-down 0.3s ease-out; }`. **Do NOT remove the old `@keyframes slide-up` and `.animate-slide-up` yet** — UpdateBanner still uses this class until Task 5 refactors it. Removal is in Step 5.5.
- [ ] **Step 1.6:** Run `pnpm test` to verify no regressions from CSS changes. Commit: `feat: add breakpoint system, CSS custom properties, and slide-down animation`

---

## Task 2: Theme Update

- [ ] **Step 2.1:** Update all color tokens in the `.dark {}` block of `src/index.css`. Use precise oklch values maintaining monotonic lightness (background < card < input < border):
  - `--background: oklch(0.13 0.028 265)` (≈ #1a1a2e)
  - `--card: oklch(0.17 0.028 265)` (≈ #252540)
  - `--card-foreground: oklch(0.88 0.01 260)` (keep)
  - `--popover: oklch(0.17 0.024 265)` (≈ #232340)
  - `--popover-foreground: oklch(0.88 0.01 260)` (keep)
  - `--primary: oklch(0.53 0.19 270)` (keep, ≈ #8b5cf6)
  - `--primary-foreground: oklch(0.98 0 0)` (keep)
  - `--secondary: oklch(0.20 0.028 265)` (≈ #2a2a48)
  - `--secondary-foreground: oklch(0.88 0.01 260)` (keep)
  - `--muted: oklch(0.16 0.028 265)` (≈ #1e1e32, slightly darker than card for sidebar)
  - `--muted-foreground: oklch(0.58 0.03 265)`
  - `--accent: oklch(0.20 0.028 265)` (same as secondary)
  - `--accent-foreground: oklch(0.88 0.01 260)` (keep)
  - `--border: oklch(0.22 0.028 265)` (≈ #333)
  - `--input: oklch(0.19 0.028 265)`
  - Verify: background.l < card.l < input.l < border.l and background.l < muted.l < card.l
- [ ] **Step 2.2:** Replace `text-white` with `text-foreground` in these files (16 instances total, excluding `banner-action-button.tsx` and the Settings 主題 row):
  - `src/pages/Home.tsx` line 29: `text-white` → `text-foreground`
  - `src/pages/FxDepositCompare.tsx` lines 80, 154, 166, 177, 198: all `text-white` → `text-foreground`
  - `src/pages/MarathonSavings.tsx` lines 30, 56, 108, 115, 138, 150: all `text-white` → `text-foreground` (note: line 138 is a ternary `${pr.interest > 0 ? 'text-foreground' : 'text-muted-foreground/60'}`)
  - `src/pages/Settings.tsx` lines 11, 15: `text-white` → `text-foreground`
  - `src/components/ui/banner-action-button.tsx` line 4: `text-white` → `text-primary-foreground` (on `bg-primary` background)
- [ ] **Step 2.3:** In `vite.config.ts`, update BOTH `theme_color` (line 47) AND `background_color` (line 48) from `'#0f1117'` to `'#1a1a2e'` (matching the new `--background`).
- [ ] **Step 2.4:** In `src/pages/Settings.tsx`, remove the entire `主題` row (lines 17-20: the `<div className="px-6 py-4 flex items-center justify-between border-b border-border">` containing `主題` label and `深色（跟隨系統）` value).
- [ ] **Step 2.5:** Run `pnpm test` and `pnpm build` to verify theme changes compile. Commit: `feat: update theme to purple-tinted palette, replace text-white with tokens`

---

## Task 3: SideNav Component

- [ ] **Step 3.1:** Create `src/components/SideNav.tsx`. Structure:
  ```tsx
  <nav aria-label="主導航" className="hidden desktop-nav:flex fixed left-0 top-0 bottom-0 w-20 z-40 bg-muted border-r border-border flex-col items-center"
    style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)' }}>
    <div className="flex flex-col items-center gap-1 pt-6">
      <Link to="/" className={/* active ? 'bg-primary/15 rounded-xl text-primary' : 'text-muted-foreground hover:text-foreground' */}>
        <Home className="size-6" />
        <span className="text-[11px]">首頁</span>
      </Link>
    </div>
    <div className="flex-1" />
    <div className="flex flex-col items-center gap-1 pb-6">
      <Link to="/settings" className={/* same active/inactive pattern */}>
        <Settings className="size-6" />
        <span className="text-[11px]">設定</span>
      </Link>
    </div>
  </nav>
  ```
  Use `<Link>` from `react-router-dom` for navigation. Active state: `location.pathname === '/'` for Home, `location.pathname === '/settings'` for Settings. Neither active on calculator pages. Each link item should be `flex flex-col items-center gap-1 p-2 rounded-xl`. Icons: `size-6` (24px). Labels: `text-[11px] leading-none`.
- [ ] **Step 3.2:** Verify SideNav renders at desktop viewport and is hidden on mobile. Commit: `feat: add SideNav component for desktop navigation`

---

## Task 4: TabBar Refactor

- [ ] **Step 4.1:** Refactor `src/components/TabBar.tsx`. New structure:
  ```tsx
  <nav aria-label="底部導航" className="desktop-nav:hidden fixed left-4 right-4 z-40"
    style={{ bottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
    <div className="mx-auto max-w-[280px] h-16 rounded-2xl bg-card backdrop-blur-lg shadow-lg">
      <Tabs value={currentTab} onValueChange={(v) => navigate(v)}>
        <TabsList className="w-full h-16 bg-transparent gap-0 p-0 rounded-none" variant="line">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.to} value={tab.to}
              className="flex-1 flex-col gap-1 h-full px-0 py-2 rounded-none
                data-[state=active]:text-primary data-[state=active]:bg-primary/15
                not-data-[state=active]:text-muted-foreground">
              <tab.icon className="size-[22px]" />
              <span className="text-xs leading-none">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  </nav>
  ```
  Remove: `border-t border-border`, `max-w-5xl mx-auto` wrapper, `paddingBottom: env(safe-area-inset-bottom)` style, `h-14` from TabsList. Change icon from `size-5` to `size-[22px]`, label from `text-[10px]` to `text-xs`, add `gap-1` to TabsTrigger, change `py-1` to `py-2`. Active state changes to `data-[state=active]:text-primary data-[state=active]:bg-primary/15` inline (may need to adjust the TabsTrigger variant classes).
- [ ] **Step 4.2:** Update `TAB_BAR_HEIGHT` import is still needed for `constants.ts` (value 64) but TabBar itself doesn't reference it. Verify the refactored TabBar renders correctly. Commit: `feat: refactor TabBar to floating capsule style`

---

## Task 5: Banner Repositioning

- [ ] **Step 5.1:** Refactor `src/components/InstallBanner.tsx`:
  - Change outer div from `fixed left-0 right-0 z-50` with `style={{ bottom: ... }}` to `sticky top-0 z-50 w-full`
  - Add `style={{ paddingTop: 'env(safe-area-inset-top)' }}` to the outer div
  - Change `border-t` to `border-b` (border should be at bottom for top-positioned banner)
  - Add `className` including `animate-slide-in` (replacing `animate-slide-up` if present)
  - Remove `TAB_BAR_HEIGHT` import and safe-area-inset-bottom references
  - Keep the inner `<div className="max-w-5xl mx-auto flex items-center justify-between gap-4">` for content centering
  - Remove the `bottom` style calculation entirely
- [ ] **Step 5.2:** Refactor `src/components/UpdateBanner.tsx`:
  - Change outer div from `fixed left-0 right-0 z-50` with `style={{ bottom: ... }}` to `sticky z-50 w-full`
  - Add dynamic `style={{ top: \`${installBannerHeight}px\` }}` for stacking below InstallBanner
  - Change `border-t` to `border-b`
  - Add `className` including `animate-slide-in`
  - Remove `TAB_BAR_HEIGHT` import and safe-area-inset-bottom references
  - Keep the inner `<div className="max-w-5xl mx-auto flex items-center justify-between gap-4">` for content centering
- [ ] **Step 5.3:** Update `src/hooks/useBannerManager.ts`: The hook's return values are the same (`bannerRef`, `updateBannerRef`, `installBannerHeight`, `totalBannerHeight`, `showUpdateBanner`, `dismissUpdate`) — now consumed for header `top` offset instead of bottom padding. No logic changes needed, just verify consumers use them correctly.
- [ ] **Step 5.4:** Now remove old animation from `src/index.css`: Delete `@keyframes slide-up` and `.animate-slide-up { animation: slide-up 0.3s ease-out; }`. Commit: `feat: move banners to sticky top positioning`

---

## Task 6: Layout Restructure

- [ ] **Step 6.1:** Restructure `src/components/Layout.tsx`. New DOM order:
  ```tsx
  <div className="min-h-screen min-h-[100dvh] bg-background text-foreground flex flex-col">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">跳到主內容</a>
    <InstallBanner ref={bannerRef} canInstall={canInstall} isIOS={isIOS} install={install} dismiss={dismiss} />
    <UpdateBanner ref={updateBannerRef} needRefresh={showUpdateBanner} installBannerHeight={installBannerHeight} update={update} dismiss={dismissUpdate} />
    <header style={{ top: totalBannerHeight || 0 }} className="sticky z-30 bg-background" >
      <div style={{ paddingLeft: 'var(--nav-left-offset)' }}>
        <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="max-w-5xl mx-auto px-4 flex flex-col justify-center" style={{ paddingTop: containerPT, paddingBottom: containerPB, minHeight: containerMH }}>
            <h1 className="text-foreground truncate" style={{ fontSize: titleFontSize, fontWeight: titleFontWeight }}>{pageInfo.title}</h1>
            {pageInfo.subtitle && scrollProgress < 1 && <p className="text-muted-foreground text-sm mt-1" style={{ opacity: 1 - scrollProgress }}>{pageInfo.subtitle}</p>}
          </div>
        </div>
        <div className="border-b border-border" style={{ opacity: scrollProgress }} />
      </div>
    </header>
    <SideNav />
    <main id="main-content" className="page-enter transition-[padding] duration-150 ease-out" style={{ paddingBottom: 'var(--nav-bottom-offset)', paddingLeft: 'var(--nav-left-offset)' }}>
      <Outlet />
    </main>
    <TabBar />
  </div>
  ```
  Key changes: (1) Banners before header in DOM, (2) header outer element has `style={{ paddingLeft: 'var(--nav-left-offset)' }}` and `style={{ top: totalBannerHeight || 0 }}`, (3) header `top-0` class removed from className (replaced by inline style), (4) safe-area-inset-top div moved INSIDE the paddingLeft wrapper (not removed), (5) `<main>` uses CSS custom properties for padding, (6) `page-enter` class preserved on `<main>`, (7) `useScrollLock` import and call preserved, (8) `SPACING` constant removed (no longer used), (9) `TAB_BAR_HEIGHT` import removed from Layout.
- [ ] **Step 6.2:** Add `import SideNav from './SideNav'` to Layout.tsx and render `<SideNav />` between `</header>` and `<main>`.
- [ ] **Step 6.3:** Verify that `useBannerManager` destructuring in Layout provides `totalBannerHeight` used for `style={{ top: totalBannerHeight || 0 }}` on the header, and `installBannerHeight` passed to `UpdateBanner`.
- [ ] **Step 6.4:** Run `pnpm dev` and visually verify: mobile shows floating capsule, desktop shows sidebar, both show banners at top, header collapses on scroll, skip-to-content link works. Commit: `feat: restructure layout for responsive nav with top banners`

---

## Task 7: Test Updates

- [ ] **Step 7.1:** Update `src/components/Layout.test.tsx`:
  - Change the assertion `expect(pb).toContain('72px')` to `expect(pb).toContain('var(--nav-bottom-offset)')` (inline style is now a CSS custom property, not a computed pixel value)
  - Change the assertion `expect(pb).toContain('env(safe-area-inset-bottom)')` to verify that `--nav-bottom-offset` CSS custom property is defined (this is now in CSS, not inline style, so the test should verify `main.style.paddingBottom === 'var(--nav-bottom-offset)'`)
  - Remove the assertion that checks `env(safe-area-inset-bottom)` in `paddingBottom` (it's now in the CSS custom property definition)
  - Add test: when banners are visible, `<header>` has `style.top` equal to `${totalBannerHeight}px`
  - Add test: `<main>` has `style.paddingLeft === 'var(--nav-left-offset)'`
  - Remove/update the existing `it('adjusts paddingBottom when update banner is visible')` test — it should now verify that `paddingBottom` does NOT include `totalBannerHeight` (banners no longer affect bottom padding)
- [ ] **Step 7.2:** Add tests for skip-to-content link: verify it renders with `href="#main-content"`, has `sr-only` class, and is the first child of the outer div. Add test for `id="main-content"` on `<main>`.
- [ ] **Step 7.3:** Create `src/components/SideNav.test.tsx`: test that SideNav renders with `aria-label="主導航"`, contains Home and Settings links, and has `hidden` class by default (in test environment without media query). Create basic test structure for TabBar refactor: verify `aria-label="底部導航"`, capsule styling classes, and `desktop-nav:hidden` class.
- [ ] **Step 7.4:** Run `pnpm test` and ensure all tests pass. Commit: `test: update Layout tests for responsive nav and top banners`