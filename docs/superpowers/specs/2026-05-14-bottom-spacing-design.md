# Bottom Spacing & Consistent Gap Design

## Problem

The app has excessive empty space at the bottom of every page. When scrolling to the end, there is a 168px gap between the last card and the bottom tab bar (112px from `pb-28` on `<main>` plus a 56px `h-14` spacer div). This makes the app feel unfinished — like content is missing or the scroll extends too far.

Additionally, card gaps are inconsistent across pages: Home uses `gap-4` (16px) while FxDepositCompare and MarathonSavings use `gap-6` (24px).

## Solution

1. **Remove the redundant spacer div** (`<div className="h-14" />`) below `<main>` in `Layout.tsx`
2. **Replace `pb-28` with `pb-[72px]`** on `<main>` — 56px TabBar clearance + 16px breathing room
3. **Standardize all card gaps to `gap-4` / `space-y-4`** (16px) across every page

## Changes

### `src/components/Layout.tsx`
- Remove `<div className="h-14" />` spacer between `<main>` and `<InstallBanner>`
- Change `<main className="flex-1 page-enter pb-28">` to `<main className="flex-1 page-enter pb-[72px]">`

### `src/pages/FxDepositCompare.tsx`
- Main grid: `gap-6` → `gap-4`
- Right column flex: `gap-6` → `gap-4`

### `src/pages/MarathonSavings.tsx`
- Main grid: `gap-6` → `gap-4`

### `src/pages/Home.tsx`
- No changes needed — already uses `gap-4`

## Result

- Consistent 16px gap between all cards across all pages
- Minimal 16px breathing room between the last card and the bottom tab bar
- No redundant spacer div — single source of truth for bottom clearance