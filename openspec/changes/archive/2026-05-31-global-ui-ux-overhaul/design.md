## Context

The application has three layout problems on mobile inner pages: (1) floating card wrappers compress usable width on data-heavy calculator pages, (2) form elements have subtly mismatched baseline heights when placed side by side, and (3) the currency dropdown duplicates state that could be managed more directly via a hero-section toggle.

The MarathonSavings page underwent a value-first redesign in a previous change but retained the card-wrapped section pattern. FxDepositCompare and Settings also use the same card layout. The SectionHeader component was recently extracted to unify section headers. This change builds on that work by removing the card wrappers and standardizing spacing.

## Goals / Non-Goals

**Goals:**
- Reclaim ~40+px horizontal space per side on inner pages by removing card wrappers
- Make all form input types (Select, Date, Text, Readonly) render at identical heights
- Standardize vertical whitespace: `px-4 py-4` on every section container, `<SectionSeparator />` between sections, `mb-2` below section headers
- Replace HeroMetrics dual-card display with a tappable HKD/USD toggle that filters the page
- Remove the currency dropdown from BasicParameters
- Elevate section header typography to `text-lg font-bold` so headers anchor sections in flat layout
- Lighten background from near-black `oklch(0.13 0.028 265)` to warm dark grey `oklch(0.17 0.015 260)` for texture and readability

**Non-Goals:**
- No changes to the scroll-collapsing header bar
- No changes to TabBar, SideNav, PWA banners, or app chrome
- Color palette changes limited to surface brightness — accent/primary colors unchanged
- No changes to Homepage card layout
- No changes to FxDepositCompare's dual-currency comparison logic (it shows both simultaneously)
- No new routing or page-level structural changes

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Section separation | `px-4 py-4` on every section container + `<SectionSeparator />` between them — no per-column/layout-specific rules | `py-4` (16px) above and below each separator is perfectly balanced; `SectionSeparator` accepts `className` for responsive hiding (e.g., `lg:hidden` in multi-column grids) |
| Section header typography | `text-lg font-bold` + `h-5` accent bar + `mb-2` | In flat layout, typography must do section-separation work; larger bolder headers anchor content blocks via Gestalt proximity |
| Spacing values | Tailwind classes directly (mb-3, p-4, gap-2) rather than CSS custom properties | Tailwind can express all values natively; no need for abstraction layer |
| Currency toggle placement | Top of page, replacing HeroMetrics slot | Highest visibility; user sets currency before interacting with form below |
| Toggle visual | Side-by-side cards, radio dot at top-right (12px, 8px inset) | Both rates always visible; dot is universal selection affordance; dot in corner avoids competing with rate number |
| Inactive state | 0.5 opacity + outline radio dot | Clearly signals dimmed state without removing content |
| Input height enforcement | Consistent p-3 padding + identical label/value typography across all field types | Current pattern already close; only minor CSS adjustments needed for SelectField trigger height |
| Section approach | `px-4 py-4` on every section, no vertical margins; `SectionSeparator` between sections | Works identically in 1-column, 2-column, or stacked layouts; no special cases; consistent across all pages |
| Visual cards within sections | Wrap visual card in `px-4 py-4` section div, card keeps its own `p-4`/`p-6` and visual classes (border, bg-tint, rounded) | Consistent outer spacing regardless of card content; inner card visual variety is preserved |
| Background color | Lighten from `oklch(0.13 0.028 265)` to `oklch(0.17 0.015 260)` with proportional lifts to all surface tokens | Near-black background made section boundaries invisible in flat layout; warm dark grey adds texture while remaining unambiguously dark mode |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Edge-to-edge layout may look too compressed on larger screens | max-w-5xl mx-auto is retained for desktop; edge-to-edge is primarily a mobile concern |
| Flat layout may blur section boundaries | Use `text-lg font-bold` headers + `SectionSeparator` between sections — explicit divider lines with balanced `py-4` spacing on both sides |
| Currency toggle is new interactive pattern — users may not discover it | Radio dot + border highlight + tap-to-switch behavior mirrors familiar mobile toggle patterns |
