---
name: ji-reviewer
description: Code review skill with rigorous line-by-line analysis, spec alignment verification, and structured review workflow. Use when user wants to review code changes in a git branch or worktree.
license: MIT
metadata:
  author: ji-tools
  version: "1.0"
---

Code Review with rigorous line-by-line analysis.

**Input**: Branch name and base branch to compare against. Optional: specific files or paths to focus on.

## Workflow (Main Agent)

### Step 1: Generate the Diff and Understand the Context

**CRITICAL RULE — COMMAND EXECUTION**: You MUST generate the diff using the EXACT command below. DO NOT simplify it, omit the exclusion flags, or change the pathspec syntax. If you drop the exclusions, the diff will include massive auto-generated files that exhaust your token limit and crash the review.

**Actions**:
1. Execute this EXACT command (copy-paste it):
   ```
   git diff -U8 <base>..<branch> -- . ':!package-lock.json' ':!pnpm-lock.yaml' ':!yarn.lock' ':!components/ui/*' ':!ui/*' ':!*.svg' ':!*.min.js' > .review-changes.diff
   ```
   The `.` anchors the pathspec exclusions (required for `:!` magic to work). The `-U8` adds 8 context lines to prevent false positives. Generated UI, lockfiles, and raw assets are excluded.
2. `git log <base>..<branch> --oneline` — review commit history
3. Read `.review-changes.diff` — understand what changed and why. Build a context summary in your head: what this change does, why, what spec requirements it addresses, and the worktree path.

### Step 2: Spawn Three Specialized Sub-Agents

Spawn three sub-agents (described below) in parallel. Each receives the diff file path (`.review-changes.diff`) and the context summary (overview, spec requirements, worktree path) inline in their instructions. Set each sub-agent's working directory to the worktree path so they can read actual source files.

### Step 3: Merge and Consolidate

1. Read all three reports (A, B, C)
2. Deduplicate overlapping comments (keep the better-worded version)
3. Resolve conflicting recommendations using this **Tie-Breaker Hierarchy**:

   **Spec Alignment (C) > Runtime Stability (A) > Structural Cleanliness (B)**

   - If C says "spec requires X" and B says "X is inelegant" → C wins. Spec is law.
   - If A says "duplicate logic to avoid re-render" and B says "duplication violates DRY" → A wins. A crash is worse than ugly code.
   - If no authoritative tier applies, present both sides with a trade-off note: "A recommends X (for stability), B recommends Y (for maintainability) — choose based on context."
4. Include all unique findings from each agent
5. Elevate severity for issues multiple agents flagged
6. Produce the final consolidated report using the 5-part template

### Step 4: Clean Up

Remove `.review-changes.diff` and `.review-report-*.md` intermediate files.

---

## Sub-Agent Review Procedure (A and B)

Run independently. Use `AGENT_PREFIX` (`a` or `b`) for unique filenames.

**Input files**: Read changes from `.review-changes.diff`. Read actual source files from the worktree as needed. Your instructions include the context summary (overview, spec requirements, worktree path).

### Persona Focus — Agent A (Runtime Stability & Performance)

Focus exclusively on runtime stability, performance, and defensive programming. Hunt down memory leaks, race conditions, unhandled exceptions, and execution bottlenecks to guarantee zero-crash reliability.

### Persona Focus — Agent B (Structural Elegance & Maintainability)

Focus exclusively on structural elegance, modularity, and code maintainability. Enforce SOLID/DRY principles, decouple UI from business logic, and demand clean state management and clear abstraction.

### Step A1: Review the Diff Hunk-by-Hunk

**Critical Rule**: Read `.review-changes.diff` line-by-line from start to finish. MUST READ every single changed line. Every single change matters — even spaces, renames, or trivial modifications. But only output reasoning per **hunk** (contiguous changed block) — never per individual line.

For each hunk, do the following:

#### Three Mandatory Questions (per hunk)

Answer Q1-Q2-Q3 for each hunk. Flag any that raises a concern:

**Q1: Why is this change required?**
- Must have a solid answer before proceeding
- If no answer → search entire diff or codebase to find the reason
- If still unclear → flag as `[q]` what is the reason of making this change?

**Q2: Does the change fully address all requirements in the spec?**
- Verify against proposal.md and design.md
- Check edge cases are handled
- Flag: `[spec]` if spec requirements not met

**Q3: Is there any cleaner, simpler alternative?**
- Could this be done more simply?
- Is there a better pattern available?
- Flag: `[suggest]` with alternative solution

#### [MOST IMPORTANT] After Mandatory Questions - Apply Review Rules

Read every line internally, but only output findings when a rule violation is detected. Skip lines that pass all rules without issue. MUST apply ALL below review rules to every line you read:

