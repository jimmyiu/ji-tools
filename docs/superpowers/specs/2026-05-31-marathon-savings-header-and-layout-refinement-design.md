# Marathon Savings: Header & Layout Refinement

## Overview

Refine the Marathon Savings page form blocks — `BasicParameters` and `EditableSection` — with a consistent header treatment, updated wording, and improved form layout for the currency + principal row.

## Scope

- `src/components/SectionHeader.tsx` (new)
- `src/components/BasicParameters.tsx`
- `src/components/EditableSection.tsx`
- `src/components/ui/select.tsx` (SelectItem padding only)
- `src/components/SectionHeader.test.tsx` (new)

No changes to FxDepositCompare page or its card headers.

## Design Decisions

### 1. SectionHeader Component (new)

A reusable card section header pattern so all future blocks use it consistently.

```
┌─────────────────────────────────────┐
│ ▌ 存款設定                    [✎]   │  ← SectionHeader
│ ─────────────────────────────────── │  ← mb-5 spacing
│ ... content ...                      │
└─────────────────────────────────────┘
```

**Interface:**
```ts
interface SectionHeaderProps {
  title: string
  action?: ReactNode  // optional element (e.g., Pencil icon button)
}
```

**Rendering:**
- Flex row: `flex items-center gap-2.5 mb-5`
- Accent bar: 3px wide, 16px tall, `bg-muted-foreground/20`, `rounded-sm`, `shrink-0`
- Title: `text-sm font-semibold text-foreground`
- Spacer: `flex-1` to push `action` to the right
- `action`: rendered as-is, for the caller to provide a button/link

The `mb-5` (20px) is built into the component because this spacing between header and content is consistent across all card sections. This ensures "nicely positioned" spacing by default — consumers just drop `<SectionHeader>` at the top of their card and the vertical rhythm is correct.

**Test expectations** (`SectionHeader.test.tsx`):
- Renders the title text
- Renders `action` when provided
- Does NOT render action container when `action` is undefined

### 2. BasicParameters — Uses SectionHeader

Replace the standalone `h2` with `<SectionHeader>`:

```diff
-<h2 className="text-sm font-semibold text-foreground mb-5">基本參數</h2>
+<SectionHeader title="存款設定" />
```

No action prop — this card is read-only.

### 3. EditableSection — Uses SectionHeader with Action

Replace the inline header row:

```diff
-<div className="flex items-center justify-between mb-5">
-  <h2 className="text-sm font-semibold text-foreground">{title}</h2>
-  <button ...><Pencil ... /></button>
-</div>
+<SectionHeader
+  title={title}
+  action={
+    <button ...><Pencil className="h-4 w-4" /></button>
+  }
+/>
```

### 4. Row Layout: Currency + Principal on One Row

In `BasicParameters.tsx`, the `SelectField` (存款貨幣) and `InputField` (初始本金) are placed in a two-column grid row instead of separate rows:

```html
<div className="grid grid-cols-2 gap-3">
  <SelectField label="存款貨幣" ... />
  <InputField label="初始本金" ... />
</div>
```

The `DateField` (實際存款日期) remains on its own row above.

Final field order:
1. 實際存款日期 (full width)
2. 存款貨幣 | 初始本金 (2-col grid)

### 5. SelectItem Touch Target

In `src/components/ui/select.tsx`, increase `SelectItem` vertical padding from `py-1` to `py-2.5` for better mobile touch targets. Also bump left padding from `pl-1.5` to `pl-2.5` for breathing room.

**Change:**
```
- py-1 pr-8 pl-1.5
+ py-2.5 pr-10 pl-2.5
```

## Files Changed

| File | Change |
|------|--------|
| `src/components/SectionHeader.tsx` | **New** — reusable card section header |
| `src/components/SectionHeader.test.tsx` | **New** — unit tests |
| `src/components/BasicParameters.tsx` | Uses SectionHeader, grid layout for currency/principal |
| `src/components/EditableSection.tsx` | Uses SectionHeader with action prop |
| `src/components/ui/select.tsx` | SelectItem padding increase |

## Not Changed

- FxDepositCompare.tsx — keeps its existing "輸入參數" card title, no accent bar treatment
- BasicParameters prop interface — unchanged, no consumer code changes needed
- MarathonSavings.tsx — no changes (props flow unchanged)
- InputField, SelectField, DateField component files — unchanged
