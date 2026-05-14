# Bottom Spacing Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the expanding bottom gap, InstallBanner overlaying TabBar, and missing safe-area handling so that bottom spacing is always consistent and the bottom bar elements stack correctly.

**Architecture:** Remove `flex-1` from `<main>` so it doesn't stretch with viewport changes. Lift `useInstallPrompt` state to Layout, use a ref to measure InstallBanner height dynamically, and set a CSS custom property `--bottom-offset` on the root element. InstallBanner shifts above TabBar via `bottom: calc(56px + env(safe-area-inset-bottom))`. Main's `paddingBottom` uses `var(--bottom-offset)` to always clear the bottom bar zone.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, React Testing Library

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/components/Layout.tsx` | Root layout — owns `useInstallPrompt`, measures banner height, sets `--bottom-offset`, passes props to `InstallBanner` |
| `src/components/InstallBanner.tsx` | Install banner — accepts props instead of hook, positioned above TabBar, forwards ref for height measurement |
| `src/components/TabBar.tsx` | No changes — stays `fixed bottom-0` |
| `src/components/Layout.test.tsx` | Updated tests for new bottom padding behavior |

---

### Task 1: Convert InstallBanner from hook-based to prop-based with ref forwarding

**Files:**
- Modify: `src/components/InstallBanner.tsx`
- Test: `src/components/Layout.test.tsx`

- [ ] **Step 1: Update InstallBanner to accept props and forward ref**

Replace the hook-based internals with props from the parent. Add `forwardRef` so Layout can measure the banner's height.

```tsx
import { forwardRef } from 'react'

interface InstallBannerProps {
  canInstall: boolean
  isIOS: boolean
  install: () => Promise<void>
  dismiss: () => void
}

const InstallBanner = forwardRef<HTMLDivElement, InstallBannerProps>(
  function InstallBanner({ canInstall, isIOS, install, dismiss }, ref) {
    if (!canInstall) return null

    return (
      <div
        ref={ref}
        className="fixed left-0 right-0 z-50 p-4 bg-[#1a1d27] border-t border-[#2e303a]"
        style={{ bottom: 'calc(56px + env(safe-area-inset-bottom))', paddingBottom: '1rem' }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {isIOS ? '安裝 JI Tools 到主屏幕' : '安裝 JI Tools'}
            </p>
            {isIOS && (
              <p className="text-xs text-[#9ca3af] mt-1">
                點擊下方
                <svg
                  className="inline-block w-4 h-4 mx-0.5 align-text-bottom"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                分享按鈕，然後選擇「加入主畫面」
              </p>
            )}
          </div>
          {!isIOS && (
            <button
              onClick={install}
              className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-[#6366f1] rounded-lg hover:bg-[#818cf8] transition-colors"
            >
              安裝
            </button>
          )}
          <button
            onClick={dismiss}
            className="shrink-0 p-1 text-[#9ca3af] hover:text-white transition-colors"
            aria-label="關閉"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    )
  }
)

export default InstallBanner
```

- [ ] **Step 2: Verify existing tests still pass**

Run: `npx vitest run src/components/Layout.test.tsx`

The Layout tests mock `useInstallPrompt` indirectly through the Layout component. Since Layout hasn't been updated yet, this step is a checkpoint — the import of `InstallBanner` will now expect props, but Layout still renders `<InstallBanner />` without props. The component will render `null` because `canInstall` defaults to `undefined` (falsy). We'll update Layout in Task 2.

Expected: Tests may fail because `InstallBanner` now requires props. We'll fix this in Task 2.

- [ ] **Step 3: Commit**

```bash
git add src/components/InstallBanner.tsx
git commit -m "refactor: convert InstallBanner from hook-based to prop-based with ref forwarding"
```

---

### Task 2: Update Layout to own install prompt state, measure banner height, and set --bottom-offset

**Files:**
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Update Layout.tsx**

```tsx
import { useRef, useState, useLayoutEffect, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useScrollPosition } from '../hooks/useScrollPosition'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import TabBar from './TabBar'
import InstallBanner from './InstallBanner'

const TAB_BAR_HEIGHT = 56
const SPACING = 16

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'JI Tools' },
  '/fx-deposit-compare': { title: '港美定存比較' },
  '/marathon-savings': { title: '馬拉松存款' },
  '/settings': { title: '設定' },
}

