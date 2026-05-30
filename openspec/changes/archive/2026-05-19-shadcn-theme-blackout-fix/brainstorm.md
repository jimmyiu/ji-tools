## Design Summary

After migrating to shadcn/ui, the app's visual depth collapsed into a harsh, ultra-black aesthetic. shadcn's default dark mode defines CSS variables with near-black values, and since the app's components now use semantic tokens like `bg-card` and `bg-background`, they blindly pull these defaults — destroying elevation hierarchy.

The fix recalibrates the CSS variables in `src/index.css` to use a "Soft Dark" approach with a systematic lightness ladder. The hue shifts from 270° (indigo) to 260° (blue-grey slate) for a warmer, more premium feel, while the primary CTA retains indigo (270°) for brand consistency.

## Alternatives Considered

### Approach A: Gentle Elevation
- **How**: Minimal lightness bump: background 0.09 → 0.11, card 0.13 → 0.15. Keep most values near current.
- **Pros**: Lowest risk, barely touches existing values, trivially reversible.
- **Cons**: Insufficient visual separation — 2pp gaps still too subtle to fix the "blackout" feel.
- **Why rejected**: Doesn't solve the core problem; users would still perceive a flat black UI.

### Approach B: Full Elevation System
- **How**: Systematic lightness ladder: bg 0.115 → card 0.155 → input 0.19 → border 0.21, each with distinct elevation. Hue 260° blue-grey slate, primary kept at indigo 270°.
- **Pros**: Clear visual hierarchy, premium native-app feel, deliberate FinTech identity.
- **Cons**: More values change, but all within a single CSS block — trivially reviewable.
- **Why chosen**: Best balance of visual impact and minimal code surface area.

### Approach C: High Contrast Soft Dark
- **How**: Aggressive gaps: bg 0.12, card 0.18 (+6pp), input 0.22, border 0.25. Max visual separation.
- **Pros**: Highest readability, very clear surface distinctions.
- **Cons**: Less premium feel — large gaps can look cheap or noisy in a dark UI.
- **Why rejected**: The app is a financial tool, not a dashboard; subtlety and premium feel matter more than maximum contrast.

## Agreed Approach

**Approach B: Full Elevation System** — chosen for its balance of clear visual hierarchy and premium aesthetic. The systematic lightness ladder (bg 0.115 → card 0.155 → input 0.19 → border 0.21) creates distinct surface levels without the harshness of pure black or the noise of excessive contrast. The hue shift to 260° (blue-grey slate) provides a warmer, trust-signalling foundation, while the indigo primary (270°) retains the original brand identity.

## Key Decisions

- **Hue 260° (blue-grey slate)**: Replaces 270° indigo. Warmer, less clinical, signals trust and stability — important for a finance tool.
- **Primary kept at 270° (indigo)**: Retains the original brand color for consistency. Provides familiar visual identity against the new slate surfaces.
- **Ring matches primary**: Unified focus styling — the focus ring matches the indigo primary.
- **Muted-foreground snaps to 260°**: Monochromatic harmony — no hue drift for secondary text.
- **Dark-only preserved**: No light mode introduced; `src/index.css` keeps only `.dark` variables.

## Open Questions

- Whether any component-level overrides are needed (e.g., specific cards or inputs that need custom token values beyond the global CSS variables) — likely none required, but worth verifying during implementation.
