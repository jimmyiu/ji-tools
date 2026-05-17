# Adopt Component Library Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development
> to implement this plan task-by-task.

**Goal:** Replace all custom UI components with shadcn/ui equivalents, centralize design tokens, add Lucide icons and react-hook-form + zod, eliminating code duplication and improving accessibility.

**Architecture:** shadcn/ui provides Radix-based accessible primitives styled with Tailwind. Components live in `src/components/ui/` (copy-paste model). Design tokens are HSL CSS custom properties in `index.css` mapped via Tailwind v4's `@theme` directive. Form state uses react-hook-form + zod schemas. Icons use tree-shaken Lucide React imports.

**Tech Stack:** React 19, shadcn/ui v2 (Radix + Tailwind), Lucide React, react-hook-form, zod, @hookform/resolvers, vitest

---

## Task 1: Initialize shadcn/ui and Dependencies

- [ ] **Step 1:** Run `npx shadcn@latest init` with these choices: style=default, base-color=slate, css-variables=yes. This creates `src/components/ui/utils.ts` and adds CSS variables to `index.css`. If a `tailwind.config.js` or `tailwind.config.ts` is generated, delete it (we use Tailwind v4 CSS-first config).
- [ ] **Step 2:** Run `npm install lucide-react react-hook-form @hookform/resolvers zod` to add icon and form libraries.
- [ ] **Step 3:** Run `npx shadcn@latest add input label select tabs card alert` to generate shadcn/ui components in `src/components/ui/`.
- [ ] **Step 4:** Verify setup by running `npm run build`. Confirm no TypeScript or Vite errors, and that `src/components/ui/` contains: `input.tsx`, `label.tsx`, `select.tsx`, `tabs.tsx`, `card.tsx`, `alert.tsx`, `utils.ts`.
- [ ] **Commit:** `feat: initialize shadcn/ui with input, label, select, tabs, card, alert components`

## Task 2: Define Design Token CSS Variables

- [ ] **Step 1:** In `src/index.css`, replace the current `:root` block with HSL CSS custom properties. Convert the current hex colors: `#0f1117` → `0 6% 8%`, `#1a1d27` → `230 17% 12%`, `#2e303a` → `230 12% 20%`, `#6366f1` → `239 84% 67%`, `#818cf8` → `239 84% 74%`, `#9ca3af` → `220 9% 66%`, `#e2e8f0` → `214 32% 91%`, `#4b5563` → `220 9% 46%`, `#6b7280` → `220 9% 38%`. Define: `--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--destructive`, `--destructive-foreground`, `--accent`, `--accent-foreground`, `--popover`, `--popover-foreground`. Keep `color-scheme: dark` on `:root`.
- [ ] **Step 2:** In `src/index.css`, add a `@theme` block (Tailwind v4 directive) that maps CSS variables to Tailwind utility names: `--color-background: var(--background)`, `--color-foreground: var(--foreground)`, `--color-card: var(--card)`, `--color-card-foreground: var(--card-foreground)`, `--color-primary: var(--primary)`, `--color-primary-foreground: var(--primary-foreground)`, `--color-muted: var(--muted)`, `--color-muted-foreground: var(--muted-foreground)`, `--color-border: var(--border)`, `--color-input: var(--input)`, `--color-ring: var(--ring)`. This enables `bg-background`, `text-foreground`, `border-border`, etc.
- [ ] **Step 3:** Verify the CSS compiles by running `npm run build`. Check that `bg-background`, `text-foreground`, and other token-based utilities resolve correctly in the browser.
- [ ] **Commit:** `feat: define HSL design token CSS variables and Tailwind v4 @theme mapping`

## Task 3: Migrate Arbitrary Colors to Design Tokens

