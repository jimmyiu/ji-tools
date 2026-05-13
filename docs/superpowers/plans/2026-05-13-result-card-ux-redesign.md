# Result Card UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the result card in FxDepositCompare to fix mobile wrapping, highlight interest earned, and consolidate meta-info.

**Architecture:** Pure UI change in a single component file. Add two derived values (hkdInterest, usdInterestInHkd) computed in-component from existing hook results. Restructure the result card JSX to extract meta-info into a subtitle, replace total rows with interest rows + secondary total info, and apply Tailwind wrapping fixes.

**Tech Stack:** React, Tailwind CSS v4, TypeScript

---

### Task 1: Add derived interest values

**Files:**
- Modify: `src/pages/FxDepositCompare.tsx:76` (after the `useCalculator` call)

- [ ] **Step 1: Add interest derivation expressions**

In `FxDepositCompare`, add two computed values right after the `useCalculator` call:

```tsx
export default function FxDepositCompare() {
  const inputs = useInputs()
  const result = useCalculator(inputs)
  const hkdInterest = result.hkdTotal - inputs.initialPrincipal
  const usdInterestInHkd = result.usdTotalInHkd - inputs.initialPrincipal

  return (
```

- [ ] **Step 2: Run existing tests to verify no regression**

Run: `pnpm test`

Expected: All 49 tests pass (this change is computation-only, used later by JSX).

- [ ] **Step 3: Commit**

```bash
git add src/pages/FxDepositCompare.tsx
git commit -m "feat: add derived interest values to FxDepositCompare"
```

---

### Task 2: Restructure result card — meta-info subtitle + interest rows + wrapping fix

**Files:**
- Modify: `src/pages/FxDepositCompare.tsx:152-169` (the result card `<div>`)

- [ ] **Step 1: Replace the result card section**

Replace the entire result card block (lines 152–169) with the restructured version. The heading gets a subtitle, the two total rows become interest-focused rows with secondary total info, and the difference row stays as-is. Wrapping is fixed with `items-start`, `whitespace-nowrap`, and `flex-1 min-w-0`.

Old code (lines 152–169):

```tsx
          <div className="bg-[#1a1d27] border border-[#2e303a] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">計算結果</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[#2e303a]">
                <span className="text-sm text-[#9ca3af]">港元定存到期本息 <span className="text-[#6b7280]">({inputs.iterate} 次滾存 · 共 {result.totalDays} 日)</span></span>
                <span className="text-base font-semibold text-white">HK$ {fmt(result.hkdTotal)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[#2e303a]">
                <span className="text-sm text-[#9ca3af]">美元定存到期本息 (換回HKD) <span className="text-[#6b7280]">({inputs.iterate} 次滾存 · 共 {result.totalDays} 日)</span></span>
                <span className="text-base font-semibold text-white">HK$ {fmt(result.usdTotalInHkd)}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-[#9ca3af]">兩者淨差額</span>
                <span className={`text-base font-semibold ${result.usdWins ? 'text-green-400' : 'text-red-400'}`}>
                  {result.difference >= 0 ? '+' : ''}HK$ {fmt(result.difference)}
                </span>
              </div>
            </div>
          </div>
```

New code:

```tsx
          <div className="bg-[#1a1d27] border border-[#2e303a] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-1">計算結果</h2>
            <p className="text-xs text-[#9ca3af] mb-5">
              {inputs.iterate} 次滾存 · 共 {result.totalDays} 日
            </p>
            <div className="space-y-4">
              <div className="flex items-start justify-between py-3 border-b border-[#2e303a]">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[#9ca3af]">港元實賺利息</span>
                  <span className="block text-xs text-[#6b7280]">
                    連本金總額: HK$ {fmt(result.hkdTotal)}
                  </span>
                </div>
                <span className="text-base font-semibold text-white whitespace-nowrap ml-2">
                  HK$ {fmt(hkdInterest)}
                </span>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-[#2e303a]">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[#9ca3af]">美元實賺利息 (換回HKD)</span>
                  <span className="block text-xs text-[#6b7280]">
                    連本金總額: HK$ {fmt(result.usdTotalInHkd)}
                  </span>
                </div>
                <span className="text-base font-semibold text-white whitespace-nowrap ml-2">
                  HK$ {fmt(usdInterestInHkd)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-[#9ca3af]">兩者淨差額</span>
                <span className={`text-base font-semibold whitespace-nowrap ml-2 ${result.usdWins ? 'text-green-400' : 'text-red-400'}`}>
                  {result.difference >= 0 ? '+' : ''}HK$ {fmt(result.difference)}
                </span>
              </div>
            </div>
          </div>
```

Note: The "兩者淨差額" row also gets `whitespace-nowrap ml-2` for consistency, and changes from `items-center` to `items-center` (kept as-is since it's a single-line label).

- [ ] **Step 2: Run tests to verify no regression**

Run: `pnpm test`

Expected: All 49 tests pass (tests only cover `useCalculator` logic, not component rendering).

- [ ] **Step 3: Run lint to verify no issues**

Run: `pnpm lint`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/FxDepositCompare.tsx
git commit -m "feat: redesign result card — interest-focused rows, meta subtitle, wrap fix"
```

---

### Task 3: Visual verification and final check

**Files:** None (verification only)

- [ ] **Step 1: Build the project**

Run: `pnpm build`

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 2: Run full test suite one more time**

Run: `pnpm test`

Expected: All 49 tests pass.

- [ ] **Step 3: Verify the change visually (manual)**

Run: `pnpm dev` and open the FxDepositCompare page. Confirm:

1. "計算結果" heading has a subtitle below: "{N} 次滾存 · 共 {N} 日"
2. Row 1 label reads "港元實賺利息" with secondary "連本金總額: HK$ ..." below it
3. Row 2 label reads "美元實賺利息 (換回HKD)" with secondary "連本金總額: HK$ ..." below it
4. Row 1 value shows interest amount (not total)
5. Row 2 value shows interest amount (not total)
6. "HK$" never wraps away from the number on narrow viewports
7. "兩者淨差額" row is unchanged in behavior
8. Verdict card below is unchanged