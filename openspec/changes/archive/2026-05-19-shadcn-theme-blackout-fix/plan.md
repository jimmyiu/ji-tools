# shadcn-theme-blackout-fix Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Recalibrate shadcn/ui CSS variable values in `src/index.css` to replace near-black surfaces with a systematic elevation ladder (hue 260° blue-grey slate, primary kept at indigo 270°).

**Architecture:** Single-file change to `src/index.css` — only the `.dark {}` CSS custom property block. The `@theme inline {}` mapping block stays unchanged. All components auto-adopt the new tokens via Tailwind utility classes.

**Tech Stack:** CSS (oklch), Tailwind v4 (no config file), shadcn/ui radix-nova (CSS variables)

---

## Task 1: Update CSS Variable Values

- [ ] **Step 1:** Open `src/index.css` and locate the `.dark {}` CSS custom property block (lines ~30-55). Replace each variable value per the approved design:

  | Token | Old | New |
  |-------|-----|-----|
  | `--background` | `oklch(0.09 0.005 270)` | `oklch(0.115 0.006 260)` |
  | `--foreground` | `oklch(0.88 0.01 260)` | `oklch(0.88 0.01 260)` *(hue unchanged, keep)* |
  | `--card` | `oklch(0.13 0.008 270)` | `oklch(0.155 0.008 260)` |
  | `--card-foreground` | `oklch(0.88 0.01 260)` | `oklch(0.88 0.01 260)` *(keep)* |
  | `--popover` | `oklch(0.13 0.008 270)` | `oklch(0.17 0.01 260)` |
  | `--popover-foreground` | `oklch(0.88 0.01 260)` | `oklch(0.88 0.01 260)` *(keep)* |
  | `--primary` | `oklch(0.53 0.19 270)` | `oklch(0.53 0.19 270)` *(keep)* |
  | `--primary-foreground` | `oklch(0.98 0 0)` | `oklch(0.98 0 0)` *(keep)* |
  | `--secondary` | `oklch(0.22 0.01 270)` | `oklch(0.195 0.01 260)` |
  | `--secondary-foreground` | `oklch(0.88 0.01 260)` | `oklch(0.88 0.01 260)` *(keep)* |
  | `--muted` | `oklch(0.18 0.008 270)` | `oklch(0.17 0.008 260)` |
  | `--muted-foreground` | `oklch(0.65 0.02 250)` | `oklch(0.55 0.02 260)` |
  | `--accent` | `oklch(0.22 0.01 270)` | `oklch(0.195 0.01 260)` |
  | `--accent-foreground` | `oklch(0.88 0.01 260)` | `oklch(0.88 0.01 260)` *(keep)* |
  | `--destructive` | `oklch(0.6 0.2 25)` | *(keep)* |
  | `--destructive-foreground` | `oklch(0.98 0 0)` | *(keep)* |
  | `--border` | `oklch(0.24 0.008 270)` | `oklch(0.21 0.008 260)` |
  | `--input` | `oklch(0.24 0.008 270)` | `oklch(0.19 0.01 260)` |
  | `--ring` | `oklch(0.53 0.19 270)` | `oklch(0.53 0.19 270)` *(keep, matches primary)* |

- [ ] **Step 2:** Run `pnpm build` to confirm no compilation errors
- [ ] **Step 3:** Run `pnpm test` to confirm all existing tests still pass
- [ ] **Step 4:** Start dev server with `pnpm dev` and visually verify:
  - Background vs card surfaces are clearly distinguishable
  - Input fields have a distinct inset appearance
  - Borders are visible but subtle
  - Primary buttons/elements render in indigo (270°)
  - Focus rings match the indigo primary