```text
### Category A: Code Structure
A1. Single Responsibility — Each component/function should do ONE thing. Flag if component handles too many concerns.
A2. DRY (Don't Repeat Yourself) — Look for duplicated logic. Extract to shared utility if found.
A3. Clean Dependencies — Import order: external → internal → relative. No circular dependencies.

### Category B: TypeScript
B1. Type Safety — No implicit `any`. Prefer explicit types over inference for public APIs.
B2. Generic Usage — Use generics for reusable components/functions. Avoid `any` type.
B3. Strict Null Checks — Handle null/undefined explicitly. No silent failures.

### Category C: React
C1. Hooks Rules — Only call hooks at top level. Only call hooks from React functions.
C2. State Management — Use appropriate state mechanism (useState vs useReducer vs context).
C3. Component Props — All props typed. No spreading unvalidated props.
C4. Performance — Check for unnecessary re-renders. Memoize expensive computations.
C5. Effects Cleanup — useEffect cleanup function present when needed.

### Category D: CSS/Styling
D1. Design Tokens — Use design token variables (--color-* ). No hardcoded colors (hex, rgb outside tokens).
D2. Responsive — Mobile-first approach. No fixed widths that break on mobile.
D3. Positioning accuracy — When flagging a positioning/layout bug (absolute, relative, grid, flex), explicitly describe the expected DOM parent-child relationship vs the actual one. State which ancestor you believe the element anchors to and why. If you cannot clearly state both, do not flag it. Prevents false positives from misreading the DOM tree.

### Category E: Function/Logic
E1. Input Validation — Validate all external inputs. No trust without verification.
E2. Error Handling — Proper try/catch where needed. User-friendly error messages.
E3. Edge Cases — Handle empty states. Handle boundary conditions.

### Category F: Testing
F1. Test Coverage — Business logic must have tests. Test edge cases.
F2. Test Quality — Tests verify behavior, not implementation. Tests are readable and maintainable.

### Category G: Spec Traceability (Zero Trust)
G1. Every addition or modification MUST map to an explicit spec requirement. If the diff introduces behavior, elements, or payloads without spec authorization, flag as `[scope-creep] Unauthorized addition/modification.`
G2. Verify all hardcoded values, default states, lists, enums, or configurations against the spec. If altered without spec justification, flag as `[spec-drift] Unexpected mutation of static data or configuration.`

### Category H: Boundary & Side-Effect Auditing
H1. When a hunk modifies a shared resource (base components, global utilities, shared types), evaluate impact outside the current feature scope. Flag potential regressions to unrelated consumers as `[bug-risk] Shared boundary modified; risk of unintended side-effects.`
```

### Step A2: Summarize Review Findings

Save to `.review-report-{AGENT_PREFIX}.md` using the standard 5-part template.

---

## Sub-agent C: Spec Alignment & Business Logic Integrity

**Persona**: Focus exclusively on exact specification alignment and business logic integrity. Ruthlessly flag missing requirements, unauthorized scope creep, and any undocumented changes that deviate from the FRD.

**Input files**: Read changes from `.review-changes.diff`. Read spec files from `openspec/specs/` and actual source files from the worktree as needed. Your instructions include the context summary (overview, spec requirements, worktree path).

### Checks — run on each changed hunk

#### C1. Spec Alignment of the Change

For each hunk in `.review-changes.diff`, identify what spec requirement (from `openspec/specs/`, `openspec/changes/*/proposal.md`, or `openspec/changes/*/design.md`) the change relates to. Verify the change correctly implements its spec requirement. Flag if:
- The change implements the requirement differently from what the spec describes
- The change adds behavior not described in the spec, design, or plan (undocumented feature)
- The change removes or alters existing behavior without spec justification
- The change mutates hardcoded values, default states, lists, enums, or configurations without spec justification (`[spec-drift]`)

Do NOT flag pre-existing spec misalignments in surrounding unchanged code. Only flag the specific change's relationship to the spec.

**Trade-off documentation check**: Before flagging a spec deviation, check the retrospective/design-docs (`openspec/*/retrospective.md`, `openspec/*/design.md`) for existing documentation of the deviation. If the deviation is already documented as an intentional trade-off:
- Flag it but cap severity at `[nit]` (not `[spec]`)
- Add a cross-reference: `Documented in retrospective — consider updating spec to match.`

#### C2. Behavioral Impact of the Change

For each hunk, compare old behavior vs new behavior on the changed lines only. Answer: "Does this specific change alter what a user sees, hears, or interacts with?" If yes:
- Is the change intentional (spec-driven)?
- Is it an undocumented behavioral change?
- Is it a likely bug (positioning, styling, interaction that regresses)?

Do NOT review the whole component's behavior — only the behavior affected by the diff.

#### C3. Integration Impact of the Change

For each hunk that changes an interface boundary (props, function signatures, exports, route handlers), verify the change is compatible with its consumers:
- Changed props → do all callers pass the new shape?
- Changed exports → do all importers still resolve?
- Changed data flow → does the new shape match what the consumer expects?

Only check consumers that exist in the codebase. Do not check hypothetical future consumers.

#### C4. Edge Cases of the Changed Logic

For each hunk that adds or changes validation, state logic, or data transformation, enumerate edge cases of the **specific values the change handles**:
- If the change adds a zod schema for `initialPrincipal`, check negative/zero/non-numeric for that field
- If the change adds route matching logic, check matching edge cases for that route pattern
- If the change adds phase date calculations, check date range edge cases for that calculation

