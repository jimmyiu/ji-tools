## 1. Setup & Dependencies

- [ ] 1.1 Initialize shadcn/ui with `npx shadcn@latest init` — configure for Tailwind v4 CSS-first (no tailwind.config.js), dark mode default, HSL CSS variables
- [ ] 1.2 Install Lucide React (`npm install lucide-react`) and verify tree-shaking works with Vite production build
- [ ] 1.3 Install react-hook-form and zod (`npm install react-hook-form @hookform/resolvers zod`) for form validation
- [ ] 1.4 Add shadcn/ui components needed: `npx shadcn@latest add input label select tabs card alert` — verify each generates in `src/components/ui/`

## 2. Design Tokens & Theming

- [ ] 2.1 Convert hardcoded hex colors (#0f1117, #1a1d27, #2e303a, #6366f1, #818cf8, #9ca3af) to HSL values in `index.css` under `:root` as CSS custom properties
- [ ] 2.2 Define shadcn/ui theme variables (--background, --foreground, --card, --primary, --muted, --border, --input, --ring, etc.) mapping to the HSL design tokens
- [ ] 2.3 Configure Tailwind v4 `@theme` directive in `index.css` to map CSS variables to Tailwind utilities (bg-background, text-foreground, border-border, etc.)
- [ ] 2.4 Replace all Tailwind arbitrary color values (bg-[#1a1d27], text-[#9ca3af], border-[#2e303a], etc.) throughout the codebase with token-based utilities (bg-background, text-muted-foreground, border-border, etc.)
- [ ] 2.5 Verify dark mode appearance matches current design after token migration (visual regression check)

## 3. Form Components Replacement

- [ ] 3.1 Create shared InputField component in `src/components/` using shadcn/ui Input + Label, supporting number input with suffix, label, and error message display
- [ ] 3.2 Create shared DateField component using shadcn/ui Input (type=date) + Label
- [ ] 3.3 Create shared ReadonlyDateField component using shadcn/ui Input with disabled prop and Lucide Lock icon
- [ ] 3.4 Create shared SelectField component using shadcn/ui Select with label, placeholder, and options
- [ ] 3.5 Refactor `FxDepositCompare.tsx` to remove local InputField and DateField definitions, import from shared components
- [ ] 3.6 Refactor `MarathonSavings.tsx` to remove local InputField, DateField, and SelectField definitions, import from shared components
- [ ] 3.7 Add react-hook-form + zod validation schemas to FxDepositCompare form
- [ ] 3.8 Add react-hook-form + zod validation schemas to MarathonSavings form

## 4. Navigation Components Replacement

- [ ] 4.1 Replace TabBar component with shadcn/ui Tabs — implement route-based navigation with NavLink integration
- [ ] 4.2 Replace inline SVG icons in tabs with Lucide icons (Home, Calculator, TrendingUp, Settings icons)
- [ ] 4.3 Verify tab active state styling matches current TabBar appearance (active indicator, icon highlight)
- [ ] 4.4 Ensure safe-area-inset handling and mobile touch behavior are preserved in new TabBar

## 5. Layout & Supporting Components

- [ ] 5.1 Refactor InstallBanner to use shadcn/ui Card or Alert as container, Lucide X and Share icons instead of inline SVGs
- [ ] 5.2 Update Layout component to use design token CSS variables instead of hardcoded hex colors (font-size, padding, border colors)
- [ ] 5.3 Verify Layout scroll-driven animation (useScrollPosition) still works correctly with design token colors
- [ ] 5.4 Update Home.tsx tool cards to use design token colors instead of arbitrary Tailwind values

## 6. Cleanup & Verification

- [ ] 6.1 Remove all remaining inline SVG icon definitions from component files
- [ ] 6.2 Remove any unused CSS from `index.css` after token migration
- [ ] 6.3 Run full test suite and verify all existing tests pass
- [ ] 6.4 Verify PWA functionality still works (install prompt, service worker, offline loading)
- [ ] 6.5 Run Lighthouse audit to verify no performance regression (target: same or better scores)
- [ ] 6.6 Verify production build size and confirm tree-shaking is working for Lucide icons