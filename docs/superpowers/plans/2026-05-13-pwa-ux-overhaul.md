# PWA UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform JI Tools from a website-in-fullscreen to a native-feeling iOS PWA by fixing safe area overlaps, eliminating scroll bounce, adding a bottom tab bar, implementing a collapsing large title, and polishing micro-interactions.

**Architecture:** Layered CSS-first fixes for safe area and scroll, then new React components for the tab bar, collapsing title, and settings page. The Layout component is the central change — it gets restructured from top-nav+footer to safe-area-shell+compact-header+tab-bar. A `useScrollPosition` hook drives the collapsing title. A new `/settings` route provides a minimal settings page.

**Tech Stack:** React 19, React Router DOM 7, Tailwind CSS 4, Vite, TypeScript, Vitest + React Testing Library

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/index.css` | Global CSS: overscroll, tap highlight, page transition animation, remove safe-area hack |
| `src/hooks/useScrollPosition.ts` | New — hook that tracks `window.scrollY` and returns `isScrolled` boolean |
| `src/hooks/useScrollPosition.test.ts` | New — tests for the scroll position hook |
| `src/hooks/useInstallPrompt.ts` | Modify — add `resetDismissed` function to re-enable install banner |
| `src/hooks/useInstallPrompt.test.ts` | Modify — add test for `resetDismissed` |
| `src/components/TabBar.tsx` | New — bottom tab bar with Home and Settings tabs using inline SVGs |
| `src/components/CollapsingHeader.tsx` | New — compact header bar that fades in on scroll |
| `src/components/Layout.tsx` | Major restructure — safe area shell, collapsing title area, remove footer, add TabBar |
| `src/components/InstallBanner.tsx` | Modify — remove `safe-area-bottom` class, use inline style |
| `src/pages/Settings.tsx` | New — minimal settings page with app info, GitHub link, install prompt reset |
| `src/pages/Home.tsx` | Modify — remove redundant h1/subtitle, add active press feedback on cards |
| `src/pages/FxDepositCompare.tsx` | Modify — remove h1, keep description, add page-enter animation |
| `src/pages/MarathonSavings.tsx` | Modify — remove h1, keep description, add page-enter animation |
| `src/App.tsx` | Modify — add `/settings` route |

---

### Task 1: CSS Foundations — Safe Area, Scroll Bounce, Tap Highlight, Transitions

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Update `index.css` with CSS foundations**

Replace the entire content of `src/index.css` with:

```css
@import "tailwindcss";

:root {
  color-scheme: dark;
}

html, body {
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: auto;
}

body {
  background: #0f1117;
  color: #e2e8f0;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  -webkit-tap-highlight-color: transparent;
}

#root {
  min-height: 100vh;
  min-height: 100dvh;
}