export default function Layout() {
  const location = useLocation()
  const { isScrolled } = useScrollPosition(44)
  const pageInfo = pageTitles[location.pathname] ?? { title: 'JI Tools' }
  const { canInstall, isIOS, dismiss, install } = useInstallPrompt()
  const [bannerHeight, setBannerHeight] = useState(0)
  const bannerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (bannerRef.current) {
      setBannerHeight(bannerRef.current.offsetHeight)
    } else {
      setBannerHeight(0)
    }
  }, [canInstall])

  const bottomOffset = canInstall
    ? `${SPACING + bannerHeight + TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom)`
    : `${SPACING + TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom)`

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0f1117] text-[#e2e8f0] flex flex-col">
      <header
        className={`sticky top-0 z-30 bg-[#0f1117] transition-all duration-200 ${
          isScrolled ? 'border-b border-[#2e303a]' : ''
        }`}
      >
        {isScrolled ? (
          <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="max-w-5xl mx-auto px-4 h-11 flex items-center">
              <h2 className="text-base font-semibold text-white truncate">{pageInfo.title}</h2>
            </div>
          </div>
        ) : (
          <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="max-w-5xl mx-auto px-4 pt-2 pb-2">
              <h1 className="text-2xl font-bold text-white">{pageInfo.title}</h1>
              {pageInfo.subtitle && (
                <p className="text-[#9ca3af] text-sm mt-1">{pageInfo.subtitle}</p>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="page-enter" style={{ paddingBottom: bottomOffset }}>
        <Outlet />
      </main>

      <InstallBanner ref={bannerRef} canInstall={canInstall} isIOS={isIOS} install={install} dismiss={dismiss} />
      <TabBar />
    </div>
  )
}
```

Key changes:
1. `useInstallPrompt` called in Layout instead of InstallBanner
2. `bannerRef` + `useLayoutEffect` measure banner height
3. `bottomOffset` computed dynamically with banner height, TabBar height, and safe area
4. `<main>` loses `flex-1` and `pb-[72px]`, gains inline `paddingBottom: bottomOffset`
5. `<InstallBanner>` receives `ref`, `canInstall`, `isIOS`, `install`, `dismiss` as props

- [ ] **Step 2: Verify the app builds and renders**

Run: `npx vite build`

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "feat: Layout owns install prompt state and sets dynamic bottom offset"
```

---

### Task 3: Update tests for the new bottom spacing behavior

**Files:**
- Modify: `src/components/Layout.test.tsx`

- [ ] **Step 1: Update Layout bottom spacing tests**

The old tests checked for `pb-[72px]` class and `h-14` spacer div absence. The new layout uses inline `style={{ paddingBottom }}` instead of a Tailwind class.

Replace the `Layout bottom spacing` test block:

```tsx
describe('Layout bottom spacing', () => {
  it('does not render an h-14 spacer div', () => {
    const { container: c } = renderWithRouter(<Layout />)
    expect(c.querySelector('div[class="h-14"]')).not.toBeInTheDocument()
  })

  it('renders main without flex-1 class', () => {
    const { container: c } = renderWithRouter(<Layout />)
    const main = c.querySelector('main')
    expect(main).not.toHaveClass('flex-1')
  })

  it('sets paddingBottom on main to include TabBar height and spacing', () => {
    const { container: c } = renderWithRouter(<Layout />)
    const main = c.querySelector('main')
    expect(main).toHaveStyle({ paddingBottom: '72px + env(safe-area-inset-bottom)' })
  })
})
```

Note: `toHaveStyle` may normalize CSS values. Since `bottomOffset` produces a string like `72px + env(safe-area-inset-bottom)` (when no banner), the exact assertion may need adjustment based on how testing-library handles `env()`. If `toHaveStyle` cannot match `env()`, use a simpler assertion on the `style` attribute:

```tsx
it('sets paddingBottom style on main', () => {
  const { container: c } = renderWithRouter(<Layout />)
  const main = c.querySelector('main')
  const paddingBottom = (main as HTMLElement).style.paddingBottom
  expect(paddingBottom).toContain('72px')
  expect(paddingBottom).toContain('env(safe-area-inset-bottom)')
})
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/components/Layout.test.tsx`

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/Layout.test.tsx
git commit -m "test: update Layout bottom spacing tests for dynamic offset"
```

---

### Task 4: Full test suite run and visual verification

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`

Expected: All tests pass.

- [ ] **Step 2: Verify visually in browser**

Run: `npx vite dev --host`

Check in mobile viewport (DevTools device toolbar):
1. Scroll to bottom — gap between last card and TabBar should be consistent (~16px), not expanding
2. If InstallBanner is visible, it should sit above TabBar, not overlap it
3. Rotate device or hide/show browser chrome — gap should remain constant
4. Dismiss the banner — gap should shrink to just TabBar + 16px spacing

- [ ] **Step 3: Final commit if any minor fixes were needed**

```bash
git add -A
git commit -m "fix: bottom spacing and banner stacking visual polish"
```