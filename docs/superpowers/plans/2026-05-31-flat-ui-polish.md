# Flat UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the flat edge-to-edge layout with stronger typographic hierarchy, macro-whitespace section separation, and a warmer background tint.

**Architecture:** CSS-only changes (background color tokens in `index.css`), component-level class tweaks (`SectionHeader`), and page-level spacing adjustments (`space-y-8`, `border-b` removal, `<h2>` → `<SectionHeader>`). No JS logic changes, no new components.

**Tech Stack:** React 19, TypeScript 6, Tailwind CSS 4, shadcn/ui, Vitest.

---

### Task 1: SectionHeader — Typography, Accent Bar, and Spacing

**Files:**
- Modify: `src/components/SectionHeader.tsx:14`
- Modify: `src/components/SectionHeader.test.tsx:15,42`
- Test: `pnpm test -- src/components/SectionHeader.test.tsx`

- [ ] **Step 1: Update SectionHeader.tsx classes**

Change the accent bar from `h-4` to `h-5`, the title from `text-sm font-semibold` to `text-lg font-bold`, and the bottom margin from `mb-3` to `mb-2`:

```diff
- <div data-testid="accent-bar" className="w-[3px] h-4 bg-muted-foreground/20 rounded-sm" />
+ <div data-testid="accent-bar" className="w-[3px] h-5 bg-muted-foreground/20 rounded-sm" />
```

```diff
- <h2 className="text-sm font-semibold text-foreground">
+ <h2 className="text-lg font-bold text-foreground">
```

```diff
- <div className="flex items-center justify-between gap-2.5 mb-3">
+ <div className="flex items-center justify-between gap-2.5 mb-2">
```

- [ ] **Step 2: Update SectionHeader.test.tsx assertions**

Update accent bar assertion (line 15):
```diff
- expect(accentBar).toHaveClass('h-4', 'bg-muted-foreground/20', 'rounded-sm')
+ expect(accentBar).toHaveClass('h-5', 'bg-muted-foreground/20', 'rounded-sm')
```

Update bottom spacing assertion (line 42):
```diff
- expect(root).toHaveClass('mb-3')
+ expect(root).toHaveClass('mb-2')
```

- [ ] **Step 3: Run tests to verify**

```bash
pnpm test -- src/components/SectionHeader.test.tsx
```
Expected: 7 passed

- [ ] **Step 4: Commit**

```bash
git add src/components/SectionHeader.tsx src/components/SectionHeader.test.tsx
git commit -m "feat: elevate SectionHeader typography - text-lg font-bold, h-5 accent bar, mb-2"
```

---

### Task 2: Background Color — Update CSS Custom Properties

**Files:**
- Modify: `src/index.css:88-111`

- [ ] **Step 1: Update all surface tokens in the `.dark` block**

Change `--background` from near-black to warm dark grey. Lift all secondary surfaces proportionally to preserve hierarchy:

```diff
 .dark {
-  --background: oklch(0.13 0.028 265);
+  --background: oklch(0.17 0.015 260);
-  --foreground: oklch(0.88 0.01 260);
+  --foreground: oklch(0.90 0.008 260);
-  --card: oklch(0.17 0.028 265);
+  --card: oklch(0.21 0.015 260);
-  --card-foreground: oklch(0.88 0.01 260);
+  --card-foreground: oklch(0.90 0.008 260);
-  --popover: oklch(0.17 0.024 265);
+  --popover: oklch(0.21 0.015 260);
-  --popover-foreground: oklch(0.88 0.01 260);
+  --popover-foreground: oklch(0.90 0.008 260);
-  --secondary: oklch(0.20 0.028 265);
+  --secondary: oklch(0.24 0.015 260);
-  --secondary-foreground: oklch(0.88 0.01 260);
+  --secondary-foreground: oklch(0.90 0.008 260);
-  --muted: oklch(0.16 0.028 265);
+  --muted: oklch(0.20 0.015 260);
-  --muted-foreground: oklch(0.58 0.03 265);
+  --muted-foreground: oklch(0.62 0.025 260);
-  --accent: oklch(0.20 0.028 265);
+  --accent: oklch(0.24 0.015 260);
-  --accent-foreground: oklch(0.88 0.01 260);
+  --accent-foreground: oklch(0.90 0.008 260);
-  --input: oklch(0.19 0.028 265);
+  --input: oklch(0.23 0.015 260);
```

