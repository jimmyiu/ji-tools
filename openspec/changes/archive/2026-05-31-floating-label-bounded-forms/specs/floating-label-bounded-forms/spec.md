## ADDED Requirements

### Requirement: InputField renders bounded box with floating label
The InputField SHALL render as a bounded box with `bg-input/30` background, `border-border` border, and `rounded-lg`. The label SHALL display inside the box at the top in `text-[10px] text-muted-foreground`. The value SHALL display below the label in `text-base font-semibold text-foreground`. The component SHALL accept optional `prefix` and `suffix` elements rendered inline with the input, separated by `gap-1`. The inner `<input type="number">` SHALL have no border, outline, or padding. Number spinner arrows SHALL be hidden via `[appearance:textfield]` and `[&::-webkit-inner-spin-button]:appearance-none`.

#### Scenario: Rest state
- **WHEN** InputField renders with default props
- **THEN** the box SHALL have `bg-input/30` background, `border-border` border
- **AND** the label SHALL be `text-muted-foreground`
- **AND** the value SHALL be `text-foreground`

#### Scenario: Hover state
- **WHEN** user hovers over the box
- **THEN** the box background SHALL deepen to `bg-input/40`

#### Scenario: Focus state
- **WHEN** user focuses the input
- **THEN** the box border SHALL change to `border-ring` with `ring-2 ring-ring/40 ring-offset-0`
- **AND** the label SHALL remain `text-muted-foreground`

#### Scenario: Error state
- **WHEN** the `error` prop is provided
- **THEN** the label SHALL be `text-destructive`
- **AND** the box border SHALL be `border-destructive` with `ring-2 ring-destructive/40`
- **AND** an error message SHALL appear below the box in `text-xs text-destructive`

#### Scenario: Prefix rendered
- **WHEN** the `prefix` prop is provided
- **THEN** the prefix SHALL render left of the input with `shrink-0` to prevent collapse

#### Scenario: Suffix rendered
- **WHEN** the `suffix` prop is provided
- **THEN** the suffix SHALL render right of the input with `shrink-0` to prevent collapse

### Requirement: DateField renders bounded box with native date input
The DateField SHALL render as a bounded box with the same base styling as InputField (rest, hover, focus states). The `<input type="date">` SHALL have `[color-scheme:dark]` for calendar icon contrast. The input SHALL be transparent with no border or outline.

#### Scenario: DateField rest state
- **WHEN** DateField renders
- **THEN** the box SHALL have the same rest styling as InputField

#### Scenario: DateInput renders with dark color-scheme
- **WHEN** DateField renders
- **THEN** the `<input type="date">` SHALL have `[color-scheme:dark]`

### Requirement: SelectField renders bounded box with restyled shadcn trigger
The SelectField SHALL render as a bounded box. The shadcn `SelectTrigger` SHALL have all default border, background, shadow, and padding stripped. The chevron icon SHALL be `text-muted-foreground/50` with `ml-auto` for right alignment. The outer box SHALL carry the border, hover background, and focus ring. Focus SHALL use `has-[button:focus-visible]` selector.

#### Scenario: SelectField rest state
- **WHEN** SelectField renders
- **THEN** the outer div SHALL have the same rest styling as InputField

#### Scenario: SelectTrigger has no default styling
- **WHEN** SelectField renders
- **THEN** the SelectTrigger SHALL have `border-none bg-transparent shadow-none p-0`

#### Scenario: Focus ring on trigger
- **WHEN** the SelectTrigger receives focus
- **THEN** the outer box SHALL show `border-ring` with `ring-2 ring-ring/40`

### Requirement: ReadonlyDateField renders simplified dim box
The ReadonlyDateField SHALL render a bounded box with `border-border/50` and dimmer colors. No hover or focus states SHALL exist. No lock icon SHALL render. The label SHALL be `text-muted-foreground/50`, value SHALL be `text-muted-foreground/50`.

#### Scenario: ReadonlyDateField renders dim
- **WHEN** ReadonlyDateField renders
- **THEN** the box SHALL have `border-border/50`
- **AND** the label SHALL be `text-muted-foreground/50`
- **AND** the value SHALL be `text-muted-foreground/50`

#### Scenario: No interactive states
- **WHEN** ReadonlyDateField renders
- **THEN** the box SHALL have no `hover:` or `focus-within:` classes

### Requirement: FxDepositCompare pairs related rate fields
The FxDepositCompare page SHALL render HKD and USD rate fields in a 2-column grid, and sell/buy rate fields in a separate 2-column grid. Each grid SHALL use `grid grid-cols-2 gap-3`.

#### Scenario: HKD/USD rates in 2-column grid
- **WHEN** FxDepositCompare renders rate fields
- **THEN** HKD rate and USD rate InputFields SHALL be in a `grid grid-cols-2 gap-3` container

#### Scenario: Sell/buy rates in 2-column grid
- **WHEN** FxDepositCompare renders rate fields
- **THEN** sell rate and buy rate InputFields SHALL be in a `grid grid-cols-2 gap-3` container
