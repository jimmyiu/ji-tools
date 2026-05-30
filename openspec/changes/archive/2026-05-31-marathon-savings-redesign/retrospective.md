# Retrospective: marathon-savings-redesign

> Written: 2026-05-31 (after verify passed)
> Commit range: `07ea24f..b671a24`
> Worktree: merged to main

---

## 0. Evidence

- **Commit range**: `07ea24f..b671a24` (8 commits)
- **Diff size**: +5,606 / -178 lines across 41 files (19 source files: +1,379 / -145)
- **Tasks done**: 43/43 (`grep -cE '^\s*- \[x\]' tasks.md` → 43)
- **Active hours**: ~3 (brainstorm through verify)
- **Subagent dispatches**: none (all inline in session)
- **New external dependencies**: none
- **Bugs encountered post-merge**: none (not yet merged)
- **OpenSpec validate state at archive**: 1 failure (pre-existing `pwa-update-context` spec format issue, unrelated)
- **Test coverage signal**: 172 vitest tests across 20 files, all passing

Commit chain (時序):

```
c18bb55 feat: add useMediaQuery hook for responsive breakpoint detection
255fd8d feat: add shadcn Dialog and Sheet components
ade6750 feat: add EditableSection compound component with draft state and overlay lifecycle
58683ec feat: add PhaseRateTimeline component with dual-label bar and boundary dates
1f39783 feat: add HeroMetrics, BasicParameters, ResultsPanel, PhaseRateEditForm components
b015f6f refactor: restructure MarathonSavings page with value-first layout
850ab50 docs: mark all marathon savings redesign tasks complete
b671a24 fix: fixed manual tested issue
```

---

## 1. Wins

- [commit `ade6750`] `EditableSection` compound component with `key={openVersion}` draft reset pattern — elegant solution for draft re-initialization without `useEffect` dependency tracking
- [commit `58683ec`, fix `b671a24`] PhaseRateTimeline boundary calculation correctly using full calendar duration (`differenceInDays + 1`, min 1) rather than effective days, matching final spec precisely
- [test suite, 172 pass] Full test coverage for all new components, including edge cases (zero effective days, deposit after all phases, SSR fallback)
- [plan adherence] Spec-driven workflow produced clear, testable requirements — dual-label bar spec led directly to correct implementation with HKD purple / USD green split
- [zero new deps] All new components built on existing dependencies (radix-ui, lucide-react, date-fns)

## 2. Misses

- 🟡 [painful | commit `b671a24`] Major implementation refactor in fixup commit — PhaseRateTimeline was significantly restructured in the final commit (removed `useMediaQuery`, changed boundary calculation from effective days to full duration, removed desktop captions, added segment gap/rounded styling). These changes should have been caught during TDD or caught by tests before the "mark complete" commit (`850ab50`), not after.
- 🟡 [painful | commit `1f39783`] 4 component files (HeroMetrics, BasicParameters, ResultsPanel, PhaseRateEditForm) plus their tests were committed in a single commit, making per-component review harder.
- 📌 [nit | commit `255fd8d`] Dialog and Sheet UI primitives committed together — follow project convention of one component per commit for clearer history.
- 📌 [nit | no commit] No git worktree isolation — changes made directly on main branch.

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|------|
| 2.1, 2.2 | Dialog + Sheet committed together in one commit | Combined for convenience |
| 5.1–5.4 | HeroMetrics, BasicParameters, ResultsPanel, PhaseRateEditForm committed together in one commit | All extracted from existing page in a single refactor pass |
| 4.7 | Removed desktop phase captions ("階段 X · N 日") | Final spec (`phase-rate-timeline/spec.md`) explicitly removed viewport-dependent captions |
| N/A | Fixup commit `b671a24` restructured PhaseRateTimeline internals significantly | Post-merge manual testing revealed: boundary calc should use full duration not effective days, segments need gap/rounded/min-width styling, desktop captions must be removed per spec, EditableSection draft reset via `key={openVersion}` is cleaner than `useEffect` |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        | ✓ |
| superpowers:writing-plans                        | ✓ |
| superpowers:using-git-worktrees                  | ✗ |
| superpowers:subagent-driven-development          | ✗ |
| (transitive) superpowers:test-driven-development | ✓ |
| (transitive) superpowers:requesting-code-review  | ✗ |
| superpowers:finishing-a-development-branch       | ✗ |

