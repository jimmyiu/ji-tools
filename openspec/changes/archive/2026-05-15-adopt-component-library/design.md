## Context

The app is a mobile-first PWA (React 19 + Tailwind CSS v4 + Vite) for foreign deposit rate comparison and marathon savings calculations. Currently, all UI components are hand-crafted with hardcoded Tailwind arbitrary values for colors and no accessibility primitives. The codebase has 7 custom UI components, with form components duplicated across page files.

After evaluating 6 component libraries (shadcn/ui, Mantine, Radix UI, Headless UI, MUI, Ant Design), shadcn/ui was selected for its native Tailwind integration, copy-paste ownership model, Radix-based accessibility, and minimal bundle impact.

**Current state:**
- React 19.2.6 (already latest — no upgrade needed)
- Tailwind CSS v4.3.0 with CSS-first config (no tailwind.config.js)
- Vite build system
- 7 custom components, 0 library components
- Hardcoded hex colors scattered as arbitrary Tailwind values
- Inline SVGs for all icons
- Dark-mode only (no light mode)

## Goals / Non-Goals

**Goals:**
- Integrate shadcn/ui as the component library
- Replace all custom form components (InputField, DateField, ReadonlyDateField, SelectField) with shadcn/ui equivalents
- Replace TabBar with shadcn/ui Tabs
- Replace custom InstallBanner with shadcn/ui Card/Alert
- Centralize design tokens (colors, spacing) into CSS custom properties
- Add Lucide React as the icon library
- Add react-hook-form + zod for form validation
- Reduce duplicated component code (eliminate InputField/DateField duplication across page files)
- Ensure all interactive components have proper ARIA attributes and keyboard navigation

**Non-Goals:**
- Adding light mode / theme switching (keeping dark-only)
- Migrating away from Tailwind CSS (staying on Tailwind v4)
- Replacing React Router with a different router
- Redesigning the Layout header scroll animation (preserving current behavior)
- Full rewrite of business logic hooks (useCalculator, useMarathonSavings, etc.)

## Decisions

### Decision 1: Use shadcn/ui as the component library

**Rationale:** shadcn/ui is the strongest fit because:
- Built for Tailwind CSS (our styling system) — no competing CSS runtime
- Copy-paste model gives full code ownership — no vendor lock-in
- Radix primitives provide industry-best accessibility
- Minimal bundle impact (~20KB gzipped for our component needs)
- HSL CSS variable theming aligns with centralizing our hardcoded hex values
- React 19 compatible

**Alternatives considered:**
- Mantine v9: More comprehensive (120+ components, 70+ hooks) but brings its own styling system that competes with Tailwind. Heavier bundle. Provider wrapper dependency.
- Radix UI primitives only: Would require building all visual components ourselves — effectively building shadcn/ui from scratch.
- Headless UI: Only ~15 components. Missing date pickers, forms, tooltips, etc. Not comprehensive enough.

### Decision 2: Use Lucide React for icons

**Rationale:** shadcn/ui officially uses and recommends Lucide icons. They're tree-shakeable, lightweight per-icon imports, and designed to pair with shadcn/ui's aesthetic.

**Alternatives considered:**
- Heroicons: Good but less shadcn/ui ecosystem integration.
- Phosphor Icons: More icon variants but heavier.
- Keeping inline SVGs: No icon library means continued SVG duplication and maintenance burden.

### Decision 3: Use react-hook-form + zod for form validation

**Rationale:** shadcn/ui has first-class integration with react-hook-form. Zod provides schema validation that pairs with react-hook-form's resolvers. This gives us type-safe form handling with minimal boilerplate.

**Alternatives considered:**
- Mantine's built-in form: Only available if we used Mantine.
- Formik: Older, less performant, larger bundle. Not recommended in 2026.
- No form library: Continue with manual useState + onChange handlers. More boilerplate, less type safety.

### Decision 4: Centralize colors as CSS custom properties (HSL)

