# Marathon Savings Page Redesign — Design Spec

**Date:** 2026-05-31
**Status:** Draft
**Author:** Jimmy + AI

## Problem Statement

The Marathon Deposit (馬拉松存款) page has an information hierarchy problem on mobile. The core value proposition — Effective Annual Rate (實際等效年利率) and Total Interest (期滿總利息) — is buried at the bottom of the page. Users must scroll past a massive multi-screen "Phase Rate Settings" form to see results.

## Solution Overview

Restructure the layout to follow a "Value-First Golden Flow":

1. **Hero Metrics** — Effective rates visible immediately
2. **Phase Rate Timeline** — Compact visual summary of current rates
3. **Basic Parameters** — User inputs (deposit date, currency, principal)
4. **Results & Breakdown** — Detailed output

The phase rate settings form moves into an edit overlay (bottom sheet on mobile, centered modal on desktop), accessible via a pencil icon on the timeline summary.

## Design Decisions

### 1. Page Layout

#### Mobile (top to bottom)

1. Hero Metrics (HKD + USD effective rates)
2. Phase Rate Timeline (visual summary with edit icon)
3. Basic Parameters (deposit date, currency, principal)
4. Results (total days, total interest, per-phase breakdown)

#### Desktop (2-column)

**Left column:**
1. Hero Metrics
2. Phase Rate Timeline
3. Basic Parameters

**Right column:**
1. Results (anchored to top)

### 2. Hero Metrics

Display HKD and USD effective annual rates in prominent cards.

**Add deposit start date as subtitle:**
- Format: "由 dd-MMM 起計" (e.g., "由 31-May 起計")
- Positioned below the rate number
- Uses `inputs.depositDate` (defaults to system date)
- Clarifies that the effective rate is calculated from the deposit date, not the full timeline period

**Visual:**
```
┌─────────────────────────────────┐
│ HKD 實際等效年利率              │
│ 1.97%                           │
│ 由 31-May 起計                  │
└─────────────────────────────────┘
```

### 3. Phase Rate Timeline

A compact visual summary showing all phase rates at a glance.

#### Dual-Label Bar

- Horizontal bar with segments proportional to phase day counts (using `flex: N` where N = days)
- Each segment displays:
  - **Top line:** HKD rate (purple text, `#c4b5fd`)
  - **Bottom line:** USD rate (green text, `#86efac`)
- Segment backgrounds use increasing opacity for visual progression

#### Boundary-Aligned Dates

Dates are positioned at exact segment boundaries using **absolute positioning** calculated from day-count ratios:
- P1 start date at 0% (left edge)
- P2 start date at `(P1 days / total days) * 100%`
- P3 start date at `((P1 + P2 days) / total days) * 100%`
- P3 end date at 100% (right edge)

**Date format:** `dd-MMM` (e.g., `04-May`, `02-Jul`, `31-Aug`)

#### Desktop Caption

Single-line layout with phase captions centered under segments and dates absolutely positioned at boundaries:

```
04-May   階段 1 · 59 日   02-Jul   階段 2 · 32 日   03-Aug   階段 3 · 29 日   31-Aug
```

Implementation:
- Phase captions use `flex` with same proportions as bar segments, centered
- Dates use `position: absolute` with `left: X%` and `transform: translateX(-50%)` for centering

#### Mobile Caption

Boundary dates only (no day counts):

```
04-May        02-Jul        03-Aug        31-Aug
```

#### Edit Button

- Pencil icon only (lucide-react `Pencil` icon)
- Positioned in the timeline card header, right-aligned
- Opens the edit overlay on click

#### Edge Cases

- **Total days = 0:** Show empty bar with message "存款日期在所有階段之後"
- **Phase with 0 effective days:** Segment renders with minimal width (`flex: 1`) and muted styling (opacity 0.4)

### 4. EditableSection Component

A reusable compound component for "read-only summary with edit overlay" pattern.

#### API

```tsx
interface EditableSectionProps {
  title: string
  children: React.ReactNode
}

// Compound components:
EditableSection.Summary  // read-only content
EditableSection.Form     // edit form with onConfirm/onCancel
```

**Usage:**
```tsx
<EditableSection title="階段利率">
  <EditableSection.Summary>
    <PhaseRateTimeline phases={inputs.phases} depositDate={inputs.depositDate} />
  </EditableSection.Summary>
  <EditableSection.Form onConfirm={handleConfirm} onCancel={handleCancel}>
    <PhaseRateEditForm phases={inputs.phases} />
  </EditableSection.Form>
</EditableSection>
```

#### Internal Behavior

1. Renders a card container with `title` in header + pencil icon button (right-aligned)
2. Clicking pencil opens overlay:
   - **Mobile (`<lg` breakpoint):** shadcn `Sheet` sliding from bottom, with drag handle
   - **Desktop (`≥lg` breakpoint):** shadcn `Dialog` centered modal with backdrop
3. Uses `useMediaQuery('(min-width: 1024px)')` hook to switch between Sheet and Dialog
4. `Form` component manages draft state:
   - On open: deep-clones current data into local state
   - User edits draft freely
   - **Confirm:** calls `onConfirm(draftData)` → parent applies changes
   - **Cancel:** discards draft, closes overlay
