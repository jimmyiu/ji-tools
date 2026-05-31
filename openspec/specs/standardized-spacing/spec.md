# standardized-spacing Specification

## Purpose
TBD - created by archiving change global-ui-ux-overhaul. Update Purpose after archive.
## Requirements
### Requirement: Standardized section-header spacing
The SectionHeader component SHALL use `mb-3` (12px) spacing between the header bar and its content, replacing `mb-5` (20px).

#### Scenario: Section header has 12px bottom margin
- **WHEN** any SectionHeader renders
- **THEN** it SHALL have `12px` margin-bottom between the header and the content below it

### Requirement: Standardized grid spacing on inner pages
Inner page layouts SHALL use `gap-3` (12px) for the main 2-column grid and `gap-2` (8px) for inner 2-column form grids.

#### Scenario: Two-column page grid uses gap-3
- **WHEN** the main layout grid on an inner page renders
- **THEN** it SHALL use `gap-3` between columns

#### Scenario: Two-column form grid uses gap-2
- **WHEN** a 2-column form field grid renders inside a section
- **THEN** it SHALL use `gap-2` between columns

### Requirement: Standardized intro paragraph spacing
The introductory description paragraph on inner pages SHALL use `mb-4` (16px) bottom margin, replacing `mb-8` (32px).

#### Scenario: Intro paragraph uses mb-4
- **WHEN** an inner page renders its introductory paragraph
- **THEN** the paragraph SHALL have `mb-4` bottom margin

### Requirement: Standardized phase row padding
Phase rate timeline row containers SHALL use `p-2` (8px) padding, replacing `p-3` (12px).

#### Scenario: Phase row uses p-2
- **WHEN** a phase rate row renders
- **THEN** it SHALL have `p-2` padding

### Requirement: Uniform input class structure across all field types
SelectField, DateField, InputField, and ReadonlyDateField SHALL use identical CSS class structure: `p-3` outer box, `text-[10px]` label, `text-base font-semibold` value typography with `mt-0.5` label-to-value gap.

#### Scenario: Select and Date fields have matching class structure
- **WHEN** inspecting a SelectField and DateField
- **THEN** both SHALL render with `p-3` outer box, `text-[10px]` label, `text-base font-semibold` value

#### Scenario: Input and Date fields have matching class structure
- **WHEN** inspecting an InputField and DateField
- **THEN** both SHALL render with `p-3` outer box, `text-[10px]` label, `text-base font-semibold` value

#### Scenario: ReadonlyDateField matches editable fields
- **WHEN** inspecting a ReadonlyDateField next to an editable field
- **THEN** it SHALL render with the same `p-3` outer box, `text-[10px]` label, `text-base font-semibold` value structure

### Requirement: All field types use identical internal padding structure
All form fields SHALL use `p-3` (12px) outer padding, `text-[10px]` label, and `text-base font-semibold` value typography with `mt-0.5` label-to-value gap.

#### Scenario: Label and value typography consistent
- **WHEN** inspecting any form field type
- **THEN** the label SHALL be `text-[10px]` and the value SHALL be `text-base font-semibold`

#### Scenario: SelectField trigger matches natural height
- **WHEN** inspecting the SelectField trigger element
- **THEN** its height SHALL match other field types via consistent padding, not `h-auto`