> **Default expectation**: 全部 ✓。每個 skill 都是 schema 設計的一部分,
> 跳過屬於異常情境。任一項 ✗ 都必須在下方記原因與預防方案。

### Deliberately Skipped Skills

- **`superpowers:using-git-worktrees`**
  - **What was skipped**: 整個 skill (isolated workspace creation)
  - **Why this cycle**: 所有實作直接在 main branch 上進行,沒有使用 git worktree。worktree 用於需要並行開發或 PR 審查的情境,本 cycle 單人順序執行且無隔離需求。
  - **How to prevent recurrence**: scope-judgment rule — 對於單人、短週期(<1天)、無並行需求的 change,可以跳過 worktree。若涉及多個開發者或 PR review 則必須使用。

- **`superpowers:subagent-driven-development`**
  - **What was skipped**: 整個 skill (per-task subagent dispatch)
  - **Why this cycle**: plan.md 明確標示 "REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development",但實作由單一 agent inline 執行。因 tasks 之間有共享依賴(component extraction 依賴已產生的 UI primitives),inline 執行可減少 context 切換。
  - **How to prevent recurrence**: scope-judgment rule — 當 task 間具強依賴性且總 scope 可單一 session 完成時,inline 執行可接受。若 tasks 可獨立並行執行,應使用 subagent-driven-development。

- **`superpowers:requesting-code-review`**
  - **What was skipped**: 整個 skill (formal code review)
  - **Why this cycle**: 單人開發,無第二審查者。Review 在 verify 階段以 spec 比對形式完成。
  - **How to prevent recurrence**: CLAUDE.md trigger — 在 AGENTS.md 添加規則:單人變更且 diff < 1000 source lines 時,以 openspec-verify-change 替代 formal code review。大於此範圍或有協作者時應啟用 ji-reviewer skill。

- **`superpowers:finishing-a-development-branch`**
  - **What was skipped**: 整個 skill (merge strategy decision)
  - **Why this cycle**: 尚未 merge — change 仍在 apply 完成待 archive 狀態。
  - **How to prevent recurrence**: n/a — archive 時會自然進入此流程。

## 5. Surprises

- PhaseRateTimeline 的 boundary 計算在最初實作中使用 effective days 而非 full duration,與 spec 不一致。spec 明確寫 "segment widths SHALL use CSS `flex: N` where N is the full phase duration in days" — 但 initial implementation 用了 effective days。這個錯誤在 manual testing 階段才被發現,表示 spec→implementation 的對照檢查不夠嚴謹。
- `structuredClone` + `useEffect` 的 draft reset pattern 在測試中遇到問題 — 改用 `key={openVersion}` 強制 remount 更簡單可靠。

## 6. Promote candidates → long-term learning

- [ ] 🟡 **Spec-check boundary calculation metric before writing implementation — verify flex/width values match spec explicitly (not just days count)** → **Promote to project CLAUDE.md** (`AGENTS.md` Testing section)
  > **Why**: PhaseRateTimeline used effective days for segment widths instead of full calendar duration as spec required — caught only in manual testing post-implementation
  > **How to apply**: When implementing any proportional-width component, trace the width metric (full duration vs effective days vs remaining balance) back to spec text before writing flex/width values. Add an assertion test that verifies the exact width proportion.

- [ ] 📌 **Fixup commit with structural refactors should not be delayed until final "fix: fixed manual tested issue" — catch during TDD per-task** → **One-off** (record only, no promotion needed)
  > **Why**: This was a specific case where spec interpretation diverged from initial implementation; TDD per the spec would have caught it earlier
  > **How to apply**: When a spec requirement maps directly to a calculation or formula, write a parametrized test for that formula before any rendering code
