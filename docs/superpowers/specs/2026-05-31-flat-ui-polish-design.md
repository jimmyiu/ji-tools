# Flat UI Polish: Typographic Hierarchy, Macro-Whitespace & Background Tint

## Overview

Three visual refinements to perfect the edge-to-edge (flat) layout introduced in the global UI/UX overhaul. With card backgrounds removed, section separation now relies on typographic strength, vertical whitespace, and a slightly lighter backdrop.

**Pages affected:** MarathonSavings, FxDepositCompare, Settings (all inner pages). Homepage stays unchanged.

## Refinement 1: Elevate Typographic Hierarchy

### SectionHeader Component

Increase the visual weight of all major section headers so they anchor their content block:

| Property | Before | After |
|----------|--------|-------|
| Title font size | `text-sm` (14px) | `text-lg` (18px) |
| Title font weight | `font-semibold` | `font-bold` |
| Accent bar height | `h-4` (16px) | `h-5` (20px) |
| Header → content spacing | `mb-3` (12px) | `mb-2` (8px) |

Rationale: In a flat layout, typography must do the heavy lifting of structuring the page. `text-lg font-bold` creates an unambiguous visual anchor that signals "a new section begins here." Reducing `mb-3 → mb-2` makes the header visually "hug" its content via Gestalt proximity.

### Inline `<h2>` headers (FxDepositCompare, Settings)

Replace bare `<h2 className="text-sm font-semibold ...">` with `<SectionHeader>` to get the accent bar + new typography automatically. Where section headers lack an accent bar entirely (FxDepositCompare's "輸入參數" and "計算結果"), convert to use `SectionHeader`.

## Refinement 2: Macro-Whitespace (No Divider Lines)

Add generous vertical spacing between major sections — no horizontal ruler lines needed. Whitespace alone becomes the invisible divider.

| Context | Before | After |
|---------|--------|-------|
| Between major sections | `border-b` only (adjacent) | `mt-8` (32px) above each section header |
| Within-section dividers | `border-b` on items | unchanged — keep for internal rows |

The section containers in each page's grid column should get `space-y-8` on the column wrapper rather than individual `mt-8` on each child. This keeps the first section flush with the top while spacing subsequent sections.

No full-width `border-t` or `border-b` dividers between sections — the 32px gap IS the separator.

Remove the existing `border-b border-border` from section container divs on MarathonSavings (CurrencyToggle, EditableSection wrapper, BasicParameters wrapper, ResultsPanel wrapper). These divider lines are replaced by the `space-y-8` gap.

### Page-specific notes

**MarathonSavings** — sections stack vertically in each grid column. Apply `space-y-8` to both column wrappers.

**FxDepositCompare** — each grid column has only one major section (left: 輸入參數, right: 計算結果 + inline verdict card). These form a single logical section per column — no `space-y-8` needed. The inline `<h2>` tags in both columns should be replaced with `<SectionHeader>`. The verdict card's `mt-3` relative to the results section stays unchanged (it's part of the same section).

**Settings** — the page is a single vertical list (關於 header + rows), not multiple sections. Apply `<SectionHeader>` to the "關於" line. No `space-y-8` between list rows — they're items within a single section. The `border-b border-border` between list rows stays as intra-section dividers. Remove `border-b border-border` only from the container that wraps the entire list (the first `px-4 py-3` div).

## Refinement 3: Background Color

Lighten the app background from near-black to a warm dark grey for better texture and readability:

| Token | Before | After |
|-------|--------|-------|
| `--background` | `oklch(0.13 0.028 265)` | `oklch(0.17 0.015 260)` |
| `--card` | `oklch(0.17 0.028 265)` | `oklch(0.19 0.02 260)` (proportional lift) |

Rationale: `oklch(0.13)` is nearly black — sections with subtle `border-b` separators barely register as distinct blocks. `oklch(0.17 0.015 260)` is a warm dark grey that:
- Provides enough luminance contrast for section boundaries to read naturally
- Avoids feeling "grey" — the lower chroma (0.015 vs 0.028) reduces blue cast
- Still reads unambiguously as a dark mode design

Secondary surfaces (`--card`, `--input`, `--muted`, `--secondary`) should be lifted proportionally so the relative hierarchy is preserved (card is 2 steps lighter than background, etc.).

## AGENTS.md Guideline

Add a convention note under the Conventions section:

> **Flat UI spacing rule:** Major sections on inner pages are separated by `mt-8` (32px) of pure whitespace — no horizontal divider lines. Section headers use `text-lg font-bold` with a `h-5` accent bar and `mb-2` below. This is the project's approach to section hierarchy in the edge-to-edge layout. App background is `oklch(0.17 0.015 260)` (warm dark grey), not pure black.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/SectionHeader.tsx` | `text-sm font-semibold` → `text-lg font-bold`; `h-4` → `h-5`; `mb-3` → `mb-2` |
| `src/components/SectionHeader.test.tsx` | Update class assertions to match new values |
| `src/pages/MarathonSavings.tsx` | Add `space-y-8` to grid column wrappers; remove `border-b` from section containers |
| `src/pages/FxDepositCompare.tsx` | Replace `<h2>` with `<SectionHeader>`; no spacing changes (single section per column) |
| `src/pages/Settings.tsx` | Replace `<h2>` with `<SectionHeader>`; remove `border-b` from list container wrapper (keep on individual rows) |
| `src/components/EditableSection.tsx` | Inner container spacing: no change needed (uses SectionHeader) |
| `src/components/BasicParameters.tsx` | No change needed (uses SectionHeader) |
| `src/components/ResultsPanel.tsx` | No change needed (uses SectionHeader) |
| `src/index.css` | Update `--background`, `--card`, `--input`, `--muted`, `--secondary` with new oklch values |
| `AGENTS.md` | Add Flat UI spacing guideline |

## Deferred: Outer Container Padding Refactor

Move `px-4` from individual section components to the outer page container so that:
- `SectionSeparator` can be a plain `border-b border-border` without `mx-4`
- Section components drop their `px-4` (rely on parent's padding)
- New pages only need `px-4` on the outer div and everything aligns

**Files affected:** MarathonSavings, FxDepositCompare, Settings outer divs; CurrencyToggle, EditableSection, BasicParameters, InterestBreakdown, Settings list rows, all intro paragraphs.

## Out of Scope

- Homepage card layout — stays unchanged
- CurrencyToggle styling — already finalized in previous design
- Header bar, TabBar, SideNav, banners — no spacing changes
- Any JS/TS business logic changes
- Responsive breakpoint adjustments (spacing scales naturally)
