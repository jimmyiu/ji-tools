# Retrospective: history-clean-versioning

> Written: 2026-05-18 (after verify passed)
> Commit range: `a26b7b0..HEAD` (0 commits — changes uncommitted)
> Worktree: main checkout (no worktree used)

---

## 0. Evidence

- **Commit range**: `a26b7b0..HEAD` (implementation not yet committed)
- **Diff size**: +20 / -120 lines across 6 files
- **Tasks done**: 8/8 (`grep -cE '^\s*- \[x\]' tasks.md` → 8)
- **Active hours**: ~0.5
- **Subagent dispatches**: 0 (direct implementation in main session)
- **New external dependencies**: none (removed `@semantic-release/changelog` and `@semantic-release/git`)
- **Bugs encountered post-merge**: n/a (not yet merged)
- **OpenSpec validate state at archive**: not yet archived
- **Test coverage signal**: 70/70 vitest pass, build succeeds

Commit chain (時序):

```
(no new commits — changes staged/working tree only)
```

---

## 1. Wins

- [evidence: tasks.md:3-5] Tasks 1.1-1.3 completed in one pass — release config change was straightforward, no surprises.
- [evidence: tests pass 70/70] Both `vite.config.ts` and `vitest.config.ts` updated with identical helper function; all existing tests passed without modification.
- [evidence: diff +20/-120] Net reduction of 100 lines — clean removal of unused plugins, changelog file, and lockfile churn.

## 2. Misses

- (none observed)

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| (none) | All tasks executed as specified | — |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        | ✓ |
| superpowers:writing-plans                        | ✓ |
| superpowers:using-git-worktrees                  | ✗ |
| superpowers:subagent-driven-development          | ✗ |
| (transitive) superpowers:test-driven-development | ✗ |
| (transitive) superpowers:requesting-code-review  | ✗ |
| superpowers:finishing-a-development-branch       | ✗ |

> **Default expectation**: 全部 ✓。每個 skill 都是 schema 設計的一部分,
> 跳過屬於異常情境。任一項 ✗ 都必須在下方
> `### Deliberately Skipped Skills` subsection 提出原因與預防方案。

### Deliberately Skipped Skills

- **`superpowers:using-git-worktrees`**
  - **What was skipped**: Entire skill — no isolated worktree was created; implementation was done directly in the main workspace.
  - **Why this cycle**: The change touches only 3 source files (`.releaserc.json`, `vite.config.ts`, `vitest.config.ts`) plus 2 trivial deletions (`CHANGELOG.md`, `pnpm remove`). Risk of breaking the main workspace was negligible. The openspec-ff-change flow created all artifacts in the main checkout, and implementation followed immediately. Creating a worktree would have added ~30s overhead with zero marginal safety benefit.
  - **How to prevent recurrence**: `scope-judgment rule` — a change touching ≤4 config/build files with no runtime code changes is a valid boundary case for skipping worktree isolation. If the change modifies runtime code (`src/`), tests, or introduces new dependencies, the worktree MUST be used.

- **`superpowers:subagent-driven-development`** (+ transitive TDD + code-review)
  - **What was skipped**: Entire skill chain — no subagents were dispatched; all 8 tasks were executed inline in the same session.
  - **Why this cycle**: The change is purely mechanical (config edits, dependency removal). Each task is 1-2 file edits with unambiguous outcomes (remove plugin, change import, run command). Dispatching a subagent per task would have added more overhead than the implementation itself. The `pnpm test` and `pnpm build` verify steps are functionally equivalent to the TDD red-green-refactor cycle at this scale.
  - **How to prevent recurrence**: `scope-judgment rule` — tasks that are exclusively mechanical (config changes, dependency removals, import replacements) with no new logic, branching, or state can skip subagent dispatch. Any task involving new functions, components, or conditional logic MUST use subagent-driven-development with TDD.

- **`superpowers:finishing-a-development-branch`**
  - **What was skipped**: Entire skill — no branch has been finalized or PR created.
  - **Why this cycle**: The implementation artifacts (verify, retrospective) are being created before branching/PR. The finishing step will be invoked after archive.
  - **How to prevent recurrence**: This is expected sequencing — finishing-a-development-branch is the final step after archive, not a should-have-been-done-alongside skill. `one-off — schema boundary case, no prevention possible` — this will be invoked at the correct point in the flow.

## 5. Surprises

- (none observed — all behaved as expected)

## 6. Promote candidates → long-term learning

- [ ] 📌 **Small config-only changes can skip worktree + subagent overhead** → **Promote to memory** (type: feedback)
  > **Why**: This cycle demonstrated that 3-file config changes with trivial edits don't benefit from worktree isolation or subagent dispatch. The overhead exceeds the implementation cost.
  > **How to apply**: Before starting implementation, estimate scope: if changes are exclusively config/build files with no runtime code, consider direct implementation. If runtime code (`src/`) is touched, use the full skill chain.

- [ ] 📌 **OpenSpec superpowers-bridge schema expects full skill chain for all changes** → **One-off** (記錄即可,不 promote)
  > **Why**: The schema is designed for multi-file feature work where TDD and subagents add rigor. Config-only changes are a boundary case that doesn't fit neatly.
  > **How to apply**: Accept that small config changes will incur some process overhead in this schema, or use the spec-driven schema for such changes instead.
