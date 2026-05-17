## Why

Our automated versioning system relies on commit message format to calculate correct version bumps. Without enforcement, malformed commits like `deps: bump dependencies` slip through and break the release pipeline.

## What Changes

- Add `husky`, `@commitlint/cli`, and `@commitlint/config-conventional` as dev dependencies
- Add `"prepare": "husky"` script to `package.json` for automatic hook installation
- Create `commitlint.config.cjs` extending `@commitlint/config-conventional`
- Initialize Husky and create a `commit-msg` git hook that runs commitlint
- Remove Husky's default `pre-commit` hook (not needed)

## Capabilities

### New Capabilities
- `commitlint-enforcer`: Enforces conventional commit format on all commit messages via a git hook, blocking commits that don't conform

### Modified Capabilities
(No existing specs are modified — this is a new tooling addition)

## Impact

- **Dependencies**: 3 new dev dependencies (`husky`, `@commitlint/cli`, `@commitlint/config-conventional`)
- **Developer workflow**: All contributors must use conventional commit format or the commit is rejected
- **CI**: No CI changes — the hook runs client-side
- **Existing commits**: One historical commit (`deps: bump dependencies`) to be amended to `chore(deps): bump dependencies`
