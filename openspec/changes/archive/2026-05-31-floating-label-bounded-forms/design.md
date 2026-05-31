## Context

Form fields currently use a stacked layout with labels above inputs, consuming 2 rows per field. A prior borderless experiment removed all input boundaries, making editable fields indistinguishable from read-only text. The bounded box approach solves both problems: clear affordance via the visible box boundary, and vertical efficiency by embedding the label inside the box.

All shared form field components live in `src/components/`: `InputField`, `DateField`, `SelectField`, `ReadonlyDateField`. They use React 19, Tailwind CSS 4, and shadcn/ui primitives. The app is dark-only with CSS custom properties for theming.

## Goals / Non-Goals

**Goals:**
- Restyle all 4 shared field components to floating label bounded box style
- Establish consistent interaction model (rest, hover, focus, error, read-only)
- Support inline prefix/suffix in InputField
- Use Tailwind CSS 4 `data-` variants for error state styling
- Ensure compatibility with existing consumers (no prop API changes except additions)

**Non-Goals:**
- Page-level card containers or section headings
- Validation logic changes
- Results panel styling
- Animation beyond CSS transitions

## Decisions

1. **Pure Tailwind data- variants for error state**: The outer div carries `data-error` and `group` classes. Tailwind CSS 4 `data-[error]:` variants handle the parent div's border/background/ring styling. The `group-data-[error]:` variant handles the label text color. This eliminates any conditional className logic — all styling is declarative Tailwind.

2. **useId for label-input association**: Uses React 19's `useId()` hook for generating unique IDs instead of manual ID props — avoids collision and reduces prop surface area.

3. **No background on ReadonlyDateField**: Read-only fields use `border-border/50` without `bg-input/30` background. This provides visual contrast with editable fields while keeping the dimmer aesthetic described in the design spec.

4. **has-[button:focus-visible] for SelectField focus**: SelectField uses `has-[button:focus-visible]` instead of `focus-within` because shadcn SelectTrigger manages focus internally. The `has-` selector detects focus on the nested trigger button.

## Risks / Trade-offs

- **[Risk] shadcn Select upgrade may change SelectTrigger structure**: The `has-[button:focus-visible]` approach is specific to current shadcn Select markup. A future upgrade could break the focus ring → Mitigation: pin shadcn/ui version
- **[Risk] color-scheme:dark on date input behavior varies across browsers**: The calendar icon rendering differs between WebKit, Firefox, and Chrome → Mitigation: accept browser-appropriate defaults, test on target platforms
- **[Resolved] InputField error uses ternary + data-error**: The initial plan used a hybrid, but the final code uses pure `data-` + `group-data-` Tailwind variants — no conditional logic, no dead attribute. Resolved before implementation.
- **[Trade-off] InputField removes existing shadcn Input dependency**: The new implementation uses raw `<input>` with Tailwind classes instead of shadcn Input component — eliminates a dependency but loses any future shadcn Input updates
