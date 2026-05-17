# version-injection Specification

## Purpose
TBD - created by archiving change automated-frontend-versioning. Update Purpose after archive.
## Requirements
### Requirement: Vite MUST inject the app version at build time

`vite.config.ts` SHALL use `git describe --tags --abbrev=0` via Node.js `execSync` to determine the app version at build time, with the `v` prefix stripped via `.replace(/^v/, '')`, and inject it as `__APP_VERSION__` via Vite's `define` option. If no git tags exist, the version SHALL fall back to `'0.0.0'`. `vitest.config.ts` SHALL use the same mechanism. The value MUST be wrapped with `JSON.stringify()` to ensure the version is injected as a quoted string literal.

#### Scenario: Version read from git tag during production build
- **WHEN** a production build is run and the latest git tag is `v1.2.0`
- **THEN** the string `"1.2.0"` (without the `v` prefix) is inlined wherever `__APP_VERSION__` is referenced in the built source code

#### Scenario: Version falls back to 0.0.0 when no tags exist
- **WHEN** a build is run in a repository with no git tags
- **THEN** the string `"0.0.0"` is inlined wherever `__APP_VERSION__` is referenced

#### Scenario: Vitest also injects version from git tags
- **WHEN** tests are run via Vitest
- **THEN** `vitest.config.ts` SHALL also use `git describe --tags --abbrev=0` with the same fallback, so `__APP_VERSION__` resolves during test execution

### Requirement: TypeScript declaration MUST exist for __APP_VERSION__
A `src/vite-env.d.ts` file SHALL declare `__APP_VERSION__` as a global `string` constant so that TypeScript provides proper type checking and IDE autocompletion.

#### Scenario: TypeScript recognizes the version constant
- **WHEN** a developer writes `const v: string = __APP_VERSION__` in any `.ts` or `.tsx` file
- **THEN** TypeScript compiles without error and the IDE provides autocompletion for `__APP_VERSION__`

---

### Requirement: Settings page MUST display the injected version
The Settings page SHALL replace the hardcoded `0.0.0` version string with the `__APP_VERSION__` constant. The version MUST be displayed in the existing "版本" row using the same styling as the current hardcoded value.

#### Scenario: Settings page shows current version after build
- **WHEN** the app is built with `package.json` version `1.2.3`
- **THEN** the Settings page renders "1.2.3" in the version row

#### Scenario: Version row styling is unchanged
- **WHEN** the version row is rendered with `__APP_VERSION__`
- **THEN** the styling matches the existing design: `text-sm text-white` inside the existing card layout