Only update the `.dark` block — the `@theme inline` block below it references these tokens via `var()`. No changes needed there.

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat: lighten background to warm dark grey oklch(0.17 0.015 260)"
```

---

### Task 3: MarathonSavings — Macro-Whitespace and Border Removal

**Files:**
- Modify: `src/pages/MarathonSavings.tsx:30-31`
- Modify: `src/components/CurrencyToggle.tsx:14`
- Modify: `src/components/EditableSection.tsx:62`
- Modify: `src/components/BasicParameters.tsx:19`
- Modify: `src/components/ResultsPanel.tsx:22`

- [ ] **Step 1: Add `space-y-8` to column wrappers in MarathonSavings.tsx**

```diff
- <div>
+ <div className="space-y-8">
```

```diff
- <div>
+ <div className="space-y-8">
```

- [ ] **Step 2: Remove `border-b border-border` from CurrencyToggle.tsx outer div**

```diff
- <div className="grid grid-cols-2 gap-3 px-4 py-3 border-b border-border">
+ <div className="grid grid-cols-2 gap-3 px-4 py-3">
```

- [ ] **Step 3: Remove `border-b border-border` from EditableSection.tsx wrapper div**

```diff
- <div className="px-4 py-3 border-b border-border">
+ <div className="px-4 py-3">
```

- [ ] **Step 4: Remove `border-b border-border` from BasicParameters.tsx wrapper div**

```diff
- <div className="px-4 py-3 border-b border-border">
+ <div className="px-4 py-3">
```

- [ ] **Step 5: Remove `border-b border-border` from ResultsPanel.tsx wrapper div**

```diff
- <div className="px-4 py-3 border-b border-border">
+ <div className="px-4 py-3">
```

- [ ] **Step 6: Run tests to verify**

```bash
pnpm test -- src/components/CurrencyToggle.test.tsx src/components/EditableSection.test.tsx src/components/BasicParameters.test.tsx src/components/ResultsPanel.test.tsx
```
Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add src/pages/MarathonSavings.tsx src/components/CurrencyToggle.tsx src/components/EditableSection.tsx src/components/BasicParameters.tsx src/components/ResultsPanel.tsx
git commit -m "feat: add space-y-8 macro-whitespace and remove border-b on MarathonSavings"
```

---

### Task 4: FxDepositCompare — Replace Inline h2 with SectionHeader

**Files:**
- Modify: `src/pages/FxDepositCompare.tsx:1,79-80,157-158`

- [ ] **Step 1: Import `SectionHeader`**

```diff
 import { InputField } from '../components/InputField'
+import { SectionHeader } from '../components/SectionHeader'
 import { DateField } from '../components/DateField'
```

- [ ] **Step 2: Replace "輸入參數" `<h2>` with `<SectionHeader>`**

```diff
- <h2 className="text-sm font-semibold text-foreground mb-3">輸入參數</h2>
+ <SectionHeader title="輸入參數" />
```

- [ ] **Step 3: Replace "計算結果" `<h2>` with `<SectionHeader>`**

```diff
- <h2 className="text-sm font-semibold text-foreground mb-3">計算結果</h2>
+ <SectionHeader title="計算結果" />
```

- [ ] **Step 4: Run build and tests**

```bash
pnpm test -- src/pages/
```
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add src/pages/FxDepositCompare.tsx
git commit -m "feat: replace inline h2 with SectionHeader on FxDepositCompare"
```

---

### Task 5: Settings — Replace Inline h2 with SectionHeader, Remove Container border-b

**Files:**
- Modify: `src/pages/Settings.tsx:1,11-12`

- [ ] **Step 1: Import `SectionHeader`**

```diff
 import { ExternalLink } from 'lucide-react'
+import { SectionHeader } from '../components/SectionHeader'
 import { useInstallPrompt } from '../hooks/useInstallPrompt'
```

- [ ] **Step 2: Replace "關於" `<h2>` with `<SectionHeader>` and remove `border-b` from the wrapper div**

```diff
- <div className="px-4 py-3 border-b border-border">
-   <h2 className="text-sm font-semibold text-foreground">關於</h2>
+ <div className="px-4 py-3">
+   <SectionHeader title="關於" />
  </div>
```

- [ ] **Step 3: Run tests to verify**

```bash
pnpm test -- src/pages/Settings.test.tsx
```
Expected: all pass

- [ ] **Step 4: Commit**

```bash
git add src/pages/Settings.tsx
git commit -m "feat: replace inline h2 with SectionHeader on Settings page"
```

---

### Task 6: AGENTS.md — Flat UI Spacing Guideline

- [ ] **Step 1: Add guideline to AGENTS.md**

Insert under the Conventions section (after the form inputs convention, before Retrospective learning):

```markdown
- **Flat UI spacing rule:** Major sections on inner pages are separated by `mt-8` (32px) of pure whitespace — no horizontal divider lines. Section headers use `text-lg font-bold` with a `h-5` accent bar and `mb-2` below. This is the project's approach to section hierarchy in the edge-to-edge layout. App background is `oklch(0.17 0.015 260)` (warm dark grey), not pure black.
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: add Flat UI spacing guideline to AGENTS.md"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
```
Expected: all pass

- [ ] **Step 2: Run linter**

```bash
pnpm run lint
```
Expected: no errors

- [ ] **Step 3: Run build**

```bash
pnpm build
```
Expected: build succeeds
