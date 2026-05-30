# responsive-navigation Specification

## Purpose

Defines a responsive navigation system that provides optimal UX at both mobile and desktop viewports: a floating bottom capsule on mobile (<1024px) and a vertical sidebar on desktop (≥1024px). Centralizes breakpoints into a shared module and manages layout offsets via CSS custom properties for flicker-free responsive adaptation.

## Requirements

### Requirement: Navigation SHALL display as a floating capsule on mobile viewports

On viewports narrower than 1024px, the application SHALL render navigation as a floating capsule fixed to the bottom of the screen. The capsule SHALL be centered horizontally with `max-w-[280px]`, have a height of 64px, border-radius of `rounded-2xl`, and sit above all content with `z-40`. The capsule SHALL NOT extend edge-to-edge; it SHALL use `left: 16px; right: 16px` with `mx-auto`. Safe area SHALL be handled via `bottom: calc(24px + env(safe-area-inset-bottom))` — a single CSS property with no double-counting of offsets. The capsule SHALL use a glass effect with semi-transparent background (`bg-card/80`), backdrop blur (`backdrop-blur-xl`), a subtle top border (`border-t border-white/10`), and an upward drop shadow (`shadow-[0_-4px_12px_0_rgba(0,0,0,0.3)]`) to create visual separation from scrollable content.

#### Scenario: Capsule renders on mobile viewport
- **WHEN** viewport width is less than 1024px
- **THEN** a floating capsule navigation SHALL be visible at the bottom of the screen
- **THEN** the capsule SHALL be centered with max-width 280px, height 64px, rounded-2xl, glass effect (semi-transparent bg + backdrop blur), top border, and upward shadow

#### Scenario: Capsule safe area handling
- **WHEN** the device has a home indicator (safe-area-inset-bottom > 0)
- **THEN** the capsule SHALL be positioned `calc(24px + env(safe-area-inset-bottom))` from the bottom of the viewport
- **THEN** NO separate margin-bottom or padding-bottom SHALL be applied to the capsule for safe area

#### Scenario: Capsule is hidden on desktop viewport
- **WHEN** viewport width is 1024px or greater
- **THEN** the capsule navigation SHALL NOT be rendered in the DOM (hidden via `desktop-nav:hidden`)

---

### Requirement: Navigation SHALL display as a sidebar on desktop viewports

On viewports 1024px or wider, the application SHALL render navigation as a vertical sidebar fixed to the left edge. The sidebar SHALL be 80px wide, full viewport height, with `z-40`. Home (首頁) SHALL be at the top and Settings (設定) SHALL be pinned to the bottom. The sidebar background SHALL use the `bg-muted` CSS token (not hardcoded hex values). Safe areas SHALL be applied: `padding-top: env(safe-area-inset-top)`, `padding-bottom: env(safe-area-inset-bottom)`, `padding-left: env(safe-area-inset-left)`.

#### Scenario: Sidebar renders on desktop viewport
- **WHEN** viewport width is 1024px or greater
- **THEN** a vertical sidebar SHALL be visible on the left edge, 80px wide, full height
- **THEN** Home tab SHALL be at the top and Settings tab SHALL be at the bottom

#### Scenario: Sidebar is hidden on mobile viewport
- **WHEN** viewport width is less than 1024px
- **THEN** the sidebar SHALL NOT be rendered in the DOM (hidden via CSS)

