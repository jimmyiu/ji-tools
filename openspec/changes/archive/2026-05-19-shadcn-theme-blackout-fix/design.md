## Context

After adopting shadcn/ui via `npx shadcn init`, the app inherited default CSS variable values that produce an ultra-black dark theme. The `.dark` block in `src/index.css` defines all visual tokens (`--background`, `--card`, `--input`, `--border`, etc.) using `oklch()` values that cluster near pure black with insufficient elevation differentiation.

The app is dark-only (`<html class="dark">`) and uses Tailwind v4 with the `@theme inline` directive to map CSS variables to utility classes. No `tailwind.config.*` file exists — all theme configuration lives in `src/index.css`.

This fix modifies only the CSS variable values in the `.dark {}` block. No component code, no JavaScript, no build config changes.

## Goals / Non-Goals

**Goals:**
- Recalibrate CSS variable lightness values to create a clear elevation hierarchy (background → card → input → border)
- Shift hue from 270° (indigo) to 260° (blue-grey slate) for a warmer, premium feel
- Retain primary CTA color at indigo (270°) for brand consistency
- Ensure every surface level is visually distinguishable from adjacent levels
- Keep the change contained to `src/index.css` only

**Non-Goals:**
- No light mode support
- No component-level style changes
- No JavaScript or React code changes
- No build configuration changes
- No new CSS variables beyond the standard shadcn token set
- No animation, typography, or spacing changes

## Decisions

- **Use oklch color space**: Already in use by the project — modern, perceptually uniform, no reason to switch. All values already use oklch.
- **Lightness ladder**: Background (0.115) → Card (0.155, +4pp) → Popover/Muted (0.17, +1.5pp) → Input (0.19, +2pp) → Secondary/Accent (0.195, +1pp) → Border (0.21, +1.5pp). Each step is 1-4pp above the previous, ensuring every surface is visually distinct.
- **Hue 260°**: Chosen over 270° (indigo) for a warmer blue-grey slate that signals trust and reduces eye strain. Chroma kept low (0.006-0.01) for a muted, premium feel.
- **Primary kept at 270° (indigo)**: Retains the original brand color at the original value (`oklch(0.53 0.19 270)`) for familiar visual identity against the new slate surfaces. Provides high contrast and strong CTA emphasis.
- **Ring matches primary**: Consistent focus indicator styling — the focus ring matches the indigo primary.

## Risks / Trade-offs

- **Perceptual inconsistency**: OKLCH values don't map linearly to perceived lightness across different screens. Real-world verification on multiple devices recommended. **Mitigation**: Test on at least one OLED and one LCD display before merging.
- **Primary color reconsidered**: Teal was initially chosen to signal finance/growth but was reverted to indigo during implementation for brand consistency. **Mitigation**: Indigo was the original color and matches existing user expectations.
- **Accessibility**: Lower contrast ratios between background and card (0.115 vs 0.155) could affect readability for some users. **Mitigation**: Text foreground remains at 0.88 (high contrast), and the changes only affect surface/bg colors, not text. Run a WCAG contrast check before merging.
