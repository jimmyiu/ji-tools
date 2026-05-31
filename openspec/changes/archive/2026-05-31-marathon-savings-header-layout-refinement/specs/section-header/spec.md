## ADDED Requirements

### Requirement: SectionHeader renders title with accent bar
The system SHALL render a section header containing an accent bar, title text, and optional action element.

#### Scenario: Title is displayed
- **WHEN** SectionHeader is rendered with a title prop
- **THEN** the title text is displayed in a flex row with an accent bar to its left

### Requirement: SectionHeader accent bar styling
The accent bar SHALL be a 3px wide, 16px tall div with `bg-muted-foreground/20` background and `rounded-sm` border radius.

#### Scenario: Accent bar dimensions
- **WHEN** SectionHeader renders
- **THEN** the accent bar is 3px wide and 16px tall with rounded corners

### Requirement: SectionHeader optional action slot
The system SHALL render an action element when provided, positioned to the right of the title.

#### Scenario: Action is provided
- **WHEN** SectionHeader is rendered with an action prop containing a button
- **THEN** the button is rendered to the right of the title, pushed by a flex spacer

#### Scenario: Action is not provided
- **WHEN** SectionHeader is rendered without an action prop
- **THEN** no action container is rendered and the title occupies the full width

### Requirement: SectionHeader bottom spacing
The SectionHeader component SHALL include `mb-5` (20px) bottom margin to space the header from card content.

#### Scenario: Header-content spacing
- **WHEN** SectionHeader is placed at the top of a card section
- **THEN** there is 20px of space between the header and the content below it

### Requirement: SectionHeader optional description
The SectionHeader SHALL render an optional description string adjacent to the title when the `description` prop is provided.

#### Scenario: Description is displayed
- **WHEN** SectionHeader is rendered with a description prop
- **THEN** the description text is rendered next to the title in smaller muted text

#### Scenario: Description is absent
- **WHEN** SectionHeader is rendered without a description prop
- **THEN** no description element is rendered