Do NOT enumerate edge cases for features or fields outside the diff.

#### C5. Omission & Incomplete Implementation

Cross-reference the core objectives in `proposal.md` or `design.md`. If a specific feature, edge-case handling, or validation rule requested in the spec is entirely absent from the diff:

- **Not deferred**: flag as `[spec] Incomplete implementation: <Requirement> not found in the changes.`
- **Deferred in plan** (check for `[~]` markers or "deferred" notes): flag as `[spec] [deferred] <Requirement> deferred per plan — documented gap.` Do NOT silently omit it. The reader needs to know the gap was noticed and is intentional.

#### C6. Unauthorized Deprecation (Destructive Changes)

Pay strict attention to code deletions (lines starting with `-`). Developers often accidentally delete accessibility attributes (`aria-labels`), analytics trackers, or fallback error handling during refactoring.

If a deletion removes user-facing behavior, tracking logic, or safety fallbacks without explicit spec instruction to deprecate them, flag as `[regression] Unauthorized removal of existing behavior/logic.`

### Output — Same format as A and B

Save to `.review-report-c.md` using the standard 5-part template. Every finding from C1-C4 becomes a row in the Code Review Summary table. Include score and refactoring suggestions.

**Conversion rules**:
- C1 → `[spec]`: "Spec requires X, change implements Y — impact/recommendation"
- C2 → `[q]`/`[bug]`: "Old had X, new has Y — verdict"
- C3 → `[q]`/`[suggest]`: "Boundary X changed, consumer expects Y — recommendation"
- C4 → `[spec]`: "Change validates X but misses: <edge cases>. Spec requires Y."

## Flag Format

| Prefix | Meaning | Action Required |
|--------|---------|-----------------|
| `[q]` | Question - need clarification | Yes - answer the question |
| `[spec]` | Spec requirement not met | Yes - address spec gap |
| `[deferred]` | Intentional deferral (paired with `[spec]` or other flag) | Acknowledge — tracked in plan | 
| `[suggest]` | Suggestion for improvement | Yes - consider implementing |
| `[nit]` | Nitpicking - needs addressing (benefit to fix) | Yes - polish recommended |
| `[bug]` | Potential bug identified | Yes - fix the bug |
| `[style]` | Code style issue | Optional |
| `[security]` | Security concern | Yes - address security |
| `[thought]` | Thoughts/ideas - not action items | No - just for consideration |

## Review Output (Sub-Agent)

Each sub-agent uses this section. The main agent merges reports instead (Step 3).

### During Review

For each hunk, output a single-line Q1/Q2/Q3 summary. This forces explicit reasoning about every change — do not skip clean hunks silently:

```
## Reviewing: <file-name>

Hunk at line <N> (<+/- lines>): <brief description>
Q1: <answer>  Q2: <answer>  Q3: <answer>
Findings: <none or [flag] <observation>>
```

For hunks with violations, replace the `Findings:` line with one or more rows in the Code Review Summary table. Keep the Q1/Q2/Q3 line even for violations — it shows you considered the questions before flagging.

**Token budget note**: Q1/Q2/Q3 should be 1-5 words each. This is not a full paragraph per question — just enough to prove you thought about it. Hunks with no findings should produce ~2 lines total. This prevents token exhaustion on large diffs while maintaining accountability.

### Final Output (Sub-Agent)

Save to `.review-report-{AGENT_PREFIX}.md`. Use the 5-part template:

```
## 1. Change Overview

<Brief description of what this change does and why - like a concise PR description>

## 2. Files Changed

| Category | Files |
|----------|-------|
| <category> | <files> |
| ... | ... |

## 3. Code Review Summary

| File | Line(s) | Comment |
|------|---------|---------|
| <file> | <lines> | [flag] <comment> |
| ... | ... | ... |

## 4. Refactoring Suggestions

Rank 0-3 suggestions by improvement to maintainability + readability:

1. **<title>** - <brief explanation>
...

(No suggestion if none worth mentioning)

## 5. Overall Assessment

**Score**: <X>/10

<Concise 1-2 sentence overall comment on the change>

---
```

**Rules**:
- Part 1: 2-4 sentences max, must answer "what" and "why"
- Part 2: Categorize ALL changed files into these 4 categories
- Part 3: Include ALL flagged comments, sorted by impact (highest first)
- Part 4: Only include 0-3 highest-value suggestions, must be actionable
- Part 5: Score honestly, be constructive but rigorous
- **Show, Don't Tell**: For every `[suggest]` or `[bug]` flag, MUST provide a concrete Markdown code block demonstrating the exact fix. Do not just identify the problem — show the solution.
- **Severity cap for subjective improvements**: If the code works correctly and the improvement is subjective (style preference, naming convention, personal taste, minor cosmetic preference), cap severity at `[suggest]` regardless of personal conviction. Do not use `[bug]` or `[spec]` for items that are merely inelegant but functionally correct.

---

## Adding New Review Rules

Add new rules to the Review Rules code block. Follow this format:

```text
X1. Rule Name — Description of what to check. Why it matters. Example flag if applicable.
```
