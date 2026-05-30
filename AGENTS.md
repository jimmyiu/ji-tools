# ji-tools

Hong Kong-focused frontend toolset: FX deposit comparison, marathon savings calculator.

## Quick start

```sh
pnpm install        # may prompt for pnpm approve-builds
pnpm dev            # vite --host
pnpm build          # tsc -b && vite build && cp dist/index.html dist/404.html
pnpm test           # vitest run
pnpm test:watch     # vitest
```

## Tech stack

React 19, TypeScript 6, Vite 8, Tailwind CSS 4, shadcn/ui (radix-nova style), pnpm 10, Vitest.
Uses `@/` path alias → `src/`.

## Project structure

- `src/pages/` — 4 routes: Home, FxDepositCompare, MarathonSavings, Settings
- `src/hooks/` — business logic calculators in `useCalculator.ts` and `useMarathonSavings.ts`
- `src/components/` — shared form fields, Layout with scroll-collapsing header, TabBar, InstallBanner
- `src/components/ui/` — shadcn primitives (input, label, select, tabs)
- `src/lib/` — `constants.ts` (TAB_BAR_HEIGHT=56), `format.ts`, `utils.ts` (cn helper)
- `src/test/setup.ts` — imports @testing-library/jest-dom, mocks ResizeObserver

## Architecture notes

- Dark-only design — `<html class="dark">`, no light mode
- Router uses `<BrowserRouter basename="/ji-tools/">` — matching GitHub Pages subpath
- Build copies `index.html → dist/404.html` for SPA fallback routing
- PWA via vite-plugin-pwa (auto-update, precaches 8 entries, Workbox SW)
- SPA: zh-Hant locale, `overscroll-behavior-y: contain`, `touch-action: manipulation`, `viewport-fit=cover`
- Day count conventions: HKD uses 365-day base, USD uses 360-day base (in marathon savings)

## Commands

```sh
pnpm install --frozen-lockfile  # CI only
pnpm run lint                   # eslint
pnpm run preview                # vite preview
```

## Testing

- Vitest + jsdom + @testing-library/react
- Run focused tests: `pnpm test -- src/hooks/useCalculator.test.ts`

## OpenSpec workflow

- Specs in `openspec/specs/` — `openspec-explore`, `openspec-propose`, `openspec-apply-change`, `openspec-archive-change` skills
- Commands: `opsx-explore`, `opsx-propose`, `opsx-apply`, `opsx-archive`
- Uses custom `superpowers-bridge` schema (see `openspec/schemas/`) for spec-driven workflow

## Conventions

- Conventional commits: `feat:`, `fix:`, `chore:`, etc.
- Avatar URLs are off. Do NOT generate image/avatar URLs. Use emoji instead.
- `eslint.config.js` disables `react-refresh/only-export-components` for `src/components/ui/`
- `decline-to-act-on-violation` should be used judiciously; only for real non-issues
- CSS-only theme changes (variable value tweaks in `.dark {}` block) may skip git worktree isolation — no JS/TS/behavioral logic involved, worktree overhead is disproportionate to risk
