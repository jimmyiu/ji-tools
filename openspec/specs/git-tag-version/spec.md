# git-tag-version Specification

## Purpose
TBD - created by archiving change history-clean-versioning. Update Purpose after archive.
## Requirements
### Requirement: Vite SHALL inject app version from git tags at build time
`vite.config.ts` SHALL use `git describe --tags --abbrev=0` via Node.js `execSync` to determine the app version at build time, and inject it as `__APP_VERSION__` via Vite's `define` option. The `v` prefix from git tags (e.g. `v1.2.0`) SHALL be stripped via `.replace(/^v/, '')` so the displayed version matches the `package.json` format (e.g. `1.2.0`). If no git tags exist, the version SHALL fall back to `'0.0.0'`. The value MUST be wrapped with `JSON.stringify()` to ensure the version is injected as a quoted string literal.

#### Scenario: Version read from git tag during production build
- **WHEN** a production build is run and the latest git tag is `v1.2.0`
- **THEN** the string `"1.2.0"` (without the `v` prefix) is inlined wherever `__APP_VERSION__` is referenced in the built source code

#### Scenario: Version falls back to 0.0.0 when no tags exist
- **WHEN** a build is run in a repository with no git tags
- **THEN** the string `"0.0.0"` is inlined wherever `__APP_VERSION__` is referenced

#### Scenario: Vitest also injects version from git tags
- **WHEN** tests are run via Vitest
- **THEN** `vitest.config.ts` SHALL also use `git describe --tags --abbrev=0` with the same fallback, so `__APP_VERSION__` resolves during test execution

