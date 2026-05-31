## Why

Form fields currently use a stacked layout (label above input) that wastes vertical space. A prior experiment with borderless fields eliminated input boundaries entirely, removing interaction affordance — editable fields looked indistinguishable from read-only text. The bounded box style restores clear touch affordance while saving vertical space by embedding the label inside the field boundary.

## What Changes

- Restyle `InputField` to a bounded box with floating label, inline prefix/suffix, and error state via `data-error` attribute
- Restyle `DateField` to bounded box with `color-scheme:dark` on the native date input
- Restyle `SelectField` to bounded box with restyled shadcn `SelectTrigger` (no border/bg/padding)
- Restyle `ReadonlyDateField` to simplified dim box — no interactive states, no lock icon
- Convert FxDepositCompare rate fields from full-width to 2-column grid pairs (HKD/USD rates paired, sell/buy rates paired)

## Capabilities

### New Capabilities
- `floating-label-bounded-forms`: Restyle all shared form field components to floating label bounded box style with visible box boundaries, internal labels, and consistent interaction states

### Modified Capabilities

<!-- No spec-level behavior changes — this is purely a visual restyle with no requirement changes -->

## Impact

- `src/components/InputField.tsx` — rewrite component structure
- `src/components/DateField.tsx` — rewrite component structure
- `src/components/SelectField.tsx` — rewrite component structure, restyle shadcn SelectTrigger
- `src/components/ReadonlyDateField.tsx` — rewrite component structure
- `src/pages/FxDepositCompare.tsx` — pair rate fields into 2-column grids
