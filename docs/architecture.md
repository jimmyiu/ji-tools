# Architecture map

Where to look first, and which layer a change belongs in. Conventions live in `AGENTS.md`; this file is the map they assume.

## Layers

Changes flow downward: a page composes sections, sections render field components, hooks hold state, `src/lib/` computes.

| Layer | Location | Holds |
| --- | --- | --- |
| Pure calculation | `src/lib/` | Formulas, dates, formatting, presets. No React. |
| State hooks | `src/hooks/` | React state and effects. Compose `src/lib/`; no formulas of their own. |
| Shared state | `src/contexts/` | Cross-page state behind a provider: toasts, PWA prompts. |
| Presentation | `src/components/` | Sections and fields. `components/ui/` holds unstyled primitives (dialog, sheet, toast). |
| Pages | `src/pages/` | Route targets, lazy-loaded from `src/App.tsx`. Compose sections; hold no formulas. |

## Deep modules

Each of these hides real behaviour behind a small interface, and is the place to test that behaviour.

- `src/lib/marathon.ts` — phase day allocation and marathon interest (deepening tracked in #15).
- `src/lib/fxDeposit.ts` — FX deposit comparison: rollover windows, per-rollover day-based compounding, comparison totals, break-even rollover count.
- `src/lib/phases.ts` — the contiguity invariant and phase date edits.
- `src/lib/calculator.ts` — the simple-interest primitive and day-count bases shared by both calculators.
- `src/contexts/PwaPromptsContext.tsx` — install and update prompt state, consumed by both layout and settings.

## Calculators

Two independent calculators, one per route. They share only the simple-interest primitives in `src/lib/calculator.ts` and the field components.

- **FX deposit comparison** (`/fx-deposit-compare`) — `src/pages/FxDepositCompare.tsx` with `src/hooks/useCalculator.ts` and `src/lib/fxDeposit.ts` (interest primitives shared from `src/lib/calculator.ts`).
- **Marathon savings** (`/marathon-savings`) — `src/pages/MarathonSavings.tsx` with `src/hooks/useMarathonSavings.ts`, `src/lib/marathon.ts`, `src/lib/phases.ts`, `src/lib/marathonPresets.ts`.

## App shell

`src/components/Layout.tsx` owns the header, banners, navigation, and scroll behaviour; `src/App.tsx` owns routing, the `/ji-tools/` base, and the providers. Navigation metrics are declared once in `src/lib/navigation.ts` and must match the `--nav-left-offset`, `--nav-bottom-offset`, `--tab-bar-bottom`, and `--update-banner-bottom` custom properties in `src/index.css`; a test in `src/lib/navigation.test.ts` fails when they drift.
