## Why

ji-tools currently has a hardcoded `0.0.0` version in the Settings page and no automated release process. Every version bump, CHANGELOG update, and GitHub Release must be done manually, which is error-prone and inconsistent — especially since the project already enforces Conventional Commits via commitlint. Automating version management eliminates manual effort, ensures the displayed version stays accurate, and provides users with a clear release history via CHANGELOG and GitHub Releases.

## What Changes

**Version Display**
- From: Settings page shows hardcoded `0.0.0`
- To: Settings page shows the actual version from `package.json`, injected at build time via Vite `define`
- Reason: Users and bug reports need to reference the real app version
- Impact: Non-breaking, UI-only change

**Release Pipeline**
- From: No automated release process; version `0.0.0` in `package.json`; no CHANGELOG; no GitHub Releases
- To: semantic-release on push to `main` automatically calculates version, updates `package.json`, generates `CHANGELOG.md`, and creates GitHub Releases
- Reason: Eliminate manual versioning; leverage existing commitlint enforcement
- Impact: New CI workflow, new config file, new devDependencies

**Deploy Workflow**
- From: `deploy.yml` runs on push to both `main` and `develop`, potentially deploying stale versions
- To: `deploy.yml` is a reusable workflow (`workflow_call` only) called by `release.yml` after a successful release. No independent push triggers.
- Reason: Ensure every production deploy uses the post-bump version; eliminate infinite-loop risk from semantic-release commit-backs
- Impact: Breaking change to CI — `develop` no longer auto-deploys

## Capabilities

### New Capabilities
- `semantic-release`: Automated version calculation and GitHub Release creation on push to main, including CHANGELOG generation and package.json version bump
- `version-injection`: Build-time injection of the app version into the frontend via Vite define, displayed in the Settings page

### Modified Capabilities
- `commitlint-enforcer`: No requirement change — commitlint configuration remains the same. semantic-release consumes the conventional commits that commitlint already enforces.

## Impact

- **New dependencies**: `semantic-release`, `@semantic-release/commit-analyzer`, `@semantic-release/release-notes-generator`, `@semantic-release/changelog`, `@semantic-release/npm`, `@semantic-release/git`, `@semantic-release/github` (all devDependencies)
- **New files**: `.releaserc.json`, `.github/workflows/release.yml`, `src/vite-env.d.ts`, `CHANGELOG.md` (auto-generated)
- **Modified files**: `vite.config.ts` (version injection), `src/pages/Settings.tsx` (consume `__APP_VERSION__`), `.github/workflows/deploy.yml` (refactor to reusable workflow), `package.json` (version managed by semantic-release)
- **CI/CD**: New `release.yml` workflow; `deploy.yml` loses push triggers and becomes reusable only
- **No API or user-facing behavior changes** beyond the version number display