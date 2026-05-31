## 1. Standardized Spacing

- [x] 1.1 Update SectionHeader `mb-5` → `mb-3`
- [x] 1.2 Update intro paragraph `mb-8` → `mb-4` on MarathonSavings and FxDepositCompare pages
- [x] 1.3 Update phase rate timeline row padding `p-3` → `p-2`
- [x] 1.4 Audit and align SelectField, DateField, InputField, ReadonlyDateField class structure (consistent p-3, text-[10px] label, text-base font-semibold value, mt-0.5 gap)
- [x] 1.5 Fix SelectField trigger to use fixed height matching other fields (remove `h-auto`)
- [x] 1.6 Update ReadonlyDateField to use `bg-input/30 border-border` (same as editable fields) instead of `border-border/50`

## 2. Edge-to-Edge Layout — MarathonSavings

- [x] 2.1 Remove `px-4` outer margin from MarathonSavings page container
- [x] 2.2 Remove card wrapper (`bg-card border border-border rounded-xl`) from all sections
- [x] 2.3 Replace section spacing with flat section dividers (border-bottom + bg-card bands) and standardized padding (p-4)
- [x] 2.4 Update left and right column gap to `gap-3`, inner grid gaps to `gap-2`
- [x] 2.5 Update grid gaps on phase rate timeline rows to `gap-2`

## 3. Currency Toggle Component

- [x] 3.1 Create `CurrencyToggle` component with V4 hybrid visual: side-by-side cards, radio dot (12px, top-right, 8px inset), active/inactive states
- [x] 3.2 Wire toggle to existing `useMarathonSavings` currency state (`inputs.setCurrency`)
- [x] 3.3 Add `CurrencyToggle.test.tsx` covering: initial render shows both currencies, tap switches active state, calls setCurrency with correct value
- [x] 3.4 Remove `HeroMetrics` component (no longer used) and its test file `HeroMetrics.test.tsx`
- [x] 3.5 Remove "存款貨幣" SelectField from `BasicParameters`; update any relevant `BasicParameters.test.tsx` assertions
- [x] 3.6 Add subtle confirmation line in BasicParameters: "貨幣已在頂部設定 — 僅顯示 HKD/USD 計算結果"

## 4. Edge-to-Edge Layout — FxDepositCompare

- [x] 4.1 Remove `px-4` outer margin from FxDepositCompare page container
- [x] 4.2 Remove card wrappers from FxDepositCompare sections
- [x] 4.3 Apply standardized padding (p-4) and spacing (mb-3, gap-2)

## 5. Edge-to-Edge Layout — Settings

- [x] 5.1 Remove `px-4` outer margin from Settings page container
- [x] 5.2 Remove card wrapper from Settings page
- [x] 5.3 Apply standardized spacing (p-4 section padding, border-bottom separators)

## 6. Flat UI Polish — Typography, Whitespace & Background

- [x] 6.1 Update SectionHeader: `text-sm font-semibold` → `text-lg font-bold`, `h-4` → `h-5`, `mb-3` → `mb-2`
- [x] 6.2 Replace `space-y-8` per-column spacing with `mb-8` on every section container — no per-column/layout-specific rules
- [x] 6.3 Remove `border-b border-border` from all section containers on all pages (MarathonSavings, FxDepositCompare, Settings)
- [x] 6.4 Replace inline `<h2>` with `<SectionHeader>` on FxDepositCompare and Settings pages
- [x] 6.5 Update `--background` from `oklch(0.13 0.028 265)` to `oklch(0.17 0.015 260)` with proportional lifts to all surface tokens
- [x] 6.6 Add Flat UI spacing guideline to AGENTS.md

## 7. Layout Consistency Standardization

- [x] 7.1 Create `SectionSeparator` component (`border-b border-border mx-4`, optional `className` prop)
- [x] 7.2 Replace all inline border dividers with `<SectionSeparator />` on MarathonSavings
- [x] 7.3 Split `ResultsPanel` into `InterestBreakdown` + `DepositSummary`, each with own test file
- [x] 7.4 Remove `mb-4` from all section containers — sections are now `px-4 py-4` with no margins
- [x] 7.5 Apply same consistent layout to FxDepositCompare: `px-4 py-4` sections with `SectionSeparator`, verdict card wrapped in section div
- [x] 7.6 Change section padding `py-3` → `py-4` across all files (7 occurrences)
- [x] 7.7 Update AGENTS.md with full Frontend Development Guidelines section

## 8. Verification

- [x] 8.1 Run `pnpm test` — verify all tests pass including new InterestBreakdown and DepositSummary tests
- [x] 8.2 Run `pnpm run lint` — verify no lint errors
- [x] 8.3 Run `pnpm build` — verify build succeeds
