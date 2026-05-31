# Global UI/UX Overhaul: Edge-to-Edge Layout, Standardized Spacing, and Currency Toggle

## Overview

Three structural improvements across the application to address layout inefficiencies, visual inconsistencies, and redundant currency selection on inner pages.

**Pages affected:** MarathonSavings (primary), FxDepositCompare, Settings, Homepage (unchanged card layout)

## Refinement 1: Differentiated Page Architecture

### Homepage — Unchanged
- Retains current card-based grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`)
- Cards: `bg-card border border-border rounded-xl` — no changes

### Inner Pages — Edge-to-Edge (Flat) Layout
- Remove outer horizontal margins (`px-4`) so background extends to screen edges
- Use subtle background color bands (`bg-card` on alternating sections) + bottom borders (`border-b border-border`) to separate sections instead of floating cards
- Single layer of consistent inner padding: `p-4` (16px) for content
- No more `bg-card border border-border rounded-xl` card wrappers on inner pages
- Transition from card-based section containers to flat section dividers

### Visual structure (inner page)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ← existing scroll-collapsing header
│  實際等效年利率                      │  ← bg-card band (edge-to-edge)
│  ┌─────┐  ┌─────┐                  │
│  │3.50%│  │4.20%│                  │
│  │ HKD │  │ USD │                  │
│  └─────┘  └─────┘                  │
├─────────────────────────────────────┤
│  階段利率                     ✏️    │  ← flat section
│  ▓▓▓▓  ▓▓▓▓  ▓▓▓▓▓                 │
│  phase bars                         │
├─────────────────────────────────────┤
│  存款設定                            │  ← flat section
│  [存款日] [本金]                    │
│  (no currency dropdown)             │
├─ bg-band ───────────────────────────┤
│  利息明細                            │  ← flat section
│  第1階 ... HK$ 525                  │
│  總計 ...                           │
└─────────────────────────────────────┘
```

## Refinement 2: Global UI Standardization

### Whitespace Token System
Standardize all spacing across the app to these values:

| Context | Current | Standardized |
|---------|---------|-------------|
| SectionHeader → content | `mb-5` (20px) | `mb-3` (12px) |
| Card/section padding | `p-6` (24px) | `p-4` (16px) |
| HeroMetrics card padding | `p-5` (20px) | `p-4` (16px) |
| Intro paragraph bottom | `mb-8` (32px) | `mb-4` (16px) |
| Grid gap (inner pages) | `gap-4` (16px) | `gap-3` (12px) |
| Inner grid gap (2-col forms) | `gap-3` (12px) | `gap-2` (8px) |
| Phase row padding | `p-3` | `p-2` (8px) |
| Section separator | `mb-6` (24px) | border-bottom |

### Uniform Input Heights
All form inputs (SelectField, DateField, InputField, ReadonlyDateField) enforce identical internal sizing:
- Outer box: `rounded-lg border p-3` (unchanged as base)
- Label: `text-[10px]` (unchanged)
- Value: `text-base font-semibold` (unchanged)
- Inner content alignment: `h-5` region between label bottom and value top set to `mt-0.5`
- Select trigger: remove `h-auto`, match natural height from padding + font
- ReadonlyDateField: use same padding/bg as editable fields (currently uses `border-border/50` without `bg-input` — make consistent)

The key change: ensure all three field types (select, date, input) produce the exact same rendered height when placed side by side. This is primarily a CSS audit to verify each field's internal box model produces identical `offsetHeight`.

### SectionHeader Standardization
All section headers use the existing `SectionHeader` component with its standard `mb-5` changed to `mb-3` globally via a CSS variable or direct class update.

## Refinement 3: Global Currency Toggle

### Location
Replace the existing HeroMetrics two-card display (top of MarathonSavings) with an interactive toggle.

### Visual Design (V4 — Hybrid with Radio Dot)
- Two side-by-side cards below the "實際等效年利率" label
- **Active state**: Primary border (`border-primary`), subtle primary bg tint (`bg-primary/5`), filled radio dot (12px) at top-right (8px from top edge, 8px from right edge)
- **Inactive state**: Subtle border (`border-border`), dimmed opacity (0.5), outline radio dot (12px) with 2px stroke at top-right (8px from top edge, 8px from right edge)
- Tapping either card selects that currency; inactive becomes active, previously active becomes inactive
- Both rates always visible for direct comparison

```
實際等效年利率

┌──────────────┐  ┌──────────────┐
│          ●   │  │          ○   │
│  3.50%       │  │  4.20%       │
│  HKD 港元    │  │  USD 美元    │
│ (primary     │  │ (dimmed,     │
│  border+glow)│  │  low opacity)│
└──────────────┘  └──────────────┘
        ↑ active          ↑ inactive
```

### Global Behavior
- Selected currency acts as a page-wide filter
- Phase rate timeline shows only the selected currency's rates
- Calculation results (interest breakdown, totals) use the selected currency
- 利息明細 table shows only the selected currency's breakdown
- Currency indicator on amounts (HK$ vs US$) updates accordingly

### Removal of Internal Dropdown
- Permanently remove the "存款貨幣" SelectField from BasicParameters component
- Currency state moves to the hero toggle as single source of truth
- The form section shows a subtle confirmation line: "貨幣已在頂部設定 — 僅顯示 HKD/USD 計算結果"

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/MarathonSavings.tsx` | Replace HeroMetrics with new CurrencyToggle; remove card wrappers; standardize spacing |
| `src/pages/FxDepositCompare.tsx` | Edge-to-edge layout; standardized spacing |
| `src/pages/Settings.tsx` | Standardized spacing (card → flat sections) |
| `src/pages/Home.tsx` | No changes (retains cards) |
| `src/components/HeroMetrics.tsx` | Remove (replaced by CurrencyToggle) |
| `src/components/BasicParameters.tsx` | Remove currency SelectField; standardize spacing |
| `src/components/EditableSection.tsx` | Standardize spacing; remove card wrapper |
| `src/components/ResultsPanel.tsx` | Standardize spacing; edge-to-edge section styling |
| `src/components/SectionHeader.tsx` | Change `mb-5` → `mb-3` |
| `src/components/InputField.tsx` | Height consistency audit |
| `src/components/DateField.tsx` | Height consistency audit |
| `src/components/SelectField.tsx` | Height consistency audit |
| `src/components/ReadonlyDateField.tsx` | Height consistency audit |
| `src/components/CurrencyToggle.tsx` | **New** — the V4 hybrid toggle component |
| `src/hooks/useMarathonSavings.ts` | Currency state stays in hook (`inputs.setCurrency`); CurrencyToggle calls same setter |

## Out of Scope
- Header bar redesign — current scroll-collapsing header stays unchanged
- FxDepositCompare currency logic (no toggle needed — it compares both)
- PWA banners, TabBar, SideNav, InstallBanner, UpdateBanner — spacing stays
- SectionHeader component exists already and is reused, not redesigned
- No new routing or page-level structural changes beyond layout
- No color theme changes (existing dark-only design system untouched)
