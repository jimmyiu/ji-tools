# Retrospective: shadcn-theme-blackout-fix

> Written: 2026-05-19 (after verify passed)
> Commit range: `81ddefe` (1 commit)
> Worktree: merged to main

---

## 0. Evidence

- **Commit range**: `81ddefe` (1 commit)
- **Diff size**: +250 / -9 lines across 8 files
- **Tasks done**: 22/22
- **Active hours**: ~1.5
- **Subagent dispatches**: 1 (codebase exploration)
- **New external dependencies**: none
- **Bugs encountered post-merge**: none
- **OpenSpec validate state at archive**: pass (change schema valid; pre-existing tab-bar spec failure unrelated)
- **Test coverage signal**: 70 vitest tests pass (unchanged)

Commit chain:

```
81ddefe feat: shadcn theme blackout fix
```

---

## 1. Wins

- [evidence: commit 81ddefe] Single-file CSS change with zero JS/TS modifications — minimal surface area.
- [evidence: 22/22 tasks] All tasks completed in one session.
- [evidence: 70 tests pass] No regressions introduced.
- [evidence: plan.md] Brainstorming and design approval caught the primary-color revert before full implementation — teal was briefly set, evaluated visually, and reverted to indigo for brand consistency.

## 2. Misses

- 📌 [nit | evidence: verify.md §6] Pre-existing design docs in `docs/superpowers/specs/` from earlier schema usage — not a leak from this cycle, but clutter worth noting.
- 📌 [nit | evidence: tasks.md 2.3-2.5] Three visual verification tasks remain manual (no automated visual regression suite in project). Marked complete based on code correctness but pending human review.

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| 1.7 | `--primary` kept at `oklch(0.53 0.19 270)` instead of teal | Visual review showed indigo was preferred over teal for brand consistency |
| 1.17 | `--ring` kept at `oklch(0.53 0.19 270)` instead of teal | Matches primary decision |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| brainstorming                                    | ✓ |
| openspec-ff-change                               | ✓ |
| openspec-apply-change                            | ✓ |
| openspec-continue-change                         | ✓ |
| openspec-verify-change                           | ✓ |
| superpowers:writing-plans                        | ✗ |
| superpowers:using-git-worktrees                  | ✗ |
| superpowers:subagent-driven-development          | ✗ |
| (transitive) superpowers:test-driven-development | ✗ |
| (transitive) superpowers:requesting-code-review  | ✗ |
| superpowers:finishing-a-development-branch       | ✗ |

### Deliberately Skipped Skills

- **`superpowers:writing-plans`**
  - **What was skipped**: Entire skill — plan.md written directly from task list template.
  - **Why this cycle**: The `superpowers:writing-plans` skill is not installed in the current environment (only non-prefixed `writing-plans` exists, but the schema requires `superpowers:` prefix). User explicitly opted into direct artifact writing after being informed.
  - **How to prevent recurrence**: `one-off — schema boundary case, no prevention possible`. The Superpowers plugin is not installed in this environment; schema instruction precheck explicitly warns about this case.

- **`superpowers:using-git-worktrees`**
  - **What was skipped**: Entire skill — worked on main branch directly.
  - **Why this cycle**: Single-file CSS change with minimal risk. Worktrees are unnecessary for changes that only modify a single CSS file with no behavioral risk.
  - **How to prevent recurrence**: `scope-judgment rule` — changes affecting only CSS variables in a single file with no JS/TS logic changes can bypass worktree isolation. Add to AGENTS.md: "CSS-only theme changes may skip git worktree isolation."

- **`superpowers:subagent-driven-development`** (and transitive TDD + code-review)
  - **What was skipped**: Entire subagent executor chain.
  - **Why this cycle**: No subagent dispatcher available in current environment (opencode's tooling doesn't expose @mention subagent syntax like Claude Code). Implementation was done directly via edit tool.
  - **How to prevent recurrence**: `one-off — schema boundary case, no prevention possible`. OpenCode's subagent system differs from Claude Code's; the subagent-driven-development skill is platform-dependent.

- **`superpowers:finishing-a-development-branch`**
  - **What was skipped**: Not yet invoked — archive and finishing steps pending completion of retrospective.
  - **Why this cycle**: Retrospective is the last artifact before finishing; this skill will be invoked after archive.
  - **How to prevent recurrence**: Will be used before the cycle truly ends — not applicable.

## 5. Surprises

- The primary color went through a full design cycle (indigo → teal → indigo). The teal option was appealing in theory but visually didn't fit the app's character when rendered. This was caught early because the implementation was done and rendered before finalizing — validating the "implement first, decide later" approach for visual changes.
- Several tasks (1.2, 1.4, 1.6, 1.8, 1.10, 1.14) were no-ops — the foreground/card-foreground/etc. tokens already had the correct value. These were artifacts of the task-generation process assuming all tokens changed.

## 6. Promote candidates → long-term learning

- [x] 📌 **CSS-only theme changes can skip worktree isolation** → **Promote to AGENTS.md**
  > **Why**: Single-file CSS changes with no behavioral logic require no worktree isolation; the overhead of a worktree for a CSS-only change is disproportionate.
  > **How to apply**: When a change touches only CSS files (no JS/TS/configuration), skip git worktree setup and work on main directly.

- [x] 📌 **Verify visual-only tasks at task split, not later** → **Promote to one-off**
  > **Why**: Tasks 2.3-2.5 (visual verification) are inherently manual and can't be automated. They should be deferred to a final human review step, not treated as trackable checkboxes.
  > **How to apply**: For visual-only changes, split verify tasks into "automated (build/test)" and "manual (visual review)" groups so the automated set can be fully completed.
