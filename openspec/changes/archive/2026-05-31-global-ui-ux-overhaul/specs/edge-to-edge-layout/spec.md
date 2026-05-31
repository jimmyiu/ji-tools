## ADDED Requirements

### Requirement: Inner pages use edge-to-edge layout
MarathonSavings, FxDepositCompare, and Settings pages SHALL use a flat layout where content extends to the left and right edges of the viewport without outer horizontal margins from card wrappers. The `px-4` horizontal page container margin SHALL be removed from these pages.

#### Scenario: No horizontal page container margins
- **WHEN** inspecting the outer container of any inner page
- **THEN** the container SHALL NOT have `px-4` or equivalent horizontal margin classes

#### Scenario: Background extends to full viewport width
- **WHEN** the user views any inner page on mobile
- **THEN** the background color SHALL extend to the full width of the screen

#### Scenario: Sections separated by borders and background bands
- **WHEN** the user scrolls through an inner page
- **THEN** sections SHALL be separated by `border-b border-border` lines, with alternating `bg-card` background bands for visual grouping

### Requirement: Consistent inner padding on all sections
All section content SHALL use `p-4` (16px) horizontal and vertical padding, replacing the previous `p-6` (24px) card padding.

#### Scenario: Section content has unified padding
- **WHEN** any section on an inner page renders
- **THEN** its content SHALL have `p-4` padding on all sides

### Requirement: No card wrappers on section containers
Sections SHALL NOT use `bg-card border border-border rounded-xl` card wrappers. The page background acts as the single surface.

#### Scenario: Section containers have no card styling
- **WHEN** the DOM is inspected for any inner page section
- **THEN** no `bg-card border border-border rounded-xl` class combination SHALL appear on section wrapper elements

### Requirement: Homepage retains card layout
The Homepage SHALL remain unchanged with its card-based grid layout.

#### Scenario: Homepage cards unchanged
- **WHEN** the user visits the homepage
- **THEN** cards SHALL display with `bg-card border border-border rounded-xl` as before
