## Context

iOS Safari injects native chrome into `<input type="date">` (calendar icon, date format padding) that has a minimum intrinsic width overriding Tailwind's `w-full`. In `grid-cols-2` layouts, this causes date inputs to overflow their grid children and overlap adjacent elements. Desktop browsers and mobile simulators are unaffected.

## Goals / Non-Goals

**Goals:**
- Fix iOS Safari date input overflow in grid layouts
- Apply globally at the base Input component — no per-form patches
- Preserve native date picker interaction (calendar popup on tap)

**Non-Goals:**
- No behavioral or API changes
- No restructuring of form layouts
- No changes to DateField component or individual pages

## Decisions

1. **`appearance-none` on all inputs (not just `type="date"`)**: `type="number"` inputs also have native stepper UI on iOS (~16px extra width). All inputs are fully custom-styled (border, bg, padding), so OS-native appearance has no design value. Applying globally prevents the same bleed in number inputs without needing to track input type.

2. **Defensive CSS reset as belt-and-suspenders**: `input[type="date"] { min-width: 0; max-width: 100%; }` in `@layer base` ensures any date input rendered outside the Input component is also constrained. No behavior change for properly-wired components.

3. **No DateField changes**: Existing `flex flex-col h-full` wrapper + `flex-1` on Input works correctly once `appearance-none` removes iOS's intrinsic width override. The base Input already provides `min-w-0` and `w-full`.

## Risks / Trade-offs

- **Risk**: `appearance-none` may affect other input types in unexpected ways on some browsers → Mitigation: Modern browsers handle `appearance-none` predictably; this is a well-established CSS property
- **Trade-off**: Removing the native calendar icon means users lose a visual affordance for date inputs → Mitigation: The native date picker still opens on tap; iOS provides implicit affordance through the date format displayed in the field
