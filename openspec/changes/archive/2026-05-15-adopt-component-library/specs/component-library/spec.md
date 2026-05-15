## ADDED Requirements

### Requirement: shadcn/ui Integration

The system SHALL integrate shadcn/ui as the component library, initialized via the official shadcn CLI (`npx shadcn@latest init`). The generated configuration SHALL be compatible with Tailwind CSS v4's CSS-first configuration approach (no `tailwind.config.js` file).

#### Scenario: shadcn/ui initialization completes successfully
- **WHEN** `npx shadcn@latest init` is executed
- **THEN** a `src/components/ui/` directory SHALL be created with the library's utility file (`utils.ts`), CSS variables SHALL be added to `index.css`, and the project SHALL compile and run without errors

#### Scenario: Tailwind v4 CSS-first configuration is preserved
- **WHEN** shadcn/ui is initialized
- **THEN** no `tailwind.config.js` or `tailwind.config.ts` file SHALL be created, and all theme extensions SHALL be defined via Tailwind v4's `@theme` directive in CSS

---

### Requirement: InputField Replacement

The system SHALL replace all custom `InputField` components (currently duplicated in `FxDepositCompare.tsx` and `MarathonSavings.tsx`) with shadcn/ui `Input` + `Label` components. The new components SHALL be defined once in `src/components/ui/` and imported by both page components.

#### Scenario: Number input retains current behavior
- **WHEN** a user interacts with a number input field rendered via the shadcn/ui Input component
- **THEN** the input SHALL accept numeric values, display the suffix text, show the label, and function identically to the current custom InputField

#### Scenario: Input styling matches current dark theme
- **WHEN** an Input component is rendered
- **THEN** it SHALL use the centralized design token colors (not hardcoded hex values) and maintain visual consistency with the current dark theme

#### Scenario: Duplicated component code is eliminated
- **WHEN** the InputField replacement is complete
- **THEN** there SHALL be no duplicated InputField definitions across page files; all pages SHALL import from `src/components/ui/`

---

### Requirement: DateField and ReadonlyDateField Replacement

The system SHALL replace custom `DateField` and `ReadonlyDateField` components with shadcn/ui `Input` (type=date) and `Label` components. ReadonlyDateField SHALL use the shadcn/ui Input with `disabled` and `readOnly` props plus a lock icon from Lucide.

#### Scenario: Date input retains current behavior
- **WHEN** a user interacts with a date input field
- **THEN** the date picker SHALL function identically to the current custom DateField, with the same label display and value handling

#### Scenario: Readonly date field shows lock icon
- **WHEN** a readonly date field is rendered
- **THEN** it SHALL display a lock icon (from Lucide) next to the date value, matching the current visual behavior of the custom ReadonlyDateField

---

### Requirement: SelectField Replacement

The system SHALL replace custom `SelectField` components with shadcn/ui `Select` component. The Select SHALL display a label, placeholder, and list of selectable options with proper ARIA attributes and keyboard navigation.

#### Scenario: Select dropdown retains current behavior
- **WHEN** a user opens and selects an option from the Select component
- **THEN** it SHALL display the selected value, update the form state, and function identically to the current custom SelectField

#### Scenario: Select is keyboard navigable
- **WHEN** a user presses Tab to focus the Select, then presses Enter/Space to open it, then uses arrow keys
- **THEN** the Select SHALL respond to keyboard navigation, opening, selecting, and closing per WAI-ARIA combobox patterns

---

### Requirement: TabBar Replacement

The system SHALL replace the custom `TabBar` component with shadcn/ui `Tabs` component. The new tabs SHALL display the same navigation items (Home, FX Deposit, Marathon, Settings) with Lucide icons replacing the current inline SVGs.

#### Scenario: Tab navigation retains current routes
- **WHEN** a user taps a tab in the shadcn/ui Tabs component
- **THEN** it SHALL navigate to the corresponding route (/, /fx-deposit-compare, /marathon-savings, /settings) identically to the current TabBar

#### Scenario: Active tab state reflects current route
- **WHEN** the user navigates to any page
- **THEN** the corresponding tab SHALL display the active state styling, matching the current TabBar's active indicator behavior

#### Scenario: Tab icons use Lucide instead of inline SVG
- **WHEN** tabs are rendered
- **THEN** icons SHALL be imported from `lucide-react` (Home, Calculator, TrendingUp, Settings icons) instead of inline SVG paths

---

### Requirement: InstallBanner Refactor

The system SHALL refactor the custom `InstallBanner` component to use shadcn/ui `Card` or `Alert` as the container, with Lucide icons replacing inline SVGs (close button, share icon).

#### Scenario: Install banner retains current behavior
- **WHEN** the PWA install banner is displayed
- **THEN** it SHALL show the install prompt, dismiss button (with Lucide X icon), and share button (with Lucide Share icon), functioning identically to the current InstallBanner

#### Scenario: Banner styling uses design tokens
- **WHEN** the InstallBanner is rendered
- **THEN** it SHALL use centralized CSS variable colors instead of hardcoded hex values for background, text, and border

---

### Requirement: Lucide Icon Integration

The system SHALL use Lucide React as the icon library. All inline SVGs currently in TabBar, InstallBanner, and page components SHALL be replaced with Lucide icon imports.

#### Scenario: Icons are tree-shaken
- **WHEN** the application is built for production
- **THEN** only the Lucide icons actually imported SHALL be included in the bundle; unused icons SHALL NOT be bundled

#### Scenario: Icon sizing is consistent
- **WHEN** Lucide icons are rendered throughout the app
- **THEN** they SHALL use a consistent size (defaulting to 20px or the size of current inline SVGs) via the `size` prop

---

### Requirement: Form Validation with react-hook-form and zod

The system SHALL integrate react-hook-form for form state management and zod for schema validation. Form components in FxDepositCompare and MarathonSavings SHALL use react-hook-form's `useForm` hook and zod's `z.object()` schemas for type-safe validation.

#### Scenario: Form validation shows errors
- **WHEN** a user submits a form with invalid data (e.g., negative amount, past date when not allowed)
- **THEN** the form SHALL display validation error messages near the relevant fields, replacing the current manual validation logic

#### Scenario: Form submission flows remain unchanged
- **WHEN** a user submits a form with valid data
- **THEN** the form SHALL trigger the same calculation and state update logic as the current implementation; no behavioral change for valid submissions