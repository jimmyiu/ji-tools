## ADDED Requirements

### Requirement: Vite MUST inject the app version at build time
`vite.config.ts` SHALL import `package.json` and use the `define` option to inject `__APP_VERSION__` as a string constant. Because Vite's `define` performs raw text replacement, the value MUST be wrapped with `JSON.stringify(pkg.version)` to ensure the version is injected as a quoted string literal (e.g., `"1.2.3"`) rather than a bare numeric literal (e.g., `1.2.3`), which would cause a syntax error.

#### Scenario: Version constant is available in built code
- **WHEN** a production build is run with `package.json` version `1.2.3`
- **THEN** the string `"1.2.3"` is inlined wherever `__APP_VERSION__` is referenced in the source code

#### Scenario: Version is injected as a string, not a bare number
- **WHEN** Vite processes `define: { __APP_VERSION__: JSON.stringify(pkg.version) }` with `pkg.version` equal to `1.2.3`
- **THEN** the built output contains the string `"1.2.3"` (with quotes), not the bare numeric `1.2.3`

#### Scenario: Version constant falls back gracefully for type safety
- **WHEN** a developer references `__APP_VERSION__` in TypeScript code
- **THEN** the type of `__APP_VERSION__` is `string` as declared in `src/vite-env.d.ts`

---

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