a, button, [role="button"] {
  touch-action: manipulation;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.page-enter {
  animation: fadeIn 120ms ease-out;
}
```

Key changes:
- Removed `:root { padding-bottom }` and `.safe-area-bottom` — handled by Layout now
- Added `overscroll-behavior-y: contain` and `-webkit-overflow-scrolling: auto` for scroll bounce fix
- Added `-webkit-tap-highlight-color: transparent` to remove iOS tap highlight
- Added `100dvh` fallback for dynamic viewport height
- Added `touch-action: manipulation` on interactive elements
- Added `fadeIn` keyframe animation for page transitions

- [ ] **Step 2: Verify CSS builds**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add safe area, scroll bounce, tap highlight, and transition CSS"
```

---

### Task 2: useScrollPosition Hook

**Files:**
- Create: `src/hooks/useScrollPosition.ts`
- Create: `src/hooks/useScrollPosition.test.ts`

- [ ] **Step 1: Write the failing test for `useScrollPosition`**

Create `src/hooks/useScrollPosition.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollPosition } from './useScrollPosition'

describe('useScrollPosition', () => {
  let originalScrollY: number

  beforeEach(() => {
    originalScrollY = window.scrollY
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.scrollY = originalScrollY
  })

  it('returns isScrolled false when scroll position is 0', () => {
    window.scrollY = 0
    const { result } = renderHook(() => useScrollPosition(50))
    expect(result.current.isScrolled).toBe(false)
  })

  it('returns isScrolled true when scroll position exceeds threshold', () => {
    window.scrollY = 60
    const { result } = renderHook(() => useScrollPosition(50))
    expect(result.current.isScrolled).toBe(true)
  })

  it('returns isScrolled false when scroll position is below threshold', () => {
    window.scrollY = 30
    const { result } = renderHook(() => useScrollPosition(50))
    expect(result.current.isScrolled).toBe(false)
  })

  it('returns isScrolled true when scroll position equals threshold', () => {
    window.scrollY = 50
    const { result } = renderHook(() => useScrollPosition(50))
    expect(result.current.isScrolled).toBe(true)
  })

  it('updates isScrolled when scroll event fires', () => {
    window.scrollY = 0
    const { result } = renderHook(() => useScrollPosition(50))
    expect(result.current.isScrolled).toBe(false)

    act(() => {
      window.scrollY = 80
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.isScrolled).toBe(true)
  })

  it('uses default threshold of 44', () => {
    window.scrollY = 44
    const { result } = renderHook(() => useScrollPosition())
    expect(result.current.isScrolled).toBe(true)
  })

  it('returns isScrolled false when scroll goes back below threshold', () => {
    window.scrollY = 80
    const { result } = renderHook(() => useScrollPosition(50))
    expect(result.current.isScrolled).toBe(true)

    act(() => {
      window.scrollY = 20
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.isScrolled).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useScrollPosition.test.ts`
Expected: FAIL — `useScrollPosition` module not found

- [ ] **Step 3: Write `useScrollPosition` implementation**

Create `src/hooks/useScrollPosition.ts`:

```ts
import { useState, useEffect } from 'react'

export function useScrollPosition(threshold = 44) {
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY >= threshold)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY >= threshold)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [threshold])

  return { isScrolled }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useScrollPosition.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useScrollPosition.ts src/hooks/useScrollPosition.test.ts
git commit -m "feat: add useScrollPosition hook for collapsing header"
```

---

### Task 3: Add `resetDismissed` to `useInstallPrompt`

**Files:**
- Modify: `src/hooks/useInstallPrompt.ts`
- Modify: `src/hooks/useInstallPrompt.test.ts`

- [ ] **Step 1: Write the failing test for `resetDismissed`**

Add this test to the end of the existing `describe` block in `src/hooks/useInstallPrompt.test.ts` (after the last `it` block, before the closing `})`):

```ts
  it('resetDismissed clears localStorage flag and sets dismissed to false', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
    const { result } = renderHook(() => useInstallPrompt())
    act(() => {
      result.current.dismiss()
    })
    expect(result.current.dismissed).toBe(true)
    expect(result.current.canInstall).toBe(false)

    act(() => {
      result.current.resetDismissed()
    })
    expect(result.current.dismissed).toBe(false)
    expect(result.current.canInstall).toBe(true)
    expect(localStorage.getItem('pwa_install_dismissed')).toBeNull()
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useInstallPrompt.test.ts`
Expected: FAIL — `resetDismissed` is not a function

- [ ] **Step 3: Add `resetDismissed` to `useInstallPrompt`**

In `src/hooks/useInstallPrompt.ts`, add the `resetDismissed` callback and include it in the return object. The full updated file:

```ts
import { useState, useEffect, useCallback } from 'react'

export function useInstallPrompt() {
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('pwa_install_dismissed') === 'true'
  )
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const canInstall = !isStandalone && !dismissed && (isIOS || !!deferredPrompt)

  const dismiss = useCallback(() => {
    setDismissed(true)
    localStorage.setItem('pwa_install_dismissed', 'true')
  }, [])

  const resetDismissed = useCallback(() => {
    setDismissed(false)
    localStorage.removeItem('pwa_install_dismissed')
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }, [deferredPrompt])

  return { canInstall, isIOS, isStandalone, dismissed, dismiss, resetDismissed, install }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useInstallPrompt.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useInstallPrompt.ts src/hooks/useInstallPrompt.test.ts
git commit -m "feat: add resetDismissed to useInstallPrompt hook"
```

---

### Task 4: TabBar Component

**Files:**
- Create: `src/components/TabBar.tsx`

This component is purely presentational (NavLink-based routing) — no separate test file needed since it's a thin rendering wrapper. Routing behavior is tested via integration.

- [ ] **Step 1: Create `TabBar` component**

Create `src/components/TabBar.tsx`:

```tsx
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: '首頁', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )},
  { to: '/settings', label: '設定', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )},
]

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a1d27] border-t border-[#2e303a]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-5xl mx-auto flex h-14">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 transition-opacity active:opacity-70 ${
                isActive ? 'text-[#818cf8]' : 'text-[#9ca3af]'
              }`
            }
          >
            {tab.icon}
            <span className="text-[10px] leading-none">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/TabBar.tsx
