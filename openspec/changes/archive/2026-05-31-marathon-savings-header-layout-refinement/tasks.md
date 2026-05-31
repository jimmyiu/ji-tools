## 1. Create SectionHeader Component

- [x] 1.1 Create `src/components/SectionHeader.tsx` with accent bar, title, optional action slot, and mb-5 spacing
- [x] 1.2 Create `src/components/SectionHeader.test.tsx` with tests for title rendering, action rendering, and no-action case

## 2. Update BasicParameters

- [x] 2.1 Replace `<h2>` with `<SectionHeader title="存款設定" />`; update `BasicParameters.test.tsx` assertion from `'基本參數'` to `'存款設定'`
- [x] 2.2 Wrap currency `SelectField` and principal `InputField` in a `grid grid-cols-2 gap-3` container

## 3. Update EditableSection

- [x] 3.1 Replace inline flex header with `<SectionHeader title={title} action={...} />`

## 4. Update SelectItem Touch Targets

- [x] 4.1 In `src/components/ui/select.tsx`, change SelectItem padding from `py-1 pr-8 pl-1.5` to `py-2.5 pr-10 pl-2.5`
