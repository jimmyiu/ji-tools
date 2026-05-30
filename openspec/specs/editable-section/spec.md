## ADDED Requirements

### Requirement: Compound Component API

`EditableSection` SHALL be a compound component exposing `EditableSection.Summary` and `EditableSection.Form` sub-components. The parent component SHALL accept a `title` prop (string) and `children` (ReactNode).

#### Scenario: Correct compound usage
- **WHEN** a consumer renders `<EditableSection title="階段利率">` with `<EditableSection.Summary>` and `<EditableSection.Form>` children
- **THEN** the component SHALL render a card container with the title in the header and the Summary content in the card body

#### Scenario: Missing Summary child
- **WHEN** a consumer renders `<EditableSection>` without an `<EditableSection.Summary>` child
- **THEN** the component SHALL render an empty card body with no errors

---

### Requirement: Edit Trigger

The card header SHALL display a pencil icon button (lucide-react `Pencil`) right-aligned next to the title. The button SHALL have `aria-label="編輯{title}"` (e.g., `aria-label="編輯階段利率"`). Clicking the button SHALL open the edit overlay.

#### Scenario: Edit icon click opens overlay
- **WHEN** the user clicks the pencil icon button
- **THEN** the edit overlay SHALL open with the Form content

#### Scenario: Edit icon accessibility
- **WHEN** the component renders
- **THEN** the pencil button SHALL have `aria-label` containing the section title

---

### Requirement: Responsive Overlay Switching

The edit overlay SHALL use shadcn `Sheet` (bottom sheet) on viewports below 1024px and shadcn `Dialog` (centered modal) on viewports at or above 1024px. The switching SHALL be determined by `useMediaQuery('(min-width: 1024px)')`.

#### Scenario: Mobile viewport opens Sheet
- **WHEN** the viewport width is below 1024px and the user clicks the edit button
- **THEN** a Sheet SHALL slide up from the bottom of the screen

#### Scenario: Desktop viewport opens Dialog
- **WHEN** the viewport width is 1024px or above and the user clicks the edit button
- **THEN** a Dialog SHALL appear centered on screen with a backdrop overlay

#### Scenario: SSR fallback
- **WHEN** the component renders on the server (no `window` object)
- **THEN** `useMediaQuery` SHALL return `false` (mobile behavior)

---

### Requirement: Draft State Management

`EditableSection.Form` SHALL manage a local draft state. On overlay open, the draft SHALL be initialized as a deep clone of the current data. User edits SHALL only modify the draft. The original data SHALL NOT be modified until the user confirms.

#### Scenario: Draft initialized on open
- **WHEN** the edit overlay opens
- **THEN** the Form SHALL create a deep clone of the current data as the draft state

#### Scenario: Edits do not leak before confirm
- **WHEN** the user modifies fields in the edit form
- **THEN** the parent component's data SHALL remain unchanged

---

### Requirement: Confirm and Cancel Actions

The Form SHALL accept `onConfirm` and `onCancel` callback props. The overlay SHALL display Confirm (確認) and Cancel (取消) buttons. Clicking Confirm SHALL call `onConfirm(draftData)` and close the overlay. Clicking Cancel SHALL call `onCancel()` and close the overlay, discarding the draft.

#### Scenario: Confirm applies changes
- **WHEN** the user clicks the Confirm button
- **THEN** `onConfirm` SHALL be called with the current draft data and the overlay SHALL close

#### Scenario: Cancel discards changes
- **WHEN** the user clicks the Cancel button
- **THEN** `onCancel` SHALL be called, the draft SHALL be discarded, and the overlay SHALL close

#### Scenario: Escape key closes overlay
- **WHEN** the overlay is open and the user presses Escape
- **THEN** the overlay SHALL close and the draft SHALL be discarded (same as Cancel)

#### Scenario: Backdrop click closes overlay
- **WHEN** the overlay is open and the user clicks the backdrop
- **THEN** the overlay SHALL close and the draft SHALL be discarded (same as Cancel)

---

### Requirement: Overlay Title

The overlay SHALL display the section `title` in its header, matching the card header title.

#### Scenario: Overlay header matches section title
- **WHEN** the edit overlay opens for a section with title "階段利率"
- **THEN** the overlay header SHALL display "階段利率"

---

### Requirement: Accessibility

The overlay SHALL inherit radix-ui Dialog accessibility features: focus trap, scroll lock, and screen reader announcements. Focus SHALL be trapped within the overlay while open. Page scroll SHALL be locked while the overlay is open.

#### Scenario: Focus trap
- **WHEN** the overlay is open and the user presses Tab
- **THEN** focus SHALL cycle within the overlay content and SHALL NOT move to background elements

#### Scenario: Scroll lock
- **WHEN** the overlay is open
- **THEN** the background page SHALL NOT be scrollable