git commit -m "feat: add TabBar component with Home and Settings tabs"
```

---

### Task 5: CollapsingHeader Component

**Files:**
- Create: `src/components/CollapsingHeader.tsx`

- [ ] **Step 1: Create `CollapsingHeader` component**

Create `src/components/CollapsingHeader.tsx`:

```tsx
import { useScrollPosition } from '../hooks/useScrollPosition'

interface CollapsingHeaderProps {
  title: string
}

export default function CollapsingHeader({ title }: CollapsingHeaderProps) {
  const { isScrolled } = useScrollPosition(44)

  return (
    <div
      className="sticky top-0 z-30 bg-[#0f1117] border-b border-[#2e303a] transition-opacity duration-200"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        opacity: isScrolled ? 1 : 0,
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
        <h2 className="text-base font-semibold text-white truncate">{title}</h2>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/CollapsingHeader.tsx
git commit -m "feat: add CollapsingHeader component for compact header on scroll"
```

---

### Task 6: Restructure Layout Component

**Files:**
- Modify: `src/components/Layout.tsx`
- Modify: `src/components/InstallBanner.tsx`

This is the central change. The layout goes from top-nav+footer to safe-area-shell+large-title-area+compact-header+tab-bar.

- [ ] **Step 1: Rewrite `Layout.tsx`**

Replace the entire content of `src/components/Layout.tsx` with:

```tsx
import { Outlet, useLocation } from 'react-router-dom'
import { useScrollPosition } from '../hooks/useScrollPosition'
import TabBar from './TabBar'
import CollapsingHeader from './CollapsingHeader'
import InstallBanner from './InstallBanner'

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'JI Tools', subtitle: '前端工具集' },
  '/fx-deposit-compare': { title: '港美定存比較' },
  '/marathon-savings': { title: '馬拉松存款' },
  '/settings': { title: '設定' },
}

