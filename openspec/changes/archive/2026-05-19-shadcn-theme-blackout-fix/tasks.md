## 1. Update CSS Variable Values

- [x] 1.1 Change `--background` from `oklch(0.09 0.005 270)` to `oklch(0.115 0.006 260)`
- [x] 1.2 Change `--foreground` from `oklch(0.88 0.01 260)` to `oklch(0.88 0.01 260)` (hue update only)
- [x] 1.3 Change `--card` from `oklch(0.13 0.008 270)` to `oklch(0.155 0.008 260)`
- [x] 1.4 Change `--card-foreground` hue from 270° to 260°
- [x] 1.5 Change `--popover` from `oklch(0.13 0.008 270)` to `oklch(0.17 0.01 260)`
- [x] 1.6 Change `--popover-foreground` hue from 270° to 260°
- [x] 1.7 Keep `--primary` at `oklch(0.53 0.19 270)` (indigo, unchanged)
- [x] 1.8 Change `--primary-foreground` to `oklch(0.98 0 0)` (confirm value)
- [x] 1.9 Change `--secondary` from `oklch(0.22 0.01 270)` to `oklch(0.195 0.01 260)`
- [x] 1.10 Change `--secondary-foreground` hue from 270° to 260°
- [x] 1.11 Change `--muted` from `oklch(0.18 0.008 270)` to `oklch(0.17 0.008 260)`
- [x] 1.12 Change `--muted-foreground` from `oklch(0.65 0.02 250)` to `oklch(0.55 0.02 260)`
- [x] 1.13 Change `--accent` from `oklch(0.22 0.01 270)` to `oklch(0.195 0.01 260)`
- [x] 1.14 Change `--accent-foreground` hue from 270° to 260°
- [x] 1.15 Change `--border` from `oklch(0.24 0.008 270)` to `oklch(0.21 0.008 260)`
- [x] 1.16 Change `--input` from `oklch(0.24 0.008 270)` to `oklch(0.19 0.01 260)`
- [x] 1.17 Keep `--ring` at `oklch(0.53 0.19 270)` (indigo, matches primary)

## 2. Verify Build and Visual Output

- [x] 2.1 Run `pnpm build` to confirm no build errors
- [x] 2.2 Run `pnpm test` to confirm no test failures
- [x] 2.3 Visually verify elevation hierarchy in dev server (background vs card vs input vs border)
- [x] 2.4 Verify focus ring appears in teal on interactive elements
- [x] 2.5 Verify primary buttons render in teal
