## 1. Foundation Utilities

- [x] 1.1 Add `fmtDateShort(dateStr: string): string` to `src/lib/format.ts` that formats `yyyy-MM-dd` to `dd-MMM` using date-fns
- [x] 1.2 Create `src/hooks/useMediaQuery.ts` hook that returns boolean for media query match, SSR-safe (returns false on server), with matchMedia listener for updates

## 2. shadcn UI Primitives

- [x] 2.1 Create `src/components/ui/dialog.tsx` - shadcn Dialog component using radix-ui Dialog primitive, with centered modal layout, backdrop overlay, focus trap, scroll lock, and standard shadcn styling
- [x] 2.2 Create `src/components/ui/sheet.tsx` - shadcn Sheet component using radix-ui Dialog primitive, styled as bottom sheet with slide-in-from-bottom animation, rounded top corners, drag handle visual, full-width on mobile

## 3. EditableSection Compound Component

- [x] 3.1 Create `src/components/EditableSection.tsx` with compound component structure: parent accepts `title` prop and `children`, exposes `EditableSection.Summary` and `EditableSection.Form` sub-components
- [x] 3.2 Implement card container rendering with title in header and Summary content in card body
- [x] 3.3 Add edit trigger: pencil icon button (lucide-react `Pencil`) right-aligned in header with `aria-label="編輯{title}"`, onClick opens overlay
- [x] 3.4 Implement responsive overlay switching using `useMediaQuery('(min-width: 1024px)')` - Sheet for mobile (<1024px), Dialog for desktop (≥1024px)
- [x] 3.5 Implement Form sub-component with draft state management: deep clone data on overlay open using `structuredClone`, local state for edits, no parent mutation until confirm
- [x] 3.6 Add Confirm (確認) and Cancel (取消) buttons to Form overlay, with `onConfirm(draftData)` and `onCancel()` callbacks that close overlay
- [x] 3.7 Handle overlay close behaviors: Escape key and backdrop click discard draft and close (same as Cancel)
- [x] 3.8 Display section title in overlay header matching card header title
- [x] 3.9 Verify accessibility: focus trap within overlay, scroll lock on background page, screen reader announcements

## 4. PhaseRateTimeline Component

- [x] 4.1 Create `src/components/PhaseRateTimeline.tsx` accepting `phases: PhaseState[]` and `depositDate: string` props
- [x] 4.2 Implement effective days calculation per phase using same logic as calculator: overlap between deposit date and phase date range, 0 days if deposit after phase end
- [x] 4.3 Calculate boundary positions as percentages: `boundary[i] = (cumulative days up to phase i / total days) * 100%`, first at 0%, last at 100%
- [x] 4.4 Render dual-label horizontal bar with segments using `flex: N` where N = effective day count, each segment shows HKD rate (top, purple) and USD rate (bottom, green)
- [x] 4.5 Apply increasing background opacity progression across segments
- [x] 4.6 Render boundary-aligned dates using absolute positioning with calculated percentages, format as `dd-MMM` using `fmtDateShort`
- [x] 4.7 Implement responsive captions: desktop (≥1024px) shows "階段 X · N 日" centered under segments using same flex proportions, mobile (<1024px) shows only boundary dates
- [x] 4.8 Handle zero days edge cases: phase with 0 days renders with `flex: 1` and `opacity: 0.4`, all phases 0 days shows empty bar with message "存款日期在所有階段之後"

## 5. Page Component Extraction

- [x] 5.1 Create `src/components/HeroMetrics.tsx` displaying HKD and USD effective annual rates in prominent cards, with "由 dd-MMM 起計" subtitle below each rate using `depositDate` prop
- [x] 5.2 Create `src/components/BasicParameters.tsx` extracting deposit date, currency, and principal input fields from current MarathonSavings page, accepting value props and setter callbacks
- [x] 5.3 Create `src/components/ResultsPanel.tsx` extracting total deposit days, total interest, and per-phase interest breakdown display, accepting result data and currency props
- [x] 5.4 Create `src/components/PhaseRateEditForm.tsx` with 3-phase edit form (start date, end date, HKD rate, USD rate per phase), managing local draft state, with Confirm/Cancel buttons calling `onConfirm(updatedPhases)` and `onCancel()`

## 6. Page Integration and Layout Refactor

- [x] 6.1 Refactor `src/pages/MarathonSavings.tsx` to use new component structure: import HeroMetrics, EditableSection, PhaseRateTimeline, PhaseRateEditForm, BasicParameters, ResultsPanel
- [x] 6.2 Implement value-first layout order: Hero Metrics → EditableSection (with Timeline summary and EditForm) → Basic Parameters → Results Panel
- [x] 6.3 Wire EditableSection with PhaseRateTimeline as Summary content and PhaseRateEditForm as Form content, passing phases state and setters
- [x] 6.4 Implement onConfirm handler in page to update phases state when edit form confirms
- [x] 6.5 Maintain existing 2-column grid layout for desktop (lg:grid-cols-2) with left column containing Hero/Timeline/Params and right column containing Results
- [x] 6.6 Verify all existing functionality preserved: useInputs hook usage, useCalculator hook, currency switching, principal input, all result displays

## 7. Testing

- [x] 7.1 Add unit tests for `fmtDateShort` utility function with various date inputs
- [x] 7.2 Add unit tests for `useMediaQuery` hook with mocked matchMedia
- [x] 7.3 Add unit tests for PhaseRateTimeline: effective days calculation, boundary position calculation, zero days edge cases
- [x] 7.4 Add unit tests for EditableSection: compound component rendering, edit icon click opens overlay, confirm applies changes, cancel discards changes, Escape/backdrop close behavior
- [x] 7.5 Add unit tests for PhaseRateEditForm: draft state isolation (edits don't leak until confirm), confirm passes updated data, cancel discards
- [x] 7.6 Verify existing useMarathonSavings calculator tests still pass without modification

## 8. Verification and Polish

- [x] 8.1 Test responsive behavior: verify Sheet opens on mobile viewport (<1024px), Dialog opens on desktop viewport (≥1024px)
- [x] 8.2 Test accessibility: keyboard navigation (Tab focus trap in overlay), Escape closes overlay, aria-labels present, screen reader announcements
- [x] 8.3 Test edge cases: deposit date after all phases (zero days message), phase with zero effective days (muted styling), extreme day count ratios (date overlap acceptable)
- [x] 8.4 Verify visual design matches brainstorm prototypes: dual-label bar colors (purple HKD, green USD), boundary date positioning, responsive caption behavior
- [x] 8.5 Run full test suite and fix any failures
- [x] 8.6 Run linter and fix any warnings/errors
