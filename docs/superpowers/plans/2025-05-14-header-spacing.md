# Header Spacing Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the excessive vertical gap between the page title and the first content element by halving the combined padding from ~48px to ~24px.

**Architecture:** Two targeted Tailwind class changes — reduce the header bottom padding and the page-level vertical padding. No logic changes, no new files, no structural refactoring.

**Tech Stack:** React, Tailwind CSS, Vitest, React Testing Library

---

### Task 1: Reduce header bottom padding

**Files:**
- Modify: `src/components/Layout.tsx:33`

This is the not-scrolled header state's bottom padding. Changing `pb-4` (16px) to `pb-2` (8px).

- [ ] **Step 1: Update the header padding class**

In `src/components/Layout.tsx`, line 33, change:

```
<div className="max-w-5xl mx-auto px-4 pt-2 pb-4">
```

to:

```
<div className="max-w-5xl mx-auto px-4 pt-2 pb-2">
```

- [ ] **Step 2: Run existing Layout tests**

Run: `npx vitest run src/components/Layout.test.tsx`
Expected: All 4 tests pass (no logic changed, just spacing)

- [ ] **Step 3: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "fix: reduce header bottom padding from pb-4 to pb-2"
```

---

### Task 2: Reduce page top padding (all 4 pages)

**Files:**
- Modify: `src/pages/Home.tsx:20`
- Modify: `src/pages/FxDepositCompare.tsx:78`
- Modify: `src/pages/MarathonSavings.tsx:95`
- Modify: `src/pages/Settings.tsx:7`

Changing `py-8` (32px top + 32px bottom) to `py-4` (16px top + 16px bottom) on each page's outer container.

- [ ] **Step 1: Update Home.tsx**

In `src/pages/Home.tsx`, line 20, change:

```tsx
<div className="max-w-5xl mx-auto px-4 py-8 page-enter">
```

to:

```tsx
<div className="max-w-5xl mx-auto px-4 py-4 page-enter">
```

- [ ] **Step 2: Update FxDepositCompare.tsx**

In `src/pages/FxDepositCompare.tsx`, line 78, change:

```tsx
<div className="max-w-5xl mx-auto px-4 py-8 page-enter">
```

to:

```tsx
<div className="max-w-5xl mx-auto px-4 py-4 page-enter">
```

- [ ] **Step 3: Update MarathonSavings.tsx**

In `src/pages/MarathonSavings.tsx`, line 95, change:

```tsx
<div className="max-w-5xl mx-auto px-4 py-8 page-enter">
```

to:

```tsx
<div className="max-w-5xl mx-auto px-4 py-4 page-enter">
```

- [ ] **Step 4: Update Settings.tsx**

In `src/pages/Settings.tsx`, line 7, change:

```tsx
<div className="max-w-5xl mx-auto px-4 py-8 page-enter">
```

to:

```tsx
<div className="max-w-5xl mx-auto px-4 py-4 page-enter">
```

- [ ] **Step 5: Run full test suite**

Run: `npx vitest run`
Expected: All existing tests pass

- [ ] **Step 6: Commit**

```bash
git add src/pages/Home.tsx src/pages/FxDepositCompare.tsx src/pages/MarathonSavings.tsx src/pages/Settings.tsx
git commit -m "fix: reduce page vertical padding from py-8 to py-4"
```