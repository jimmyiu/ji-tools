## Design Summary

Add a conventional commit enforcer to the ji-tools repository using Husky + Commitlint. The system blocks non-conventional commit messages at the git hook level, ensuring automated versioning (Semantic Release / Release Please) gets valid commit messages to calculate correct version bumps.

## Alternatives Considered

### Alternative A: GitHub Action CI-only enforcement
- **How**: Lint commit messages in CI via a GitHub Action that runs on pull requests; no local hooks
- **Pros**: No developer machine setup, works regardless of editor/tooling
- **Cons**: Catches issues too late (after push), doesn't prevent bad commits in local history
- **Not chosen**: Catches issues too late; doesn't help when committing or amending locally

### Alternative B: Simple shell hook without commitlint
- **How**: Write a custom shell script in `.git/hooks/commit-msg` that checks regex patterns
- **Pros**: Zero dependencies, simple to understand
- **Cons**: Regex-only validation misses edge cases, no standard config, no community support
- **Not chosen**: Too brittle; commitlint provides comprehensive validation out of the box

### Alternative C: Husky + Commitlint (Agreed)
- **How**: Install `husky` and `@commitlint/cli` as dev dependencies, with a `commitlint.config.cjs` extending `@commitlint/config-conventional`. Husky manages the `.husky/commit-msg` hook that runs commitlint.
- **Pros**: Standard tooling, well-documented, validated edge cases, auto-installs via `prepare` script
- **Cons**: Adds dev dependencies, requires `.cjs` file in ESM project
- **Chosen**: Best balance of reliability, maintainability, and developer experience

## Agreed Approach

Husky v9+ managing a `commit-msg` hook that runs `npx --no -- commitlint --edit $1`. Configuration via `commitlint.config.cjs` extending `@commitlint/config-conventional`. The `prepare: "husky"` script ensures hooks auto-install on `pnpm install`. No pre-commit hook.

### Additional decisions during discussion:
- Use `.cjs` extension for commitlint config (avoids ESM/CJS interop issues)
- Remove Husky's default `pre-commit` hook (keep `.husky/` clean)
- Fix historical `deps: bump dependencies` commit → `chore(deps): bump dependencies` via force push

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Config file extension | `.cjs` | ESM project needs explicit CommonJS for `module.exports` |
| Hook tool | Husky v9+ | Standard, auto-installs via `prepare` script |
| Lint rules | `@commitlint/config-conventional` | Standard conventional types only; no custom rules |
| Command in hook | `npx --no -- commitlint --edit $1` | Uses local install, no prompt |
| Pre-commit hook | Remove | Not needed; linting is separate concern |
| Historical fix | Amend + force push | Single non-conventional commit (`deps:`) needs fixing |

## Open Questions

None — all decisions are resolved.
