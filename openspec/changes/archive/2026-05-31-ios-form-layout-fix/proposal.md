## Why

`<input type="date">` elements overflow their grid containers on iOS Safari because the browser injects native chrome (calendar icon, date format padding) that has a minimum intrinsic width overriding CSS `w-full`. This causes side-by-side date fields in `grid-cols-2` layouts to overlap adjacent elements.

## What Changes

- Add `appearance-none` to the base `Input` component's className in `src/components/ui/input.tsx` — strips native OS chrome from all input types (date, number, etc.) globally
- Add a defensive CSS reset `input[type="date"] { min-width: 0; max-width: 100%; }` in `src/index.css` `@layer base` block
- No per-page or per-form patches; the fix propagates to all forms from the single Input component
- No logic, behavior, or API changes — purely visual/styling fix

## Capabilities

### New Capabilities
- `ios-form-layout`: Fixes iOS Safari input overflow in grid layouts by removing native appearance with `appearance-none` and adding defensive CSS resets for date inputs

### Modified Capabilities

None.

## Impact

- `src/components/ui/input.tsx` — one class addition to the existing className string
- `src/index.css` — two CSS declarations in the `@layer base` block
- Zero behavioral change for desktop browsers or properly-wired components
- Native date picker still opens on tap; only the visual calendar icon is removed
