## Why

After the recent shadcn/ui migration, the app's dark theme collapsed into a flat, ultra-black aesthetic. shadcn's default CSS variables use near-black values for `--background`, `--card`, and other surface tokens, destroying visual elevation hierarchy. For a consumer-facing finance tool, this harsh developer-terminal look undermines trust and premium feel. Addressing this now — before more components are built on the current tokens — prevents the visual debt from compounding.

## What Changes

**CSS Variable Values in `.dark {}` Block (src/index.css)**
- From: Near-black surfaces with insufficient elevation differentiation (background 0.09, card 0.13, only 4pp apart)
- To: Systematic lightness ladder with distinct surface levels (background 0.115, card 0.155, input 0.19, border 0.21)
- Reason: Create clear visual hierarchy for a premium, native-app feel
- Impact: Non-breaking visual-only change

**Hue System**
- From: 270° (indigo/purple) across all surfaces
- To: 260° (blue-grey slate) for backgrounds, 270° (indigo) retained for primary CTA
- Reason: Warmer slate feels more premium; indigo primary retains brand consistency
- Impact: Non-breaking visual-only change; `--ring` matches `--primary`

## Capabilities

### New Capabilities
- `visual-theme`: Defines the CSS custom property values for shadcn/ui design tokens in the dark-only theme, establishing the elevation hierarchy (background → card → input → border) and color semantics (slate surfaces with indigo primary)

### Modified Capabilities
*(none — this is the first spec-driven change to the visual theme)*

## Impact

- **Single file changed**: `src/index.css` — only the `.dark {}` CSS variable block
- **No JS/TS changes**: Zero React component modifications
- **No dependency changes**: Tailwind v4, shadcn/ui tokens remain identical
- **No build changes**: `vite.config.ts`, `components.json`, `tsconfig` all untouched
- **Rollback**: Revert the CSS variable values in `.dark {}` — single commit reversal
