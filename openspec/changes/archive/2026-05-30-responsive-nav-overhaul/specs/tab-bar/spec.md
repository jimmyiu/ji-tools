## MODIFIED Requirements

### Requirement: TabBar SHALL display as a floating capsule on mobile and be hidden on desktop

The TabBar SHALL display exactly 2 navigation items (Home 首頁 and Settings 設定) as a floating capsule on viewports narrower than 1024px. The capsule SHALL be `position: fixed; bottom: calc(24px + env(safe-area-inset-bottom)); left: 16px; right: 16px` with `max-w-[280px] mx-auto`, `height: 64px`, `rounded-2xl`, and `z-40`. The capsule SHALL use a glass effect with `bg-card/80` (semi-transparent card background) and `backdrop-blur-xl` to create depth. A crisp top border `border-t border-white/10` SHALL separate the capsule from scrollable content. An upward drop shadow `shadow-[0_-4px_12px_0_rgba(0,0,0,0.3)]` SHALL visually lift the capsule off the base layer. On desktop (≥1024px), the TabBar SHALL be hidden via `desktop-nav:hidden`. The TabBar SHALL have `<nav aria-label="底部導航">`. The `TAB_BAR_HEIGHT` constant SHALL be 64 (was 56).

Each tab SHALL be rendered as a plain `<button>` element (not a shadcn TabsTrigger) with `role="tab"` and `aria-selected`. Tab buttons SHALL be perfectly centered both vertically and horizontally using `flex-1 flex flex-col items-center justify-center` with `gap-1` (4px gap between icon and label). Tab buttons SHALL have `px-0 py-0` — centering is achieved via flexbox, not padding. Each icon SHALL be 22px (`size-[22px]`). Each label SHALL use `text-xs leading-none` (12px).

Active state SHALL be indicated purely through icon and text styling (no background highlight). The active icon SHALL use `fill="currentColor"` (solid/filled appearance) and the active icon+text SHALL use `text-primary`. Inactive icon SHALL use `fill="none"` (standard outlined appearance) and inactive icon+text SHALL use `text-muted-foreground`.

#### Scenario: TabBar renders as floating glass capsule on mobile
- **WHEN** the TabBar is rendered and viewport width is less than 1024px
- **THEN** it SHALL be a fixed-position capsule centered at the bottom with max-width 280px, height 64px, rounded corners, glass effect (semi-transparent bg + backdrop blur), top border, and upward shadow

#### Scenario: TabBar hidden on desktop
- **WHEN** viewport width is 1024px or greater
- **THEN** the TabBar SHALL NOT be visible (hidden via `desktop-nav:hidden`)

#### Scenario: TabBar has correct aria-label
- **WHEN** the TabBar is rendered
- **THEN** it SHALL have `aria-label="底部導航"`

#### Scenario: Tab bar capsule height constant updated
- **WHEN** code references `TAB_BAR_HEIGHT`
- **THEN** it SHALL equal `64`

#### Scenario: Active tab uses icon fill and primary color
- **WHEN** a tab is active
- **THEN** the icon SHALL use `fill="currentColor"` (solid appearance)
- **THEN** the icon and label SHALL use `text-primary`
- **THEN** there SHALL be no background highlight on the active tab

#### Scenario: Inactive tab uses outlined icon and muted color
- **WHEN** a tab is inactive
- **THEN** the icon SHALL use `fill="none"` (outlined appearance)
- **THEN** the icon and label SHALL use `text-muted-foreground`

#### Scenario: Tab buttons are perfectly centered
- **WHEN** a tab button renders
- **THEN** the icon and label SHALL be centered both vertically and horizontally within the button using flexbox centering (not padding)

#### Scenario: Tab buttons have no horizontal line indicator
- **WHEN** a tab button is active
- **THEN** there SHALL be no `::after` pseudo-element or horizontal line indicator below the active tab

#### Scenario: TabBar has visual separation from scrollable content
- **WHEN** the TabBar renders
- **THEN** the capsule SHALL have a semi-transparent background (`bg-card/80`) with backdrop blur (`backdrop-blur-xl`), a top border (`border-t border-white/10`), and an upward drop shadow

## REMOVED Requirements

### Requirement: TabBar SHALL display exactly 2 navigation items

**Reason**: Replaced by the more specific floating capsule requirement above that includes responsive behavior, styling, and ARIA details.

**Migration**: Use the new "TabBar SHALL display as a floating capsule on mobile" requirement which subsumes this one.

---

### Requirement: TabBar active tab logic SHALL match exactly 2 routes

**Reason**: The active tab logic is unchanged but is now defined in the `responsive-navigation` spec under "Active navigation state SHALL highlight the current route" which covers both TabBar and SideNav.

**Migration**: Use the navigation active state requirement in `responsive-navigation/spec.md`.
