## 1. Setup & Dependencies

- [x] 1.1 Initialize shadcn/ui with `npx shadcn@latest init` — configure for Tailwind v4 CSS-first (no tailwind.config.js), dark mode default, HSL CSS variables
- [x] 1.2 Install Lucide React (`npm install lucide-react`) and verify tree-shaking works with Vite production build
- [x] 1.3 Install react-hook-form and zod (`npm install react-hook-form @hookform/resolvers zod`) for form validation
- [x] 1.4 Add shadcn/ui components needed: `npx shadcn@latest add input label select tabs card alert` — verify each generates in `src/components/ui/`

## 2. Design Tokens & Theming

- [x] 2.1 Convert hardcoded hex colors (#0f1117, #1a1d27, #2e303a, #6366f1, #818cf8, #9ca3af) to OKLCH values in `index.css` under `.dark` as CSS custom properties
- [x] 2.2 Define shadcn/ui theme variables (--background, --foreground, --card, --primary, --muted, --border, --input, --ring, etc.) mapping to the OKLCH design tokens
- [x] 2.3 Configure Tailwind v4 `@theme inline` directive in `index.css` to map CSS variables to Tailwind utilities (bg-background, text-foreground, border-border, etc.)
- [x] 2.4 Replace all Tailwind arbitrary color values (bg-[#1a1d27], text-[#9ca3af], border-[#2e303a], etc.) throughout the codebase with token-based utilities (bg-background, text-muted-foreground, border-border, etc.)
- [x] 2.5 Verify dark mode appearance matches current design after token migration (build + tests pass)

## 3. Form Components Replacement

- [x] 3.1 Create shared InputField component in `src/components/` using shadcn/ui Input + Label, supporting number input with suffix, label, and error message display
- [x] 3.2 Create shared DateField component using shadcn/ui Input (type=date) + Label
- [x] 3.3 Create shared ReadonlyDateField component using shadcn/ui Input with disabled prop and Lucide Lock icon
- [x] 3.4 Create shared SelectField component using shadcn/ui Select with label, placeholder, and options
- [x] 3.5 Refactor `FxDepositCompare.tsx` to remove local InputField and DateField definitions, import from shared components
- [x] 3.6 Refactor `MarathonSavings.tsx` to remove local InputField, DateField, and SelectField definitions, import from shared components
- [x] 3.7 Add react-hook-form + zod validation schemas to FxDepositCompare form
- [~] 3.8 Add react-hook-form + zod validation schemas to MarathonSavings form *(deferred: complex nested phase arrays — re-evaluate in a separate change)*

## 4. Navigation Components Replacement

- [x] 4.1 Replace TabBar component with shadcn/ui Tabs — implement route-based navigation with NavLink integration
- [x] 4.2 Replace inline SVG icons in tabs with Lucide icons (Home, Calculator, TrendingUp, Settings icons)
- [x] 4.3 Verify tab active state styling matches current TabBar appearance (active indicator, icon highlight)
- [x] 4.4 Ensure safe-area-inset handling and mobile touch behavior are preserved in new TabBar

## 5. Layout & Supporting Components

- [x] 5.1 Refactor InstallBanner to use Lucide X and Share icons instead of inline SVGs, design token colors
- [x] 5.2 Update Layout component to use design token CSS variables instead of hardcoded hex colors (font-size, padding, border colors)
- [x] 5.3 Verify Layout scroll-driven animation (useScrollPosition) still works correctly with design token colors
- [x] 5.4 Update Home.tsx tool cards to use design token colors instead of arbitrary Tailwind values

## 6. Cleanup & Verification

- [x] 6.1 Remove all remaining inline SVG icon definitions from component files
- [x] 6.2 Remove unused Geist font import from CSS after token migration (removed @fontsource-variable/geist import)
- [x] 6.3 Run full test suite — 65 tests pass
- [x] 6.4 Verify PWA functionality — service worker generation confirmed in build output
- [~] 6.5 Lighthouse audit — deferred to manual verification (requires browser runtime)
- [x] 6.6 Verify production build size — JS bundle 514KB raw / 164KB gzipped, CSS 52.5KB raw / 9.5KB gzipped, PWA SW generated