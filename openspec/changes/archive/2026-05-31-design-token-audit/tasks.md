## 1. CSS Variables

- [x] 1.1 Add `--positive`, `--positive-foreground`, `--negative`, `--negative-foreground`, `--tab-bar-shadow` to `.dark` block in `src/index.css`
- [x] 1.2 Add `@theme inline` entries for all new variables in `src/index.css`, following the existing naming convention: `--color-{name}: var(--{name})` for color tokens and `--shadow-{name}: var(--{name})` for shadow tokens

## 2. Dialog & Sheet Background

- [x] 2.1 Change `DialogContent` bg from `bg-background` to `bg-card` in `src/components/ui/dialog.tsx`
- [x] 2.2 Change `SheetContent` bg from `bg-background` to `bg-card` in `src/components/ui/sheet.tsx`

## 3. TabBar Tokenization

- [x] 3.1 Replace `border-white/10` with `border-border/10` in `src/components/TabBar.tsx`
- [x] 3.2 Replace inline `rgba()` shadow with `shadow-tab-bar` in `src/components/TabBar.tsx`

## 4. PhaseRateTimeline Tokenization

- [x] 4.1 In `src/components/PhaseRateTimeline.tsx`, replace the inline `style={{ backgroundColor: 'rgba(124, 58, 237, ' + opacity + ')' }}` value with `color-mix(in oklab, var(--color-primary) ${opacity * 100}%, transparent)` (keep the inline style prop; only change the CSS value; source `opacity` is 0–1 decimal, `color-mix()` requires a percentage)
- [x] 4.2 Replace `text-purple-200` with `text-primary-foreground` in `src/components/PhaseRateTimeline.tsx`
- [x] 4.3 Replace `text-green-300` with `text-positive` in `src/components/PhaseRateTimeline.tsx`

## 5. HeroMetrics Tokenization

- [x] 5.1 Replace `border-green-500/30 bg-green-500/5` with `border-positive/30 bg-positive/5` in `src/components/HeroMetrics.tsx`

## 6. FxDepositCompare Tokenization

- [x] 6.1 Replace `text-green-400`/`text-red-400` difference display with `text-positive`/`text-negative` in `src/pages/FxDepositCompare.tsx`
- [x] 6.2 Replace result card `border-green-500/30 bg-green-500/5`/red variants with `border-positive/30 bg-positive/5`/negative variants
- [x] 6.3 Replace badge `bg-green-500/15 text-green-400`/red variants with `bg-positive/15 text-positive`/negative variants
- [x] 6.4 Replace winning amount `text-green-400` with `text-positive`

## 7. Strip Redundant dark: Modifiers

- [x] 7.1 Remove redundant `dark:` modifiers from `src/components/ui/input.tsx`
- [x] 7.2 Remove redundant `dark:` modifiers from `src/components/ui/select.tsx`
- [x] 7.3 Remove redundant `dark:` modifiers from `src/components/ui/tabs.tsx`

## 8. AGENTS.md

- [x] 8.1 Append retrospective principle to AGENTS.md

## 9. Verification

- [x] 9.1 Run `pnpm run lint` and fix any issues
- [x] 9.2 Run `pnpm test` and confirm all tests pass
