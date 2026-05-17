## ADDED Requirements

### Requirement: semantic-release MUST calculate version from conventional commits
On every push to the `main` branch, the system SHALL analyze commit messages since the last release using `@semantic-release/commit-analyzer` and determine the next semantic version: `feat:` commits trigger a minor bump, `fix:` commits trigger a patch bump, and `BREAKING CHANGE:` in the body or footer triggers a major bump.

#### Scenario: Feature commit triggers minor version bump
- **WHEN** a commit with message `feat: add currency converter` is pushed to `main` and the current version is `1.0.0`
- **THEN** semantic-release calculates the next version as `1.1.0`

#### Scenario: Fix commit triggers patch version bump
- **WHEN** a commit with message `fix: resolve header flicker` is pushed to `main` and the current version is `1.1.0`
- **THEN** semantic-release calculates the next version as `1.1.1`

#### Scenario: Breaking change triggers major version bump
- **WHEN** a commit with body containing `BREAKING CHANGE: API redesign` is pushed to `main` and the current version is `1.1.0`
- **THEN** semantic-release calculates the next version as `2.0.0`

#### Scenario: No relevant commits results in no-op
- **WHEN** only `chore:` or `docs:` commits are pushed to `main` since the last release
- **THEN** semantic-release performs no version bump, creates no release, and the release job succeeds

---

### Requirement: semantic-release MUST update package.json version
After determining the next version, `@semantic-release/npm` SHALL write the new version into `package.json`. The plugin MUST be configured with `npmPublish: false` so that no package is published to the npm registry.

#### Scenario: Version written to package.json without publishing
- **WHEN** semantic-release determines the next version is `1.2.0`
- **THEN** `package.json` `version` field is updated to `1.2.0` and no package is published to npm

---

### Requirement: semantic-release MUST generate and update CHANGELOG.md
`@semantic-release/changelog` SHALL create or update `CHANGELOG.md` in the repository root with release notes generated from conventional commit messages.

#### Scenario: CHANGELOG.md created on first release
- **WHEN** semantic-release runs for the first time and no `CHANGELOG.md` exists
- **THEN** `CHANGELOG.md` is created with an entry for version `1.0.0` containing the release notes

#### Scenario: CHANGELOG.md updated on subsequent release
- **WHEN** semantic-release creates version `1.1.0` and `CHANGELOG.md` already exists with a `1.0.0` entry
- **THEN** a new `1.1.0` entry is prepended to `CHANGELOG.md` above the existing `1.0.0` entry

---

### Requirement: semantic-release MUST create a GitHub Release
`@semantic-release/github` SHALL create a formal GitHub Release on the repository with the version tag and auto-generated release notes.

#### Scenario: GitHub Release created with version tag
- **WHEN** semantic-release determines the next version is `1.2.0`
- **THEN** a GitHub Release titled `v1.2.0` is created with a git tag `v1.2.0` and release notes derived from commits

---

### Requirement: semantic-release MUST commit version changes back to main
`@semantic-release/git` SHALL commit the updated `package.json` and `CHANGELOG.md` back to the `main` branch. The commit message MUST include `[skip ci]` to prevent re-triggering the release workflow.

#### Scenario: Version bump commit includes skip ci tag
- **WHEN** semantic-release commits the updated `package.json` and `CHANGELOG.md` to `main`
- **THEN** the commit message contains `[skip ci]` and does not trigger the release workflow again

---

### Requirement: release workflow MUST orchestrate release then deploy
A new `release.yml` workflow SHALL be the sole entry point for production deployments. It MUST trigger on push to `main`, run semantic-release, and then call `deploy.yml` via `workflow_call` with `ref: main` to ensure the deploy uses the post-bump commit.

#### Scenario: Push to main triggers release then deploy
- **WHEN** a commit is pushed to `main`
- **THEN** the release job runs semantic-release, and upon success, the deploy job calls `deploy.yml` with `ref: main`

#### Scenario: Semantic release failure blocks deploy
- **WHEN** semantic-release fails during the release job
- **THEN** the deploy job is not executed (`needs: release`)

#### Scenario: No-op release still deploys
- **WHEN** semantic-release determines no version bump is needed (no relevant commits)
- **THEN** semantic-release exits successfully and the deploy job still runs, deploying the current version

---

### Requirement: deploy.yml MUST be a reusable workflow with no push triggers
`deploy.yml` SHALL accept `workflow_call` only, removing all push triggers. It MUST accept an optional `ref` input and use `ref: ${{ inputs.ref || github.sha }}` in the checkout step to ensure the correct commit is deployed.

#### Scenario: Deploy called with specific ref
- **WHEN** `release.yml` calls `deploy.yml` with `ref: main`
- **THEN** the checkout step uses `ref: main`, fetching the post-bump commit

#### Scenario: Deploy called without ref falls back to triggering SHA
- **WHEN** `deploy.yml` is called without a `ref` input
- **THEN** the checkout step uses `github.sha` as a fallback

---

### Requirement: release MUST only occur on the main branch
The `release.yml` workflow configuration MUST restrict semantic-release to the `main` branch. Commits on any other branch MUST NOT trigger a release.

#### Scenario: Push to develop does not trigger release
- **WHEN** a commit is pushed to `develop`
- **THEN** no release workflow runs and no version bump occurs

#### Scenario: Push to main triggers release
- **WHEN** a commit is pushed to `main`
- **THEN** the release workflow runs semantic-release against `main`