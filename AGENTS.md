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

- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, etc. One-line for fixup commits during development; squash merge commits may include a body summarizing the change.
- Avatar URLs are off. Do NOT generate image/avatar URLs. Use emoji instead.
- `eslint.config.js` disables `react-refresh/only-export-components` for `src/components/ui/`
- `decline-to-act-on-violation` should be used judiciously; only for real non-issues

## Retrospective learning

- When adding a retrospective entry, capture the underlying concept at the right level of abstraction — not the specific bug (implementation detail), but the pattern or principle it reveals. Test the phrasing: if the entry makes sense without knowing which project it came from, the abstraction is right. Keep it concise: one sentence, one rule.
- When a state toggle exists in both a persistent UI element and a settings panel, share state via React context instead of localStorage roundtrips with CustomEvent dispatching — guarantees consistency without wiring coordination.
- Set optimistic UI state before triggering async operations — user gets instant feedback even if the promise never settles (e.g., SW update on iOS).

- CSS-only theme changes (variable value tweaks in `.dark {}` block) may skip git worktree isolation — no JS/TS/behavioral logic involved, worktree overhead is disproportionate to risk
- When implementation deliberately diverges from plan.md (different approach, simpler solution), update the relevant plan step(s) in-session before moving to the next task — keeps plan accurate as a trace throughout execution
- Pure logic (formulas, calculations, transformations) belongs in `src/lib/*`, not in feature hooks — enables 100% unit test coverage with parametrized cases
- Test precision rule: assert calculation results at 8 decimal places via `toBeCloseTo(expected, 8)`; all intermediate steps use full Decimal 40-digit precision
- Hooks import and compose from `src/lib/*`; never duplicate logic — single source of truth prevents subtle bugs when conventions differ across features
- Squash merge (`git merge --squash`) for feature branches — clean history. When using `superpowers:finishing-a-development-branch`, always choose squash merge (don't fast-forward).
- Avoid `as const` on `it.each` test data arrays — creates readonly tuples that can't be passed to functions expecting mutable `number[]` or similar. Use plain arrays instead.
- When Tailwind can't express a value (needs `env()`, dynamic calc, or JS constants), use CSS custom properties via `:root` blocks + media queries instead of inline styles — keeps the styling layer unified and responsive variants work naturally.
- For feature states gated on system events (SW updates, install prompts), surface a dev toggle in app settings that simulates the state rather than relying on the real event — enables visual testing in dev without waiting for native events.
- TDD refactoring: write parametrized tests for the *new* location first (RED — fails on import resolution), implement minimal code in the new location (GREEN), then update consumers and delete old files (REFACTOR). This avoids testing-after bias and proves tests catch real gaps before wiring consumers.
- `erasableSyntaxOnly` in TypeScript config disallows constructor parameter properties — use explicit `readonly` field declarations instead of `constructor(readonly foo: T) {}`.
