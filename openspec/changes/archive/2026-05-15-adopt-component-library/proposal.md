## Why

The app's 7 custom UI components are hand-crafted with hardcoded Tailwind arbitrary values, duplicated across page files (InputField/DateField defined separately in FxDepositCompare.tsx and MarathonSavings.tsx), and lack accessibility primitives (ARIA attributes, keyboard navigation, focus management). Adopting a component library will reduce code duplication, improve accessibility, centralize design tokens, and speed up future UI development.

## What Changes

- **Evaluate and adopt a component library** that integrates well with our tech stack (React 19, Tailwind CSS v4, Vite, mobile-first PWA)
- **Replace custom UI components** (InputField, DateField, ReadonlyDateField, SelectField, TabBar, InstallBanner, Layout) with library equivalents where possible
- **Extract duplicated components** into shared component files (currently InputField/DateField are duplicated across page files)
- **Introduce a standardized design token system** to replace hardcoded hex colors (#0f1117, #1a1d27, etc.) scattered as Tailwind arbitrary values
- **Add an icon library** to replace inline SVGs currently used throughout
- **React version**: Already on React 19.2.6 — no upgrade needed for library compatibility

## Capabilities

### New Capabilities
- `component-library`: Evaluate, select, and integrate a React component library that replaces custom UI primitives with accessible, well-tested alternatives. Covers library comparison, selection rationale, and integration approach.
- `design-tokens`: Centralize hardcoded color/design values into a theme configuration that works with both the component library and Tailwind CSS v4.

### Modified Capabilities
- `scroll-header-collapse`: Layout component will be refactored to use library components where applicable, while preserving scroll-driven animation behavior.

## Impact

- **Dependencies**: New component library + icon library packages added to package.json
- **Components**: All 7 custom UI components (Layout, TabBar, InstallBanner, InputField, DateField, ReadonlyDateField, SelectField) will be refactored or replaced
- **Styling**: Hardcoded Tailwind arbitrary values will be replaced with design tokens; Tailwind v4 CSS-first config will be extended with custom theme variables
- **Bundle size**: Will increase based on library choice (estimates range from ~15KB gzipped for shadcn/ui approach to ~100KB+ for full libraries like MUI)
- **No API changes**: This is purely a frontend UI layer change

---

## Appendix: Component Library Comparison

### Our Tech Stack Context

| Factor | Current Stack |
|--------|--------------|
| React | 19.2.6 (latest) |
| Styling | Tailwind CSS v4 (CSS-first config, no tailwind.config.js) |
| Build | Vite |
| App type | Mobile-first PWA, dark-mode only |
| Components | 7 custom, 0 from library |
| Icons | Inline SVG (no icon library) |

### Library Comparison Matrix

| Criteria | shadcn/ui | Mantine v9 | Radix UI | Headless UI | MUI v6 | Ant Design 5 |
|----------|-----------|-----------|----------|-------------|--------|--------------|
| **React 19 support** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Tailwind integration** | ✅ Native | ⚠️ Parallel (separate CSS system) | ✅ Unstyled, works with any CSS | ✅ Native (by Tailwind Labs) | ❌ Conflicts (Emotion CSS-in-JS) | ❌ Conflicts (Less/CSS-in-JS) |
| **Component count** | ~50 | 120+ | 30+ primitives | ~15 | 80+ | 60+ |
| **Bundle size (gzipped)** | ~15-30KB (tree-shaken) | ~80-150KB | ~5-15KB (primitives only) | ~15-20KB | ~150-200KB | ~200-300KB |
| **Accessibility** | ✅ Built on Radix | ✅ Good | ✅ Best-in-class | ✅ Good | ✅ Good | ✅ Good |
| **Dark mode** | ✅ CSS variables | ✅ Built-in | ✅ (DIY) | ✅ (DIY) | ✅ Theme system | ✅ Theme system |
| **Form components** | ✅ Good | ✅ Excellent (+form library) | ⚠️ Primitives only | ⚠️ Basic | ✅ Good | ✅ Excellent |
| **Mobile-first PWA** | ✅ Works well | ✅ Works well | ✅ Works well | ✅ Works well | ⚠️ Desktop-first | ⚠️ Desktop-first |
| **Icon library compat** | ✅ Lucide | ✅ Phosphor | ✅ Any | ✅ Any | ✅ MUI Icons | ✅ Ant Icons |
| **Customization** | ✅ Full (copy-paste model) | ⚠️ Styles API | ✅ Full (unstyled) | ✅ Full (unstyled) | ⚠️ Theme overrides | ⚠️ Config overrides |
| **Release frequency** | ✅ Very active | ✅ Very active | ✅ Active | ⚠️ Slow (2.1 since 2024) | ✅ Very active | ✅ Active |
| **GitHub stars** | 114k | 26k | 16k | 25k | 95k | 93k |
| **npm weekly DL** | ~1M | ~500K | ~3M | ~1.5M | ~5M | ~2M |

### Detailed Pros/Cons

#### shadcn/ui — ⭐ RECOMMENDED

**Pros:**
- **Native Tailwind integration**: Built for Tailwind from day one. Components use Tailwind utility classes directly, no CSS-in-JS runtime conflict.
- **Copy-paste model**: Components are added to YOUR codebase. Full ownership, no dependency lock-in. Edit any component freely.
- **Built on Radix primitives**: Best-in-class accessibility (ARIA, keyboard nav, focus management) without effort.
- **CSS variables for theming**: Uses HSL CSS variables for design tokens — aligns perfectly with centralizing our hardcoded hex values.
- **Tree-shakeable**: Only the components you copy into your project are included. Minimal bundle impact.
- **Lucide icons**: Ships with Lucide icon support, solving our inline SVG problem.
- **Active development**: Extremely popular (114k stars), frequent updates, large community.
- **Works with React 19**: Recently updated for React 19 support.
- **No lock-in**: Since you own the code, you can modify, extend, or replace any component.
- **Dark mode via CSS variables**: Trivial to implement with our dark-only app.

**Cons:**
- **Fewer components than MUI/Ant Design**: ~50 components vs 60-120+. Missing: complex data tables, full form builders, rich text editors, charts. These can be added via shadcn/ui tabs or third-party extensions.
- **Manual updates**: Since you own the code, security/accessibility updates require manual action (can use `shadcn diff` to see changes).
- **No built-in form library**: Need separate solution (react-hook-form recommended, or zod for validation). Mantine and Ant Design have built-in form solutions.
- **No hooks library**: Unlike Mantine's 70+ hooks, shadcn/ui only provides UI components.

#### Mantine v9

**Pros:**
- **Most comprehensive**: 120+ components, 70+ hooks, form library, notifications, charts, spotlight, carousel — everything included.
- **Built-in form management**: @mantine/form provides declarative form handling with validation.
- **Great documentation**: Known for excellent docs, examples, and TypeScript support.
- **CSS Modules approach** (v7+): Switched from CSS-in-JS to native CSS. No runtime overhead.
- **Dark mode built-in**: First-class dark mode support with `MantineProvider`.
- **Mobile-friendly**: Responsive grid, drawer, mobile-specific components.
- **LLM-friendly docs**: Has llms.txt, MCP server, and AI agent skills — great for AI-assisted development.
- **Active development**: Very active releases, responsive maintainers.

**Cons:**
- **Dual styling system**: Mantine has its own PostCSS-based styling that runs alongside Tailwind. This creates cognitive overhead (two ways to style) and potential specificity conflicts.
- **Heavier bundle**: ~80-150KB gzipped for commonly used subset vs ~15-30KB for shadcn/ui approach.
- **Provider wrapper**: Requires `MantineProvider` wrapping your app, adding a dependency layer.
- **Design overrides are verbose**: Customizing Mantine's look to match our dark theme requires overriding many CSS variables and component styles.
- **Less flexible for custom designs**: Mantine has strong opinions about spacing, typography, and component structure. Harder to deviate.
- **Vendor lock-in**: Harder to remove Mantine once deeply integrated (form library, hooks, etc.).

#### Radix UI (Primitives Only)

**Pros:**
- **Maximum flexibility**: Completely unstyled primitives. Build whatever you want on top.
- **Best accessibility**: Industry-leading accessible component behavior.
- **Smallest bundle**: Only pay for primitives you import (~5-15KB).
- **No styling conflicts**: Zero styling opinions, works perfectly with Tailwind.
- **Foundation of shadcn/ui**: What shadcn/ui uses under the hood.

**Cons:**
- **Build everything yourself**: Radix provides behavior only. You still write all the visual/Tailwind code for each component. Essentially what we're doing now, but with accessibility added.
- **No design system**: No visual foundation, no tokens, no theme. Every visual decision is on you.
- **Time-intensive**: Using Radix directly means building shadcn/ui yourself — slower than just using shadcn/ui.
- **Not a complete solution**: Missing many higher-level components (no data tables, forms, etc.).

#### Headless UI

**Pros:**
- **By Tailwind Labs**: Designed to work with Tailwind CSS. Official integration.
- **Lightweight**: ~15-20KB gzipped. Only the components you need.
- **Good accessibility**: WAI-ARIA compliant.
- **Simple API**: Clean, well-documented API surface.

**Cons:**
- **Very limited component set**: Only ~15 components (Menu, Listbox, Combobox, Dialog, Switch, etc.). Missing: date pickers, sliders, progress bars, tables, tooltips, toast, forms.
- **Slow release cadence**: v2.1 is current, updates are infrequent compared to shadcn/ui or Mantine.
- **No design system or tokens**: Unstyled — same build-effort problem as Radix primitives.
- **No form library, hooks, or extensions**: Much less ecosystem than shadcn/ui or Mantine.
- **Fewer community resources**: Smaller ecosystem, fewer examples and tutorials.

#### MUI (Material UI)

**Pros:**
- **Most popular**: Massive community, extensive documentation, 80+ components.
- **Comprehensive**: Data tables, date pickers, forms, everything included.
- **MUI X**: Advanced data grid, date range picker, tree view components.
- **Great documentation and tooling**: Theme editor, CLI, icon library.

**Cons:**
- **Material Design opinionated**: Looks like Material Design. Hard to make look custom.
- **CSS-in-JS (Emotion)**: Conflicts with Tailwind CSS. Two styling systems competing.
- **Heavy bundle**: ~150-200KB gzipped for a typical app.
- **Desktop-first**: Not optimized for mobile-first PWAs.
- **Complex theming**: Overriding MUI's theme to match our dark aesthetic is verbose and painful.
- **React 19 compatibility**: Required significant migration effort (Emotion + React 19 issues were problematic).

#### Ant Design 5

**Pros:**
- **Enterprise-grade**: Very full-featured, 60+ components.
- **Design tokens system**: CSS-in-JS with Design Token system for theming.
- **Rich form system**: Built-in form validation, form fields.
- **Large ecosystem**: Pro templates, chart library, admin frameworks.

**Cons:**
- **Heaviest bundle**: ~200-300KB gzipped.
- **CSS-in-JS conflict**: Uses CSS-in-JS that conflicts with Tailwind.
- **Enterprise look**: Very opinionated design language, not customizable enough for a personal finance PWA.
- **Desktop-first**: Built for enterprise dashboards, not mobile-first apps.
- **Complex configuration**: ConfigProvider, locale system, theme algorithm — overkill for our app size.

### Recommendation: shadcn/ui

**shadcn/ui is the clear best fit** for this project because:

1. **Native Tailwind v4 compatibility** — designed to work with Tailwind, no competing styling systems
2. **Copy-paste ownership model** — no vendor lock-in, full code control, aligns with our small app philosophy
3. **Radix-based accessibility** — gets us WAI-ARIA compliance for free
4. **Minimal bundle impact** — only the components we actually use (estimated ~20KB gzipped for our needs)
5. **CSS variable theming** — solves our hardcoded hex color problem naturally
6. **Lucide icons** — replaces our inline SVGs with a proper icon library
7. **React 19 support** — fully compatible with our current React version
8. **Active community** — 114k stars, frequent updates, large ecosystem of extensions

**What we'd supplement shadcn/ui with:**
- **react-hook-form** — form management (Mantine has this built-in, but rhf is more flexible)
- **zod** — schema validation (pairs with react-hook-form)
- **Lucide React** — icon library (shadcn/ui's preferred icon partner)
- One or two shadcn/ui community extensions for any specialized needs

**Components we can immediately replace:**
| Current Custom | shadcn/ui Replacement | Code Reduction |
|---------------|---------------------|---------------|
| InputField (×2) | Input + Label | ~50% fewer lines |
| DateField (×2) | Input (type=date) + Label | ~50% fewer lines |
| SelectField | Select | ~70% fewer lines |
| TabBar | Tabs | ~60% fewer lines |
| InstallBanner | Card or Alert | ~40% fewer lines |
| Layout (header) | Aspect ratio with scroll | Style changes, not replacement |

**Estimated code reduction**: ~40-60% of current custom component code can be replaced with library components.