5. Overlay title matches the section title

#### Responsive Switching

Both Sheet and Dialog are radix-based (using existing `radix-ui` dependency), so they share accessibility features:
- Focus trap
- Escape to close
- Scroll lock
- Backdrop click to close

### 5. PhaseRateTimeline Component

#### Props

```tsx
interface PhaseRateTimelineProps {
  phases: PhaseState[]
  depositDate: string
}
```

#### Rendering Logic

1. Compute effective days per phase using `effectiveDays()` logic (same as calculator)
2. Calculate boundary positions as percentages:
   - `boundary[i] = (cumulative days up to phase i / total days) * 100`
3. Render dual-label bar with `flex` proportional to day counts
4. Render phase captions (desktop only) centered under segments
5. Render boundary dates absolutely positioned at calculated percentages

#### Date Formatting

Use `date-fns` `format(date, 'dd-MMM')` for `dd-MMM` format (e.g., `04-May`).

Add helper to `src/lib/format.ts`:
```ts
export function fmtDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'dd-MMM')
}
```

### 6. PhaseRateEditForm Component

#### Props

```tsx
interface PhaseRateEditFormProps {
  phases: PhaseState[]
  onConfirm: (updatedPhases: PhaseState[]) => void
  onCancel: () => void
}
```

#### Rendering

- Same 3-phase form as current implementation
- Each phase has: start date, end date, HKD rate, USD rate
- Manages local draft state internally (cloned from `phases` prop on mount)
- Cancel/Confirm buttons at bottom of form

#### Behavior

- On mount: `useState(() => structuredClone(phases))` for draft
- User edits draft via local setters
- Confirm: `onConfirm(draftPhases)`
- Cancel: `onCancel()` (no data passed)

### 7. New shadcn Components

Add to `src/components/ui/`:

#### `sheet.tsx`

- Radix Dialog styled as bottom sheet
- Slides up from bottom with animation
- Rounded top corners (`rounded-t-xl`)
- Drag handle at top (visual only, not interactive)
- Full-width on mobile

#### `dialog.tsx`

- Radix Dialog as centered modal
- Backdrop overlay
- Centered on screen
- Standard shadcn Dialog pattern

Both use existing `radix-ui` dependency.

### 8. useMediaQuery Hook

Add `src/hooks/useMediaQuery.ts`:

```ts
export function useMediaQuery(query: string): boolean {
  // Uses window.matchMedia
  // Returns true if query matches
  // SSR-safe (returns false on server)
}
```

### 9. Component Tree

```
MarathonSavings (page)
├── HeroMetrics
│   ├── HKD effective rate + deposit date subtitle
│   └── USD effective rate + deposit date subtitle
├── EditableSection (title="階段利率")
│   ├── Summary → PhaseRateTimeline (phases, depositDate)
│   └── Form → PhaseRateEditForm (phases, onConfirm, onCancel)
├── BasicParameters (depositDate, currency, principal + setters)
└── ResultsPanel (totalDays, totalInterest, phaseResults, currency, principal)
```

### 10. Data Flow

- `useInputs()` hook — unchanged, manages all input state
- `useCalculator(inputs)` — unchanged, computes results
- `EditableSection` manages its own open/close + draft state internally
- `onConfirm` from edit form calls `inputs.setPhase*` actions to apply changes
- Hero metrics read from `result.hkdActualRate` / `result.usdActualRate` + `inputs.depositDate`

### 11. Testing

#### Unit Tests

- **`PhaseRateTimeline`**: Test day count calculations, boundary position calculations
- **`EditableSection`**: Test that edit icon opens overlay, confirm applies changes, cancel discards
- **`PhaseRateEditForm`**: Test draft state isolation (edits don't leak until confirm)

#### Existing Tests

- `useMarathonSavings` calculator tests remain unchanged

## Implementation Notes

### Files to Create

- `src/components/EditableSection.tsx`
- `src/components/PhaseRateTimeline.tsx`
- `src/components/PhaseRateEditForm.tsx`
- `src/components/HeroMetrics.tsx`
- `src/components/BasicParameters.tsx`
- `src/components/ResultsPanel.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/dialog.tsx`
- `src/hooks/useMediaQuery.ts`

### Files to Modify

- `src/pages/MarathonSavings.tsx` — restructure layout, use new components
- `src/lib/format.ts` — add `fmtDateShort()` helper

### Dependencies

No new dependencies required. Uses existing:
- `radix-ui` (already in package.json)
- `date-fns` (already in package.json)
- `lucide-react` (already in package.json)

### Accessibility

- Edit icon button has `aria-label="編輯階段利率"`
- Sheet and Dialog inherit radix accessibility (focus trap, escape to close)
- All form fields have associated labels (existing pattern)

### Performance

- Timeline uses `useMemo` for day count calculations
- Edit form draft state is local — no re-renders of parent until confirm
- Media query hook uses `matchMedia` listener — no polling

## Visual Reference

Prototypes are available in `.superpowers/brainstorm/` directory:
- `final-timeline.html` — Timeline with dual labels and boundary dates
- `hero-date.html` — Hero metrics with deposit date subtitle

## Future Considerations

The `EditableSection` component is designed to be reusable. Future pages with "view summary → edit in overlay" patterns can use the same component API.
