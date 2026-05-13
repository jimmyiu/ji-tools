# Collapsing Header Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-element collapsing header swap (which causes a jump effect) with a single sticky header that smoothly transitions between large and compact states.

**Architecture:** A single sticky `<header>` element in Layout replaces both CollapsingHeader and the separate collapsing title block. It renders in "large" mode (big title + subtitle) when not scrolled, and "compact" mode (h-11 bar with title only) when scrolled past 44px. A static spacer div below the header prevents content from jumping up behind it. The CollapsingHeader component is deleted.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest + React Testing Library

---

### Task 1: Write failing test for the new unified header behavior

**Files:**
- Create: `src/components/Layout.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Layout from './Layout'

describe('Layout header', () => {
  let originalScrollY: number

  beforeEach(() => {
    originalScrollY = window.scrollY
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.scrollY = originalScrollY
  })

  it('renders the page title in large mode when not scrolled', () => {
    window.scrollY = 0
    render(
      <Layout />
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('JI Tools')
  })

  it('renders the title in a compact header when scrolled past threshold', () => {
    window.scrollY = 50
    render(
      <Layout />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('JI Tools')
  })

  it('does not render a h1 when scrolled past threshold', () => {
    window.scrollY = 50
    render(
      <Layout />
    )
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/Layout.test.tsx`
Expected: FAIL — either the component doesn't render as expected, or the test setup needs routing context.

---

### Task 2: Rewrite Layout with single sticky header

**Files:**
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Rewrite Layout.tsx with a single sticky header**

Replace the entire content of `src/components/Layout.tsx` with:

```tsx
import { Outlet, useLocation } from 'react-router-dom'
import { useScrollPosition } from '../hooks/useScrollPosition'
import TabBar from './TabBar'
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
            <div className="max-w-5xl mx-auto px-4 pt-2 pb-4">
              <h1 className="text-2xl font-bold text-white">{pageInfo.title}</h1>
              {pageInfo.subtitle && (
                <p className="text-[#9ca3af] text-sm mt-1">{pageInfo.subtitle}</p>
              )}
            </div>
          </div>
        )}
      </header>

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

Key changes:
- Single `<header>` element replaces both CollapsingHeader and the collapsing title div
- Removes CollapsingHeader import
- When `isScrolled` is true: compact mode — 44pt (`h-11`) bar with `<h2>`, bottom border
- When `isScrolled` is false: large mode — full title with `<h1>` and optional subtitle
- No `max-h-0`/`opacity-0` swap that causes layout shift
- Safe area padding applied in both states

---

### Task 3: Delete CollapsingHeader component

**Files:**
- Delete: `src/components/CollapsingHeader.tsx`

- [ ] **Step 1: Delete the file**

```bash
rm src/components/CollapsingHeader.tsx
```

- [ ] **Step 2: Verify no remaining imports of CollapsingHeader**

Run: `rg "CollapsingHeader" src/`
Expected: No matches found

---

### Task 4: Update Layout test for routing context

**Files:**
- Modify: `src/components/Layout.test.tsx`

- [ ] **Step 1: Update the test to wrap Layout in BrowserRouter**

The test from Task 1 needs a router wrapper since Layout uses `useLocation`. Replace the test file content:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from './Layout'

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Layout header', () => {
  let originalScrollY: number

  beforeEach(() => {
    originalScrollY = window.scrollY
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.scrollY = originalScrollY
  })

  it('renders the page title in large mode when not scrolled', () => {
    window.scrollY = 0
    renderWithRouter(<Layout />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('JI Tools')
  })

  it('renders a compact heading when scrolled past threshold', () => {
    window.scrollY = 50
    renderWithRouter(<Layout />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('JI Tools')
  })

  it('does not render h1 when scrolled past threshold', () => {
    window.scrollY = 50
    renderWithRouter(<Layout />)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('does not render h2 when not scrolled', () => {
    window.scrollY = 0
    renderWithRouter(<Layout />)
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run Layout tests**

Run: `pnpm test -- src/components/Layout.test.tsx`
Expected: PASS

---

### Task 5: Run full test suite and verify build

- [ ] **Step 1: Run all tests**

Run: `pnpm test`
Expected: All tests pass (49 existing + new Layout tests)

- [ ] **Step 2: Run TypeScript check**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run linter**

Run: `pnpm exec eslint src/`
Expected: No errors

- [ ] **Step 4: Commit all changes**

```bash
git add -A
git commit -m "feat: replace collapsing header swap with single sticky header

- Replace two-element swap (CollapsingHeader + collapsing title) with single sticky header
- Large title mode when not scrolled, compact 44pt bar when scrolled past 44px
- Removes jump effect caused by layout shift during scroll transition
- Delete CollapsingHeader component
- Add Layout tests for header state transitions"
```