- [ ] **Step 1:** Update `src/components/Layout.tsx` — replace `bg-[#0f1117]` → `bg-background`, `text-[#e2e8f0]` → `text-foreground`, `text-[#9ca3af]` → `text-muted-foreground`, `border-[#2e303a]` → `border-border`, `bg-[#1a1d27]` → `bg-card`.
- [ ] **Step 2:** Update `src/components/TabBar.tsx` — replace `bg-[#1a1d27]` → `bg-card`, `border-[#2e303a]` → `border-border`, `text-[#818cf8]` → `text-primary`, `text-[#9ca3af]` → `text-muted-foreground`.
- [ ] **Step 3:** Update `src/components/InstallBanner.tsx` — replace `bg-[#1a1d27]` → `bg-card`, `border-[#2e303a]` → `border-border`, `text-[#9ca3af]` → `text-muted-foreground`, `bg-[#6366f1]` → `bg-primary`, `hover:bg-[#818cf8]` → `hover:bg-primary/80`, `text-white` stays (already a semantic class).
- [ ] **Step 4:** Update `src/pages/FxDepositCompare.tsx` — replace all `bg-[#1a1d27]` → `bg-card`, `border-[#2e303a]` → `border-border`, `text-[#9ca3af]` → `text-muted-foreground`, `text-[#6b7280]` → `text-muted-foreground/70`, `text-[#818cf8]` → `text-primary`, `placeholder-[#4b5563]` → `placeholder-muted-foreground/50`, `focus:border-[#6366f1]` → `focus:border-primary`, `focus:ring-[#6366f1]` → `focus:ring-primary`, `bg-[#12151e]` → `bg-card/80` (for readonly fields), `border-[#2a2d3a]` → `border-border/80`.
- [ ] **Step 5:** Update `src/pages/MarathonSavings.tsx` — same replacements as FxDepositCompare: `bg-[#1a1d27]` → `bg-card`, `border-[#2e303a]` → `border-border`, `text-[#9ca3af]` → `text-muted-foreground`, `text-[#818cf8]` → `text-primary`, `text-[#6b7280]` → `text-muted-foreground/70`, focus classes → `focus:border-primary focus:ring-primary`.
- [ ] **Step 6:** Update `src/pages/Home.tsx` and `src/pages/Settings.tsx` — search for any remaining `[#` arbitrary color values and replace with design token utilities.
- [ ] **Step 7:** Globally search the entire `src/` directory for remaining `[#` patterns (Tailwind arbitrary values). Replace every instance with the corresponding design token utility. Verify zero `[#` patterns remain with `rg '\[#' src/`.
- [ ] **Step 8:** Run `npm run build` and `npm run test` to verify no regressions. Visually verify the app looks identical in dark mode.
- [ ] **Commit:** `refactor: replace all hardcoded color arbitrary values with design token utilities`

## Task 4: Create Shared InputField Component

- [ ] **Step 1:** Create `src/components/InputField.tsx` — a shared component using shadcn/ui `Input` and `Label`. It should accept: `label: string`, `value: string | number`, `onChange: (v: string) => void`, `suffix?: string`, `min?: number`, `step?: number`, `error?: string`. Render a `<Label>` followed by a relative-positioned div containing `<Input type="number">` with optional suffix `<span>`. Apply design token classes: `bg-card`, `border-border`, `text-foreground`, `focus:border-primary`, `focus:ring-primary`. If `error` is provided, show a `<p className="text-sm text-destructive">` below.
- [ ] **Step 2:** Write `src/components/InputField.test.tsx` — test that: (1) renders label text, (2) renders number input with value, (3) calls onChange on input change, (4) renders suffix when provided, (5) renders error message when provided, (6) applies correct shadcn/ui classes.
- [ ] **Step 3:** Run `npx vitest run src/components/InputField.test.tsx` and verify all tests pass.
- [ ] **Commit:** `feat: add shared InputField component using shadcn/ui Input and Label`

## Task 5: Create Shared DateField and ReadonlyDateField Components

- [ ] **Step 1:** Create `src/components/DateField.tsx` — uses shadcn/ui `Input` (type=date) and `Label`. Accepts: `label`, `value`, `onChange`. Applies design token classes.
- [ ] **Step 2:** Create `src/components/ReadonlyDateField.tsx` — uses shadcn/ui `Input` (type=text) with `disabled` and `readOnly` props. Imports `Lock` icon from `lucide-react` and renders it as a suffix. Accepts: `label`, `value`. Applies `bg-card/80`, `text-muted-foreground`, `cursor-default` classes.
- [ ] **Step 3:** Write tests for both: `DateField.test.tsx` renders label + date input, calls onChange. `ReadonlyDateField.test.tsx` renders label + readonly input + Lock icon.
- [ ] **Step 4:** Run `npx vitest run src/components/DateField.test.tsx src/components/ReadonlyDateField.test.tsx` and verify all tests pass.
- [ ] **Commit:** `feat: add shared DateField and ReadonlyDateField components with Lucide Lock icon`

## Task 6: Create Shared SelectField Component

