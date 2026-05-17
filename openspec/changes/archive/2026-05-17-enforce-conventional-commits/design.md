## Context

This project uses pnpm 10, ESM (`"type": "module"`), and an automated versioning pipeline that derives semver bumps from commit messages. Commits already informally follow conventional format (`feat:`, `fix:`, `chore:`), but there is no enforcement — invalid prefixes like `deps:` can slip through and confuse the versioning tool.

## Goals / Non-Goals

**Goals:**
- Block non-conventional commits at the git hook level before they enter the repository
- Ensure all contributors (human and AI) follow the same commit format automatically
- Zero-configuration activation: hooks install on `pnpm install` via the `prepare` script

**Non-Goals:**
- Commit linting in CI (client-side hook is sufficient for now)
- Custom commit types beyond the conventional standard set
- Any `pre-commit` linting or test running (separate concern)

## Decisions

1. **`.cjs` config extension** — The project is ESM. Using `.cjs` avoids module interop issues without requiring `export default` syntax.

2. **`@commitlint/config-conventional`** — No custom rules needed. The standard config provides `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

3. **Husky v9+** — De facto standard for git hooks in JS. Integrates with pnpm `prepare` script and handles `.husky/` directory management cleanly.

4. **`npx --no -- commitlint --edit $1`** — Uses locally installed `@commitlint/cli` without prompting.

5. **Remove default `pre-commit` hook** — Husky's `init` creates a placeholder. We only need `commit-msg`.

6. **Fix historical `deps:` commit** — Amend to `chore(deps): bump dependencies` with force push.

## Risks / Trade-offs

- **[Hook bypass]** → Developers can use `--no-verify`. Acceptable — CI-side linting could be added later if this becomes an issue.
- **[`.cjs` in ESM project]** → Slightly inconsistent but minimal concession for tooling compatibility.
- **[Disrupts existing workflow]** → Commitlint gives clear error messages explaining expected format.
