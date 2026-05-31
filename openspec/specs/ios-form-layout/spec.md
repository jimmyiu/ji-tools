## ADDED Requirements

### Requirement: Input component removes native OS appearance
The base `Input` component (`src/components/ui/input.tsx`) SHALL strip native OS chrome from all input types.

#### Scenario: Date input on iOS does not overflow grid container
- **WHEN** an `<input type="date">` rendered via the Input component is placed in a `grid-cols-2` layout on iOS Safari
- **THEN** the input SHALL NOT overflow its grid column or overlap adjacent elements

#### Scenario: Number input on iOS does not overflow grid container
- **WHEN** an `<input type="number">` rendered via the Input component is placed in a constrained flex/grid layout on iOS Safari
- **THEN** the input SHALL NOT overflow its container due to native stepper UI width

#### Scenario: Desktop browsers are unaffected
- **WHEN** an input rendered via the Input component is viewed on a non-iOS browser
- **THEN** the input SHALL render identically to its behavior before `appearance-none` was added (no visual regression)

### Requirement: Defensive CSS reset for date inputs
The global stylesheet (`src/index.css`) SHALL constrain date inputs to not exceed their parent container width, even outside the Input component.

#### Scenario: Date input outside Input component is constrained
- **WHEN** an `<input type="date">` is rendered outside the Input component (direct HTML or third-party)
- **THEN** the input SHALL NOT exceed 100% of its parent container width and SHALL be allowed to shrink below its intrinsic minimum width

### Requirement: Native date picker interaction is preserved
The fix SHALL NOT disable the native date picker that opens on tap/focus of a date input.

#### Scenario: Date picker still opens on tap
- **WHEN** a user taps on an `<input type="date">` rendered via the Input component on iOS
- **THEN** the native iOS date picker SHALL still appear
