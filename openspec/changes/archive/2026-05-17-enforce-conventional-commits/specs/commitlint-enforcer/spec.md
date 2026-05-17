## ADDED Requirements

### Requirement: Commit messages MUST follow conventional format
The system SHALL reject any commit message that does not conform to the Conventional Commits specification. A valid commit message MUST match the pattern `<type>(<scope>): <description>` where `<type>` is one of the allowed types and `<scope>` is optional.

#### Scenario: Valid commit with type and description
- **WHEN** a developer commits with message `feat: add new savings calculator`
- **THEN** the commit is accepted without error

#### Scenario: Valid commit with type, scope, and description
- **WHEN** a developer commits with message `fix(ui): resolve header collapse jitter`
- **THEN** the commit is accepted without error

#### Scenario: Invalid commit missing type prefix
- **WHEN** a developer commits with message `bump dependencies`
- **THEN** the commit is rejected with an error message indicating the expected format

#### Scenario: Invalid commit using unrecognized type
- **WHEN** a developer commits with message `deps: bump dependencies`
- **THEN** the commit is rejected because `deps` is not a recognized conventional commit type

### Requirement: Commit hook MUST be automatically installed
The system SHALL automatically install git hooks when a developer runs `pnpm install`. This MUST be accomplished via a `prepare` script in `package.json` that runs `husky`.

#### Scenario: Fresh install sets up hooks
- **WHEN** a developer runs `pnpm install` in the repository
- **THEN** the `.husky/commit-msg` hook is created and functional

#### Scenario: Hook runs commitlint on commit
- **WHEN** a developer creates a commit
- **THEN** the `commit-msg` hook invokes `commitlint` with the commit message file before the commit is finalized

### Requirement: Configuration MUST use conventional preset
The commitlint configuration SHALL extend `@commitlint/config-conventional` with no additional custom rules. The configuration file SHALL use the `.cjs` extension to maintain compatibility with the project's ESM module system.

#### Scenario: Configuration file is valid CommonJS
- **WHEN** Node.js loads `commitlint.config.cjs`
- **THEN** it exports a configuration object with `extends: ['@commitlint/config-conventional']`

#### Scenario: All standard types are accepted
- **WHEN** a commit uses any of the standard conventional types (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`)
- **THEN** the commit is accepted