export default function Layout() {
  const location = useLocation()
  const { isScrolled } = useScrollPosition(44)
  const pageInfo = pageTitles[location.pathname] ?? { title: 'JI Tools' }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0f1117] text-[#e2e8f0] flex flex-col">
      <CollapsingHeader title={pageInfo.title} />

      <div className={`transition-opacity duration-200 ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="max-w-5xl mx-auto px-4 pt-2 pb-4">
            <h1 className="text-2xl font-bold text-white">{pageInfo.title}</h1>
            {pageInfo.subtitle && (
              <p className="text-[#9ca3af] text-sm mt-1">{pageInfo.subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 page-enter">
        <Outlet />
      </main>

      <div className="h-14" />
      <InstallBanner />
      <TabBar />
    </div>
  )
}
```

Key design decisions:
- `min-h-[100dvh]` replaces `min-h-screen` for dynamic viewport height on mobile
- The large title area has `paddingTop: env(safe-area-inset-top)` so it clears the Dynamic Island
- The large title fades out and collapses height to 0 when scrolled
- `<div className="h-14" />` spacer prevents content from hiding behind the fixed TabBar
- `<main className="page-enter">` applies the fadeIn animation from CSS
- CollapsingHeader handles the sticky compact header with its own safe-area padding
- Footer is removed entirely

- [ ] **Step 2: Update `InstallBanner.tsx` to remove `safe-area-bottom` class**

In `src/components/InstallBanner.tsx`, on line 9, change:

```tsx
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#1a1d27] border-t border-[#2e303a] safe-area-bottom">
```

to:

```tsx
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#1a1d27] border-t border-[#2e303a]" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
```

This removes the dependency on the deleted `.safe-area-bottom` CSS class and inlines the safe area padding via style attribute.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout.tsx src/components/InstallBanner.tsx
git commit -m "feat: restructure Layout with safe area, collapsing title, and tab bar"
```

---

### Task 7: Settings Page

**Files:**
- Create: `src/pages/Settings.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `Settings` page component**

Create `src/pages/Settings.tsx`:

```tsx
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function Settings() {
  const { dismissed, resetDismissed } = useInstallPrompt()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      <div className="bg-[#1a1d27] border border-[#2e303a] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2e303a]">
          <h2 className="text-sm font-semibold text-white">關於</h2>
        </div>
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#2e303a]">
          <span className="text-sm text-[#9ca3af]">版本</span>
          <span className="text-sm text-white">0.0.0</span>
        </div>
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#2e303a]">
          <span className="text-sm text-[#9ca3af]">主題</span>
          <span className="text-sm text-white">深色（跟隨系統）</span>
        </div>
        <a
          href="https://github.com/jimmyiu/ji-tools"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-6 py-4 border-b border-[#2e303a] hover:bg-[#1e2233] transition-colors active:opacity-90"
        >
          <span className="text-sm text-[#9ca3af]">GitHub</span>
          <svg className="w-4 h-4 text-[#9ca3af]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
        {dismissed && (
          <button
            onClick={resetDismissed}
            className="w-full px-6 py-4 text-left text-sm text-[#818cf8] hover:bg-[#1e2233] transition-colors active:opacity-90"
          >
            重新顯示安裝提示
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add `/settings` route to `App.tsx`**

Replace the entire content of `src/App.tsx` with:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import FxDepositCompare from './pages/FxDepositCompare'
import MarathonSavings from './pages/MarathonSavings'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter basename="/ji-tools/">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/fx-deposit-compare" element={<FxDepositCompare />} />
          <Route path="/marathon-savings" element={<MarathonSavings />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/pages/Settings.tsx src/App.tsx
git commit -m "feat: add Settings page with app info, GitHub link, and install prompt reset"
```

---

### Task 8: Update Home Page — Remove Redundant Title, Add Press Feedback

**Files:**
- Modify: `src/pages/Home.tsx`

The Home page currently renders its own `<h1>JI Tools</h1>` and `<p>前端工具集</p>`. The Layout now renders the large title, so we remove these from Home. We also add active-state press feedback on the tool cards.

- [ ] **Step 1: Update `Home.tsx`**

Replace the entire content of `src/pages/Home.tsx` with:

```tsx
import { Link } from 'react-router-dom'

const tools = [
  {
    path: '/fx-deposit-compare',
    title: '港美定存比較',
    description: '比較港元定存與美元定存的實際淨回報，計算匯率差價影響及追平所需時間。',
    emoji: '💰',
  },
  {
    path: '/marathon-savings',
    title: '馬拉松存款計算機',
    description: '揭露階梯式利率活期存款的實際等效年利率，助你精明選擇存款產品。',
    emoji: '🏦',
  },
]

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="group block p-6 rounded-xl border border-[#2e303a] bg-[#1a1d27] hover:border-[#6366f1] hover:bg-[#1e2233] transition-all duration-200 active:scale-[0.97] active:transition-transform"
          >
            <div className="text-3xl mb-3">{tool.emoji}</div>
            <h2 className="text-base font-semibold text-white mb-2 group-hover:text-[#818cf8] transition-colors">
              {tool.title}
            </h2>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

Changes from original:
- Removed the `<h1>JI Tools</h1>` and `<p>前端工具集</p>` — now handled by Layout's collapsing title
- Changed `py-12` to `py-8` since the title area is now in Layout
- Added `active:scale-[0.97] active:transition-transform` to cards for press feedback
- Added `page-enter` class for fade-in animation

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: remove redundant title from Home, add press feedback on cards"
```

---

### Task 9: Update FxDepositCompare and MarathonSavings — Remove Redundant h1, Add Page Animation

**Files:**
- Modify: `src/pages/FxDepositCompare.tsx`
- Modify: `src/pages/MarathonSavings.tsx`

Both pages have their own `<h1>` title that is now redundant with the Layout's collapsing large title. We remove the h1, keep the description paragraph, and add the `page-enter` animation class.

- [ ] **Step 1: Update `FxDepositCompare.tsx`**

In `src/pages/FxDepositCompare.tsx`, find the heading block on lines 80-83:

```tsx
      <h1 className="text-2xl font-bold text-white mb-1">港美定存比較</h1>
      <p className="text-sm text-[#9ca3af] mb-8">
        比較港元定存與美元定存的實際淨回報，計算匯率差價影響及追平所需時間。
      </p>
```

Replace with just the description:

```tsx
      <p className="text-sm text-[#9ca3af] mb-8">
        比較港元定存與美元定存的實際淨回報，計算匯率差價影響及追平所需時間。
      </p>
```

Also, add the `page-enter` class. On line 79, change:

```tsx
    <div className="max-w-5xl mx-auto px-4 py-8">
```

to:

```tsx
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
```

- [ ] **Step 2: Update `MarathonSavings.tsx`**

In `src/pages/MarathonSavings.tsx`, find the heading block on lines 99-102:

```tsx
      <h1 className="text-2xl font-bold text-white mb-1">馬拉松儲蓄存款計算機</h1>
      <p className="text-sm text-[#9ca3af] mb-8">
        揭示階梯式利率活期存款的「實際等效年利率」，擺脫銀行最高息宣傳迷思。
      </p>
```

Replace with just the description:

```tsx
      <p className="text-sm text-[#9ca3af] mb-8">
        揭示階梯式利率活期存款的「實際等效年利率」，擺脫銀行最高息宣傳迷思。
      </p>
```

Also, add the `page-enter` class. On line 98, change:

```tsx
    <div className="max-w-5xl mx-auto px-4 py-8">
```

to:

```tsx
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/pages/FxDepositCompare.tsx src/pages/MarathonSavings.tsx
git commit -m "feat: remove redundant h1 from tool pages, add page-enter animation"
```

---

### Task 10: Full Build & Test Verification

**Files:**
- No new files

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (including existing `useCalculator.test.ts` and `useInstallPrompt.test.ts`)

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Run full build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Visual smoke test — start dev server**

Run: `npm run dev`

Expected behavior when viewed in browser:
- Home page shows large "JI Tools" title with "前端工具集" subtitle
- Scrolling causes the large title to fade and a compact header with the page name to appear
- Bottom tab bar shows "首頁" and "設定" tabs
- Clicking "首頁" navigates to home, "設定" navigates to settings
- Settings page shows version, theme, GitHub link, and install prompt reset button (if previously dismissed)
- No Dynamic Island overlap when viewed on iOS PWA (safe area padding visible)
- Footer text "JI Tools" is gone
- No blue/gray tap highlight on interactive elements
- Cards have a subtle press animation when tapped