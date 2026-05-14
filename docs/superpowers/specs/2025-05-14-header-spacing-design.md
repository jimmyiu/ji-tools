# Header Spacing Fix

## Problem

Large, unnatural empty space between the top title and the content below (cards, description text). The gap is ~48px (header `pb-4` = 16px + page `py-8` top = 32px), making the layout feel disconnected and pushing content too far down.

## Approach

Reduce padding in two places:

1. **Layout header** (`src/components/Layout.tsx:33`): Change `pb-4` to `pb-2` on the not-scrolled header state
2. **Page top padding** (all page components): Change `py-8` to `py-4` on the outer `<div>` of each page

This reduces the gap from ~48px to ~24px — roughly halving it — giving a natural "breathing room" between title and content without feeling cramped.

## Files to change

| File | Change |
|------|--------|
| `src/components/Layout.tsx:33` | `pb-4` → `pb-2` |
| `src/pages/Home.tsx:20` | `py-8` → `py-4` |
| `src/pages/FxDepositCompare.tsx:78` | `py-8` → `py-4` |
| `src/pages/MarathonSavings.tsx:95` | `py-8` → `py-4` |
| `src/pages/Settings.tsx:7` | `py-8` → `py-4` |

## Out of scope

- Smooth scroll-based header collapse (Approach B) — deferred
- Any changes to the compact (scrolled) header state
- Changes to horizontal padding or other layout concerns