## 1. Base Input Component

- [x] 1.1 Add `appearance-none` to the className string in `src/components/ui/input.tsx`

## 2. Global CSS Reset

- [x] 2.1 Add `input[type="date"] { min-width: 0; max-width: 100%; }` inside the `@layer base` block in `src/index.css`

## 3. Verification

- [x] 3.1 Run `pnpm build` — TypeScript + Vite build must pass
- [x] 3.2 Run `pnpm test` — Vitest suite must pass (regression check)
- [x] 3.3 Visual: verify form fields in `PhaseRateEditForm` (grid-cols-2 date pair) and `FxDepositCompare` (grid-cols-2 date row) do not overflow on iOS Safari/Chrome/PWA