**Rationale:** shadcn/ui uses HSL CSS variables for theming. Our current colors (#0f1117, #1a1d27, #2e303a, #6366f1, #818cf8, #9ca3af) will be converted to HSL values defined as CSS custom properties. This aligns with Tailwind v4's CSS-first configuration and shadcn/ui's theming approach.

**Implementation:** Define `--background`, `--foreground`, `--primary`, `--muted`, `--border`, etc. as HSL values in `index.css` under `:root` / `.dark`. Reference them via Tailwind v4's `@theme` directive.

### Decision 5: Progressive migration approach

**Rationale:** Migrate one component at a time, starting with the simplest (SelectField → shadcn Select), then InputField, DateField, and finally TabBar and Layout. Each migration is independently deployable and testable.

**Why not big-bang rewrite:** The app is in production as a PWA. Incremental migration reduces risk — each component replacement can be tested independently. The shared components folder (`src/components/ui/`) will be created with shadcn/ui's init command, and pages will import from there.

### Decision 6: Layout header stays custom (not replaced)

**Rationale:** The Layout component's header uses a scroll-driven animation with `useScrollPosition` hook that interpolates font-size, padding, and border opacity. This is custom behavior that no component library provides out-of-box. We'll keep this as custom code but style it to use the new design tokens.

## Risks / Trade-offs

- **[Tailwind v4 compatibility]** shadcn/ui's init and component generation CLI may not fully support Tailwind v4's CSS-first config (no `tailwind.config.js`). → **Mitigation**: shadcn/ui v2 supports Tailwind v4. We'll use `npx shadcn@latest init` with the `--css-variables` flag and adjust the generated CSS for Tailwind v4's `@theme` directive. Any generated `tailwind.config.js` will be removed since we use CSS-first config.

- **[Copy-paste maintenance]** shadcn/ui components live in our codebase, so security/accessibility updates require manual action. → **Mitigation**: Use `npx shadcn@latest diff` periodically to check for upstream changes. Subscribe to shadcn/ui release notifications.

- **[Bundle size increase]** Adding shadcn/ui + Lucide + react-hook-form + zod adds estimated ~40-50KB gzipped. → **Mitigation**: Tree-shaking ensures only imported icons and components are bundled. This is a one-time increase and still far smaller than MUI (~150KB+) or Mantine (~80KB+).

- **[Dark-only mode gap]** shadcn/ui ships with both light and dark themes. We only use dark. → **Mitigation**: Set `defaultTheme="dark"` and `disableTransitionOnChange` in the ThemeProvider. Define only dark-mode CSS variables. Remove light-mode variables.

- **[Learning curve]** Team needs to learn shadcn/ui component APIs and patterns. → **Mitigation**: shadcn/ui has excellent docs and examples. The component APIs are consistent and well-typed with TypeScript.

## Migration Plan

1. **Phase 1: Setup** — Initialize shadcn/ui, configure design tokens (CSS variables), add Lucide and react-hook-form
2. **Phase 2: Form components** — Replace InputField, DateField, ReadonlyDateField, SelectField with shadcn/ui components; add form validation with react-hook-form + zod
3. **Phase 3: Navigation components** — Replace TabBar with shadcn Tabs; replace inline SVG icons with Lucide
4. **Phase 4: Layout components** — Refactor InstallBanner with shadcn Card/Alert; update Layout to use design tokens
5. **Phase 5: Cleanup** — Remove old component code, update all hardcoded colors to design tokens, verify PWA functionality

**Rollback strategy:** Each phase is independently deployable. If a library component causes issues, we can revert to the previous custom component since shadcn/ui components are separate files. No vendor lock-in means we can always remove individual components.

## Open Questions

1. Should we add light mode support in the future, or is dark-only a permanent design decision? (This affects how we set up CSS variables.)
2. Are there plans for new pages/features that need components beyond what shadcn/ui provides? (This affects whether we need Mantine for specific complex components like data tables.)
3. Should the Settings page use shadcn/ui form components for a richer settings experience, or keep its current simple layout?