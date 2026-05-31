## 1. InputField — Bounded Box with Floating Label

- [x] 1.1 Read and confirm current `src/components/InputField.tsx`
- [x] 1.2 Rewrite InputField with bounded box structure, inline prefix/suffix, error state via `data-error`
- [x] 1.3 Verify build passes: `pnpm build`
- [x] 1.4 Commit: `git add src/components/InputField.tsx && git commit -m "refactor: floating label bounded box style for InputField"`

## 2. DateField — Bounded Box with Floating Label

- [x] 2.1 Read and confirm current `src/components/DateField.tsx`
- [x] 2.2 Rewrite DateField with bounded box and `color-scheme:dark` on date input
- [x] 2.3 Verify build passes: `pnpm build`
- [x] 2.4 Commit: `git add src/components/DateField.tsx && git commit -m "refactor: floating label bounded box style for DateField"`

## 3. SelectField — Bounded Box with Floating Label

- [x] 3.1 Read and confirm current `src/components/SelectField.tsx`
- [x] 3.2 Rewrite SelectField with restyled shadcn SelectTrigger inside bounded box; use `has-[button:focus-visible]` for focus ring
- [x] 3.3 Verify build passes: `pnpm build`
- [x] 3.4 Commit: `git add src/components/SelectField.tsx && git commit -m "refactor: floating label bounded box style for SelectField"`

## 4. ReadonlyDateField — Simplified Dim Box

- [x] 4.1 Read and confirm current `src/components/ReadonlyDateField.tsx`
- [x] 4.2 Rewrite ReadonlyDateField with dimmed box, no interactive states, no lock icon
- [x] 4.3 Verify build passes: `pnpm build`
- [x] 4.4 Commit: `git add src/components/ReadonlyDateField.tsx && git commit -m "refactor: floating label bounded box style for ReadonlyDateField"`

## 5. FxDepositCompare — Pair Related Fields into 2-Column Grid

- [x] 5.1 Read current `src/pages/FxDepositCompare.tsx` to find rate input fields
- [x] 5.2 Pair HKD/USD rate fields and sell/buy rate fields into `grid grid-cols-2 gap-3` containers
- [x] 5.3 Verify build passes: `pnpm build`
- [x] 5.4 Verify form field names match `useCalculator` schema
- [x] 5.5 Commit: `git add src/pages/FxDepositCompare.tsx && git commit -m "refactor: pair rate fields in FxDepositCompare for bounded boxes"`

## 6. Visual Verification

- [x] 6.1 Start dev server: `pnpm dev`
- [x] 6.2 Check FxDepositCompare page: bounded boxes, hover/focus/error states, 2-column grids, read-only end date field
- [x] 6.3 Check MarathonSavings page: BasicParameters bounded boxes, PhaseRateEditForm fields in Dialog/Sheet
- [x] 6.4 Run tests: `pnpm test`
- [x] 6.5 Commit any fixups: `git commit -am "fixup: bounded box form adjustments"`
