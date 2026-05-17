# Enforce Conventional Commits Implementation Plan

> **For agentic workers:** Use subagent-driven-development to implement this plan task-by-task.

**Goal:** Install and configure Husky + Commitlint to enforce conventional commit format via a git commit-msg hook.

**Architecture:** Three moving parts: (1) devDependencies in package.json + prepare script for auto-hook-install, (2) commitlint.config.cjs with @commitlint/config-conventional, (3) .husky/commit-msg hook running commitlint.

**Tech Stack:** Husky v9+, @commitlint/cli, @commitlint/config-conventional, pnpm 10

---

## Task 1: Install Dependencies

- [ ] **Step 1:** Run `pnpm add -D husky @commitlint/cli @commitlint/config-conventional`
- [ ] **Step 2:** In `package.json`, add `"prepare": "husky"` to the `scripts` section (after `"preview"`)

## Task 2: Configure Commitlint

- [ ] **Step 1:** Create `commitlint.config.cjs` at project root:
  ```js
  module.exports = { extends: ['@commitlint/config-conventional'] }
  ```

## Task 3: Set Up Git Hook

- [ ] **Step 1:** Run `pnpm exec husky init` to create `.husky/` directory
- [ ] **Step 2:** Delete `.husky/pre-commit` (default placeholder, not needed)
- [ ] **Step 3:** Create `.husky/commit-msg` with content:
  ```sh
  npx --no -- commitlint --edit $1
  ```

## Task 4: Fix Historical Commit (if needed)

- [ ] **Step 1:** Run `git commit --amend -m "chore(deps): bump dependencies"` on the `deps:` commit
- [ ] **Step 2:** Force push with `git push --force`

## Task 5: Verify

- [ ] **Step 1:** Verify rejection of bad message: `echo "bad message" | pnpm exec commitlint` should exit with non-zero
- [ ] **Step 2:** Verify acceptance of valid message: `echo "feat: test" | pnpm exec commitlint` should exit with zero
