# TabBar Simplification Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Simplify TabBar from 4 to 2 items (Home, Settings).

**Architecture:** Remove 2 tab entries from the static `tabs` array in `TabBar.tsx` and update active-tab matching for the remaining 2 routes.

**Tech Stack:** React 19, TypeScript 6, Tailwind CSS 4, lucide-react, react-router-dom

---

## Task 1: Remove calculator tabs from TabBar

**Files:**
- Modify: `src/components/TabBar.tsx`

- [ ] **Step 1: Remove Calculator and TrendingUp imports**

Remove `Calculator` and `TrendingUp` from the `lucide-react` import line. Remove `TrendingUp` entirely since it's unused after this change.

```tsx
import { Home, Settings } from 'lucide-react'
```

- [ ] **Step 2: Remove calculator entries from the tabs array**

Remove the `/fx-deposit-compare` and `/marathon-savings` entries, leaving only Home and Settings:

```tsx
const tabs = [
  { to: '/', label: '首頁', icon: Home },
  { to: '/settings', label: '設定', icon: Settings },
]
```

- [ ] **Step 3: Simplify active tab matching**

Remove the prefix-matching logic (`.startsWith(t.to + '/')`) since the remaining tabs are simple leaf routes:

```tsx
const currentTab = tabs.find((t) => location.pathname === t.to)?.to ?? '/'
```

- [ ] **Step 4: Run build to verify**

Run: `pnpm build`
Expected: No TypeScript or build errors.

- [ ] **Step 5: Run tests**

Run: `pnpm test`
Expected: All existing tests pass.

## Task 2: Final verification

**Files:** None

- [ ] **Step 1: Run full build**

Run: `pnpm build`
Expected: Clean exit, no errors.

- [ ] **Step 2: Run full test suite**

Run: `pnpm test`
Expected: All existing tests pass.
