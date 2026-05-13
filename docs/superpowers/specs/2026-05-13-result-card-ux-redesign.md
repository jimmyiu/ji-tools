# Result Card UX Redesign

## Problem

The current result card in `FxDepositCompare.tsx` has text wrapping issues on mobile:
- Label text is too verbose (includes meta-info inline), causing the currency symbol "HK$" to break away from the amount on narrow screens
- The key values shown are principal+interest totals, but users care most about **interest earned**
- Meta-info (`{iterate} 次滾存 · 共 {totalDays} 日`) is duplicated in both rows

## Approach

Extract meta-info to a subtitle, refocus rows on interest earned, add secondary total info, and fix wrapping with Tailwind utilities.

## Design

### 1. Meta-info extraction

Remove `(1 次滾存 · 共 92 日)` from individual row labels. Add it once as a subtitle directly below the "計算結果" heading:

```tsx
<h2 className="text-sm font-semibold text-white mb-1">計算結果</h2>
<p className="text-xs text-[#9ca3af] mb-5">
  {inputs.iterate} 次滾存 · 共 {result.totalDays} 日
</p>
```

### 2. Interest-focused rows

Replace the two principal+interest rows with interest-earned rows:

| Row | Label | Value |
|-----|-------|-------|
| 1 | 港元實賺利息 | HK$ {hkdInterest} |
| 2 | 美元實賺利息 (換回HKD) | HK$ {usdInterestInHkd} |

Interest values derived in-component (no hook changes):

```tsx
const hkdInterest = result.hkdTotal - inputs.initialPrincipal
const usdInterestInHkd = result.usdTotalInHkd - inputs.initialPrincipal
```

The "兩者淨差額" row remains unchanged.

### 3. Secondary info

Below each interest label, show the total principal+interest as muted secondary text:

```tsx
<div className="flex-1 min-w-0">
  <span className="text-sm text-[#9ca3af]">港元實賺利息</span>
  <span className="block text-xs text-[#6b7280]">
    連本金總額: HK$ {fmt(result.hkdTotal)}
  </span>
</div>
```

### 4. Wrapping fix

Apply Tailwind utilities to prevent "HK$" from breaking away from amounts:

- Outer flex row: `flex items-start justify-between` — aligns value with top of label
- Left label block: `flex-1 min-w-0` — takes remaining space, wraps naturally
- Right value: `whitespace-nowrap` — keeps currency symbol and number together

```tsx
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
```

## Scope

- `src/pages/FxDepositCompare.tsx` — result card section only (lines 152-169)
- No changes to `useCalculator.ts` or data logic
- No changes to the verdict card below

## Success criteria

- On mobile widths (375px+), "HK$" never wraps away from the number
- Labels wrap naturally without overflow
- Meta-info appears once, not twice
- Interest values are the primary focus
- Total principal+interest is visible as secondary info