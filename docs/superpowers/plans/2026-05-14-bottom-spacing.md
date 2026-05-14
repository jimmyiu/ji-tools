# Bottom Spacing Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce excessive bottom gap and standardize card spacing to 16px across all pages.

**Architecture:** Remove the redundant `h-14` spacer div from Layout, replace `pb-28` with `pb-[72px]` (56px TabBar + 16px breathing room), and change `gap-6` to `gap-4` on two tool pages.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, Testing Library

---

### Task 1: Update Layout — remove spacer div and fix bottom padding

This is a structural change (removing a DOM element) so we write a test first.

**Files:**
- Modify: `src/components/Layout.test.tsx`
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Write a failing test that the spacer div is removed**

Add a new test block to `src/components/Layout.test.tsx` after the existing `describe('Layout header', ...)` block:

```tsx
describe('Layout bottom spacing', () => {
  it('does not render an h-14 spacer div', () => {
    renderWithRouter(<Layout />)
    expect(container.querySelector('div.h-14')).not.toBeInTheDocument()
  })

  it('renders main with correct bottom padding', () => {
    renderWithRouter(<Layout />)
    const main = container.querySelector('main')
    expect(main).toHaveClass('pb-[72px]')
  })
})
```

You will also need to destructure `container` from `renderWithRouter`. Change the helper at the top of the file from:

```tsx
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}
```

to:

```tsx
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

let container: HTMLElement
```

And add `container =` before the `renderWithRouter` call in each `it` block inside the new describe. Alternatively, update `renderWithRouter` to make `container` available — the simplest approach is to add this line at the top of each new test:

```tsx
const { container: testContainer } = renderWithRouter(<Layout />)
```

So here is the full new describe block to append after the existing one:

```tsx
describe('Layout bottom spacing', () => {
  it('does not render an h-14 spacer div', () => {
    const { container: c } = renderWithRouter(<Layout />)
    expect(c.querySelector('div.h-14')).not.toBeInTheDocument()
  })

  it('renders main with correct bottom padding', () => {
    const { container: c } = renderWithRouter(<Layout />)
    const main = c.querySelector('main')
    expect(main).toHaveClass('pb-[72px]')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/Layout.test.tsx`
Expected: Both new tests FAIL — `div.h-14` currently exists, and `main` has `pb-28` not `pb-[72px]`.

- [ ] **Step 3: Update Layout.tsx**

In `src/components/Layout.tsx`, make two changes:

1. Change line 43 from:
```tsx
      <main className="flex-1 page-enter pb-28">
```
to:
```tsx
      <main className="flex-1 page-enter pb-[72px]">
```

2. Remove line 47 (`      <div className="h-14" />`) entirely.

The full Layout return block should now look like:

```tsx
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

      <main className="flex-1 page-enter pb-[72px]">
        <Outlet />
      </main>

      <InstallBanner />
      <TabBar />
    </div>
  )
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/Layout.test.tsx`
Expected: All tests PASS, including the two new ones.

- [ ] **Step 5: Commit**

```bash
git add src/components/Layout.tsx src/components/Layout.test.tsx
git commit -m "fix: reduce bottom gap from 168px to 72px and remove redundant spacer div"
```

---

### Task 2: Standardize card gaps on FxDepositCompare page

Change `gap-6` to `gap-4` for consistent 16px spacing.

**Files:**
- Modify: `src/pages/FxDepositCompare.tsx`

- [ ] **Step 1: Update the main grid gap**

In `src/pages/FxDepositCompare.tsx`, line 83, change:

```tsx
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

to:

```tsx
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
```

- [ ] **Step 2: Update the right column card gap**

On line 150, change:

```tsx
        <div className="flex flex-col gap-6">
```

to:

```tsx
        <div className="flex flex-col gap-4">
```

- [ ] **Step 3: Run dev server and visually verify**

Run: `npx vite dev`
Expected: The Fx Deposit Compare page shows 16px gaps between cards, matching the Home page.

- [ ] **Step 4: Commit**

```bash
git add src/pages/FxDepositCompare.tsx
git commit -m "fix: standardize card gaps to 16px on fx-deposit-compare page"
```

---

### Task 3: Standardize card gaps on MarathonSavings page

Change `gap-6` to `gap-4` for consistent 16px spacing.

**Files:**
- Modify: `src/pages/MarathonSavings.tsx`

- [ ] **Step 1: Update the main grid gap**

In `src/pages/MarathonSavings.tsx`, line 100, change:

```tsx
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

to:

```tsx
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
```

- [ ] **Step 2: Run dev server and visually verify**

Run: `npx vite dev`
Expected: The Marathon Savings page shows 16px gaps between cards, matching the Home page.

- [ ] **Step 3: Commit**

```bash
git add src/pages/MarathonSavings.tsx
git commit -m "fix: standardize card gaps to 16px on marathon-savings page"
```