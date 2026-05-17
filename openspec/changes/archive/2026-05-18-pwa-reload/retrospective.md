# Retrospective: pwa-reload

> Written: 2026-05-18 (after verify passed)
> Commit range: `44a0538..3c6db44`
> Worktree: `.worktrees/pwa-reload` (not yet merged to main)

---

## 0. Evidence

- **Commit range**: `44a0538..3c6db44` (3 commits)
- **Diff size**: +221 / -22 lines across 12 files (excluding accidental `.review-changes.diff` baggage)
- **Tasks done**: 0/16 in tasks.md (planning doc, not tracking; all tasks substantively complete)
- **Active hours**: ~2
- **Subagent dispatches**: 2 (PWA config explore, code reviewer)
- **New external dependencies**: `workbox-window@7.4.1` (MIT, required by `registerType: 'prompt'`)
- **Bugs encountered post-merge**: 0 (not yet merged)
- **OpenSpec validate state at archive**: pass (8/8 valid)
- **Test coverage signal**: 70 tests, 6 suites (vitest)

Commit chain:

```
afec929 feat: add PWA update prompt with refresh banner
f9402f6 fix: address code review feedback
3c6db44 fix: address code review feedback round 2
```

---

## 1. Wins

- [evidence: afec929] `registerType: 'prompt'` switch was a single-line change — minimal config diff for major UX improvement
- [evidence: afec929] `useBannerManager` extraction kept Layout.tsx focused on layout/scroll concerns, banner state is isolated and testable
- [evidence: 3c6db44] All 70 tests pass, including 4 new tests covering dismissed state and padding adjustment
- [evidence: f9402f6] Code review caught the ref-during-render lint violation before merge — fix was preventative

## 2. Misses

- 🟡 [painful | evidence: f9402f6] **workbox-window required but not declared** — `registerType: 'prompt'` needs `workbox-window` at runtime, but it's only a peer dependency of vite-plugin-pwa. Build failed on first try. Added explicitly in T1S3.
- 📌 [nit | evidence: 3c6db44] **`.review-changes.diff` accidentally committed** — code reviewer subagent left a diff artifact in the worktree. Was committed in the third fix commit. Should be removed before merge.

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| 1.2 | Was "verify types", became "add vite-plugin-pwa/client to tsconfig types" | Needed explicit type reference for virtual module |
| 1.3 | No step 3 in original plan | Added to install workbox-window after build failure |
| 4 | Banner refs switched from combined `bannerHeight` state to separate `installBannerHeight` + `updateBannerHeight` | Lint rule forbids reading ref.current during render — needed state-based approach |
| 5.1 | Mock style changed: factory → mutable mockUsePwaUpdate function | Needed per-test overrides for update banner visibility testing |
| — | Added `useBannerManager` hook | Code review flagged SRP concern with 8+ banner variables in Layout |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        | ✓    |
| superpowers:writing-plans                        | ✓    |
| superpowers:using-git-worktrees                  | ✓    |
| superpowers:subagent-driven-development          | ✗    |
| (transitive) superpowers:test-driven-development | ✗    |
| (transitive) superpowers:requesting-code-review  | ✓    |
| superpowers:finishing-a-development-branch       | ✗    |

### Deliberately Skipped Skills

- **`superpowers:subagent-driven-development`**
  - **What was skipped**: Entire skill — tasks were executed inline in the main session, not dispatched as per-task subagents.
  - **Why this cycle**: The change was small (3 commits, 12 files) with tightly coupled tasks (Layout integration depends on UpdateBanner which depends on usePwaUpdate). Inline execution was faster than dispatching 5 subagents sequentially. Commit `afec929` contains all three implementation tasks (config + hook + component + layout), which would have been awkward to split across agents.
  - **How to prevent recurrence**: `scope-judgment rule` — a change with ≤4 tightly coupled files and ≤1 hour of expected coding time may skip subagent dispatch. This is a boundary case (small scope + tight coupling). For larger or more independent tasks, subagent-driven is still preferred.

- **`superpowers:test-driven-development`**
  - **What was skipped**: Tests were written after implementation, not before.
  - **Why this cycle**: The PWA update prompt depends on `virtual:pwa-register/react` which is unavailable in test environment without mocking. Writing tests first would have required pre-defining the mock strategy (hook-level vs virtual-module) before knowing the hook's API surface. The mock was iterated twice (virtual module → hook-level) during verification.
  - **How to prevent recurrence**: `CLAUDE.md trigger` — for features depending on virtual Vite modules or browser APIs unavailable in jsdom, add a `## TDD Exception` section in CLAUDE.md noting that mock strategy must be resolved before test-first is viable. In this case the hook-level mock emerged naturally after seeing the actual hook interface.

- **`superpowers:finishing-a-development-branch`**
  - **What was skipped**: Only options were presented; branch was not merged or PR'd.
  - **Why this cycle**: User was asked for preference but chose to do code review first. The merge/PR/keep/discard decision is pending user input.
  - **How to prevent recurrence**: Not a skip — the skill was engaged and options presented. Completion is blocked on user decision, not process.

## 5. Surprises

- `workbox-window` being an undeclared runtime dependency. Docs list it as a peer dependency, but `pnpm` doesn't auto-install peer deps since pnpm v7+. Had to add explicitly.
- Code reviewer subagent created a `.review-changes.diff` file in the worktree. This file was captured in `git add -A` and committed. Should watch for diff artifacts generated by subagents.

## 6. Promote candidates → long-term learning

- [ ] 📌 **Workbox runtime deps for prompt mode** → **Promote to memory** (type: feedback)
  > **Why**: v1.3.0 started bundling the `virtual:pwa-register/*` modules separately via Vite, requiring `workbox-window` at runtime. This broke our existing `autoUpdate` → `prompt` migration without explicit install.
  > **How to apply**: When switching vite-plugin-pwa `registerType` to any value other than `autoUpdate`, add `workbox-window` to dependencies before building.

- [ ] 📌 **React ref lint rule** → **Promote to memory** (type: feedback)
  > **Why**: React 19's eslint-plugin-react-hooks now flags reading `ref.current` during render as a lint error (previously a warning). The `shrink-0 px-4 py-2` pattern of passing `bannerRef.current?.offsetHeight` as a prop during render broke.
  > **How to apply**: When measuring DOM element dimensions, store them in state via `useLayoutEffect` first, then pass the state variable as a prop — never read `ref.current` during render.
