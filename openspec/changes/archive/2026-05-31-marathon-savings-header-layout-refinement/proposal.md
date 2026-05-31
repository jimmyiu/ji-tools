## Why

The Marathon Savings page form blocks (`BasicParameters` and `EditableSection`) use inconsistent header treatments — one uses a standalone `<h2>`, the other uses a flex row with inline button. This creates visual inconsistency and makes it harder to maintain a unified design language across card sections.

## What Changes

- Create a new `SectionHeader` component with accent bar, title, and optional action slot
- Replace inline header markup in `BasicParameters` and `EditableSection` with `SectionHeader`
- Update `BasicParameters` title from "基本參數" to "存款設定"
- Arrange currency and principal fields in a two-column grid row
- Increase `SelectItem` touch target padding for better mobile UX

## Capabilities

### New Capabilities

- `section-header`: Reusable card section header with accent bar, title, and optional action slot

### Modified Capabilities

(none — this is additive UI refinement, no spec-level behavior changes)

## Impact

- `src/components/SectionHeader.tsx` — new component
- `src/components/SectionHeader.test.tsx` — new tests
- `src/components/BasicParameters.tsx` — uses SectionHeader, grid layout
- `src/components/EditableSection.tsx` — uses SectionHeader with action prop
- `src/components/ui/select.tsx` — SelectItem padding increase
- No changes to FxDepositCompare page, form field components, or consumer code