#### Scenario: Sidebar safe area handling
- **WHEN** the device has notch or home indicator safe areas
- **THEN** the sidebar SHALL respect `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, and `env(safe-area-inset-left)`

---

### Requirement: Active navigation state SHALL highlight the current route

The active route logic SHALL match `location.pathname === '/'` for Home and `location.pathname === '/settings'` for Settings. Calculator pages SHALL NOT mark either tab as active.

**SideNav (desktop sidebar):** The active item SHALL use `bg-primary/15 rounded-xl text-primary` styling. Inactive items SHALL use `text-muted-foreground` styling with `hover:text-foreground` on hover.

**TabBar (mobile capsule):** Active state SHALL be indicated purely through icon and text styling — the icon uses `fill="currentColor"` (solid) with `text-primary`, and there is no background highlight.

#### Scenario: SideNav Home tab is active on root path
- **WHEN** `location.pathname` is "/"
- **THEN** the SideNav Home tab SHALL render with `bg-primary/15 rounded-xl text-primary`

#### Scenario: SideNav Settings tab is active on settings path
- **WHEN** `location.pathname` is "/settings"
- **THEN** the SideNav Settings tab SHALL render with `bg-primary/15 rounded-xl text-primary`

#### Scenario: Neither tab is active on calculator pages
- **WHEN** `location.pathname` is "/fx-deposit-compare" or "/marathon-savings"
- **THEN** neither SideNav nor TabBar tab SHALL have the active styling

---

### Requirement: Layout offsets SHALL be managed via CSS custom properties

The application SHALL define two CSS custom properties that swap at the 1024px breakpoint: `--nav-bottom-offset` and `--nav-left-offset`. Mobile default: `--nav-bottom-offset: calc(104px + env(safe-area-inset-bottom))` (64px capsule height + 16px spacing + 24px bottom offset + safe area) and `--nav-left-offset: 0px`. Desktop override: `--nav-bottom-offset: 0px` and `--nav-left-offset: 80px`. The `<main>` element SHALL use `paddingBottom: var(--nav-bottom-offset)` and `paddingLeft: var(--nav-left-offset)`. The outer `<header>` element SHALL use `paddingLeft: var(--nav-left-offset)` on desktop. A `transition-[padding] duration-150 ease-out` SHALL be applied to `<main>` only (NOT the header which has JS-driven scroll animation).

#### Scenario: Mobile layout offset values
- **WHEN** viewport width is less than 1024px
- **THEN** `--nav-bottom-offset` SHALL be `calc(104px + env(safe-area-inset-bottom))`
- **THEN** `--nav-left-offset` SHALL be `0px`

#### Scenario: Desktop layout offset values
- **WHEN** viewport width is 1024px or greater
- **THEN** `--nav-bottom-offset` SHALL be `0px`
- **THEN** `--nav-left-offset` SHALL be `80px`

#### Scenario: Main element uses CSS custom properties for padding
- **WHEN** the Layout renders
- **THEN** the `<main>` element SHALL have `paddingBottom` set to `var(--nav-bottom-offset)` and `paddingLeft` set to `var(--nav-left-offset)`

#### Scenario: Header uses left offset on desktop
- **WHEN** viewport width is 1024px or greater
- **THEN** the outer `<header>` element SHALL have `paddingLeft: var(--nav-left-offset)` (80px), preserving the inner container's `px-4` padding

#### Scenario: Smooth padding transition on breakpoint resize
- **WHEN** the viewport crosses the 1024px breakpoint
- **THEN** the `<main>` element SHALL transition its padding over 150ms ease-out
- **THEN** the header SHALL NOT have a CSS transition on padding (conflicts with JS scroll animation)

---

### Requirement: Breakpoint system SHALL be centralized

The application SHALL provide `src/lib/breakpoints.ts` exporting `DESKTOP_NAV_PX = 1024`, `SIDE_NAV_WIDTH = 80`, and a `useIsDesktopNav()` hook that returns a boolean based on `window.matchMedia('(min-width: 1024px)')`. The hook SHALL handle SSR by returning `false` when `window` is undefined. The hook SHALL listen for media query changes and update reactively. The `src/index.css` SHALL define `@custom-variant desktop-nav` at `--breakpoint-desktop-nav: 1024px` and the `@theme inline` block SHALL include `--breakpoint-desktop-nav: 1024px`.

#### Scenario: Hook returns false on mobile viewport
- **WHEN** `useIsDesktopNav()` is called and viewport width is less than 1024px
- **THEN** it SHALL return `false`

#### Scenario: Hook returns true on desktop viewport
- **WHEN** `useIsDesktopNav()` is called and viewport width is 1024px or greater
- **THEN** it SHALL return `true`

#### Scenario: Hook handles SSR
- **WHEN** `useIsDesktopNav()` is called during server-side rendering (no `window`)
- **THEN** it SHALL return `false`

#### Scenario: CSS custom variant is available
- **WHEN** a component uses `desktop-nav:` Tailwind prefix
- **THEN** the styles SHALL apply only at viewport width 1024px or greater

---

### Requirement: Skip-to-content link SHALL be provided for accessibility

The Layout component SHALL render a skip-to-content link as the first focusable element. The link SHALL be visually hidden (`sr-only`) by default and become visible on focus (`focus:not-sr-only`). The link text SHALL be "跳到主內容" and its `href` SHALL be `#main-content`. The `<main>` element SHALL have `id="main-content"`.

#### Scenario: Skip link is hidden by default
- **WHEN** the page loads
- **THEN** the skip link SHALL not be visible

#### Scenario: Skip link appears on focus
- **WHEN** the user presses Tab and the skip link receives focus
- **THEN** the skip link SHALL become visible and display "跳到主內容"

#### Scenario: Skip link navigates to main content
- **WHEN** the user activates the skip link
- **THEN** focus SHALL move to the element with `id="main-content"`

---

### Requirement: Navigation components SHALL use differentiated ARIA labels

The sidebar SHALL use `<nav aria-label="主導航">`. The mobile capsule SHALL use `<nav aria-label="底部導航">`. The two labels SHALL be different to avoid confusion for screen reader users.

#### Scenario: Sidebar has correct aria-label
- **WHEN** the sidebar is rendered
- **THEN** it SHALL have `aria-label="主導航"`

#### Scenario: Capsule has correct aria-label
- **WHEN** the mobile capsule is rendered
- **THEN** it SHALL have `aria-label="底部導航"`

---

### Requirement: Print styles SHALL hide navigation and zero offsets

When printing, navigation elements (`nav`) and banners (`[role="alert"]`) SHALL be hidden via `display: none !important`. The CSS custom properties `--nav-left-offset` and `--nav-bottom-offset` SHALL be set to `0 !important`.

#### Scenario: Navigation hidden in print
- **WHEN** the page is printed
- **THEN** all `<nav>` elements SHALL have `display: none`
- **THEN** all `[role="alert"]` elements SHALL have `display: none`

#### Scenario: Offsets zeroed in print
- **WHEN** the page is printed
- **THEN** `--nav-left-offset` SHALL be `0`
- **THEN** `--nav-bottom-offset` SHALL be `0`