- [ ] **Step 1:** Create `src/components/SelectField.tsx` — uses shadcn/ui `Select` (SelectTrigger, SelectValue, SelectContent, SelectItem) with `Label`. Accepts: `label`, `value`, `onChange`, `options: { value: string; label: string }[]`. Verify keyboard navigation works (Tab, Enter, Arrow keys per WAI-ARIA combobox pattern).
- [ ] **Step 2:** Write `src/components/SelectField.test.tsx` — test that: (1) renders label, (2) renders options, (3) calls onChange when selection changes, (4) shows placeholder text.
- [ ] **Step 3:** Run `npx vitest run src/components/SelectField.test.tsx` and verify all tests pass.
- [ ] **Commit:** `feat: add shared SelectField component using shadcn/ui Select`

## Task 7: Refactor FxDepositCompare to Use Shared Components

- [ ] **Step 1:** In `src/pages/FxDepositCompare.tsx`, remove the local `InputField` function (lines 7-37), the local `DateField` function (lines 39-51), and the local `ReadonlyDateField` function (lines 53-69). Add imports: `import InputField from '../components/InputField'`, `import DateField from '../components/DateField'`, `import ReadonlyDateField from '../components/ReadonlyDateField'`. Verify all usages in the JSX are unchanged (same prop names).
- [ ] **Step 2:** Verify `FxDepositCompare.tsx` renders identically by running `npm run build` and visual check. Run `npx vitest run` to confirm no test regressions.
- [ ] **Commit:** `refactor: replace local form components in FxDepositCompare with shared shadcn/ui components`

## Task 8: Refactor MarathonSavings to Use Shared Components

- [ ] **Step 1:** In `src/pages/MarathonSavings.tsx`, remove the local `InputField` function (lines 12-42), the local `DateField` function (lines 44-62), and the local `SelectField` function (lines 64-88). Add imports: `import InputField from '../components/InputField'`, `import DateField from '../components/DateField'`, `import SelectField from '../components/SelectField'`. Verify all usages in the JSX are unchanged.
- [ ] **Step 2:** Verify `MarathonSavings.tsx` renders identically. Run `npm run build` and `npx vitest run`.
- [ ] **Commit:** `refactor: replace local form components in MarathonSavings with shared shadcn/ui components`

## Task 9: Add react-hook-form + zod to FxDepositCompare

- [ ] **Step 1:** In `src/pages/FxDepositCompare.tsx`, import `useForm` from `react-hook-form` and `zodResolver` from `@hookform/resolvers/zod`. Define a zod schema: `const fxDepositSchema = z.object({ startDate: z.string().min(1), initialPrincipal: z.string().min(1), depositMonths: z.string().min(1), iterate: z.string().min(1), hkdRate: z.string().min(1), usdRate: z.string().min(1), bankSellRate: z.string().min(1), bankBuyRate: z.string().min(1) })`. Replace `useInputs` state management with `useForm({ resolver: zodResolver(fxDepositSchema), defaultValues: { ... } })`. Wire `register()` to each InputField/DateField.
- [ ] **Step 2:** Add error message display to form fields. When `formState.errors.fieldName` exists, pass the `error` prop to `InputField` or `DateField`.
- [ ] **Step 3:** Verify the form works identically to before — all calculations still produce correct results. Run `npx vitest run` and `npm run build`.
- [ ] **Commit:** `feat: add react-hook-form + zod validation to FxDepositCompare`

## Task 10: Add react-hook-form + zod to MarathonSavings

- [ ] **Step 1:** In `src/pages/MarathonSavings.tsx`, define a zod schema for the marathon savings form fields. Replace `useInputs` with `useForm` + zodResolver. Wire `register()` to each shared component.
- [ ] **Step 2:** Add error message display. Verify calculations work identically. Run `npx vitest run` and `npm run build`.
- [ ] **Commit:** `feat: add react-hook-form + zod validation to MarathonSavings`

## Task 11: Replace TabBar with shadcn/ui Tabs + Lucide Icons

- [ ] **Step 1:** Rewrite `src/components/TabBar.tsx` — import `Tabs, TabsList, TabsTrigger` from `@/components/ui/tabs`. Import `Home, Calculator, TrendingUp, Settings` from `lucide-react`. Use React Router's `useLocation` and `useNavigate` to sync tab state with routes. Map the 4 tabs: `/` (Home icon, 首頁), `/fx-deposit-compare` (Calculator icon, 港美定存), `/marathon-savings` (TrendingUp icon, 馬拉松), `/settings` (Settings icon, 設定). Add back the `/fx-deposit-compare` and `/marathon-savings` tab entries that are currently missing from TabBar (currently only has / and /settings). Each tab renders the Lucide icon + label.
- [ ] **Step 2:** Style the tab bar to match current appearance: `bg-card`, `border-border`, active tab `text-primary`, inactive `text-muted-foreground`, safe-area-inset-bottom padding. Ensure touch-action: manipulation is preserved.
- [ ] **Step 3:** Write `src/components/TabBar.test.tsx` — test that: (1) renders all 4 tabs, (2) active tab changes on navigation, (3) lucide icons render for each tab.
- [ ] **Step 4:** Run `npx vitest run src/components/TabBar.test.tsx` and verify. Run `npm run build`.
- [ ] **Commit:** `feat: replace TabBar with shadcn/ui Tabs and Lucide icons`

## Task 12: Refactor InstallBanner with shadcn/ui Card + Lucide Icons

- [ ] **Step 1:** Rewrite `src/components/InstallBanner.tsx` — import `Card, CardContent` from `@/components/ui/card`. Import `X, Share` from `lucide-react`. Replace the outer `<div>` container with `<Card>` styled with `bg-card border-border`. Replace the dismiss `<button>` inline SVG with `<X />` from Lucide. Replace the iOS share inline SVG with `<Share />` from Lucide. Keep `forwardRef` and all props unchanged.
- [ ] **Step 2:** Verify the banner renders correctly — same layout, same safe-area positioning, same iOS vs android behavior. Run `npm run build`.
- [ ] **Step 3:** Update `src/components/InstallBanner.test.tsx` (if it exists) or write a basic test verifying the component renders with Lucide icons.
- [ ] **Commit:** `feat: refactor InstallBanner to use shadcn/ui Card and Lucide X/Share icons`

## Task 13: Update Layout to Use Design Tokens

- [ ] **Step 1:** Update `src/components/Layout.tsx` — replace remaining hardcoded colors: `bg-[#0f1117]` → `bg-background`, `text-[#e2e8f0]` → `text-foreground`, `text-[#9ca3af]` → `text-muted-foreground`, `border-[#2e303a]` → `border-border`. Verify the `style={{ opacity: scrollProgress }}` on the border div still works.
- [ ] **Step 2:** Run `npx vitest run src/components/Layout.test.tsx` and `npm run build`. Visually verify scroll-driven header collapse animation is unchanged.
- [ ] **Commit:** `refactor: update Layout component to use design token CSS variables`

## Task 14: Update Home.tsx Tool Cards to Use Design Tokens

- [ ] **Step 1:** Update `src/pages/Home.tsx` — replace all `[#` arbitrary color values with design token utilities. Search for `bg-[#`, `text-[#`, `border-[#` and replace with `bg-card`, `text-muted-foreground`, `border-border`, `text-primary`, etc.
- [ ] **Step 2:** Run `npm run build` and verify Home page renders correctly.
- [ ] **Commit:** `refactor: update Home.tsx tool cards to use design token utilities`

## Task 15: Remove Inline SVGs and Unused CSS

- [ ] **Step 1:** Search all files in `src/` for remaining `<svg` elements that should be replaced with Lucide icon imports. Remove any leftover inline SVG definitions. This should already be done by Tasks 11-12 (TabBar and InstallBanner), but check Home.tsx, Settings.tsx, and any other files.
- [ ] **Step 2:** In `src/index.css`, remove any unused CSS rules. Ensure the `@import "tailwindcss"` and `@theme` directives are present, and that `body { background }` uses `var(--background)` instead of `#0f1117`.
- [ ] **Step 3:** Run `rg '<svg' src/` to confirm zero inline SVGs remain in component files (any remaining should be in assets or legit SVG components).
- [ ] **Commit:** `chore: remove all remaining inline SVGs and clean up unused CSS`

## Task 16: Final Verification

- [ ] **Step 1:** Run `npm run lint` and fix any ESLint issues (unused imports, etc.).
- [ ] **Step 2:** Run `npm run test` and verify ALL existing tests pass (Layout, useScrollPosition, useScrollLock, useInstallPrompt, useCalculator tests).
- [ ] **Step 3:** Run `npm run build` and verify no TypeScript errors, no Vite warnings, and successful production build.
- [ ] **Step 4:** Verify PWA functionality — check that `vite-plugin-pwa` still generates service worker, install prompt still works, offline loading still functions.
- [ ] **Step 5:** Run `npx vite-bundle-visualizer` or check build output sizes to verify tree-shaking is working for Lucide icons. Compare gzipped bundle size before/after — target is <50KB increase.
- [ ] **Step 6:** Visually verify all 4 pages render correctly with same layout and behavior: Home, FX Deposit Compare, Marathon Savings, Settings.
- [ ] **Commit:** `chore: final lint, test, and build verification`