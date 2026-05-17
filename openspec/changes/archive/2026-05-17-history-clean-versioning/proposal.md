## Why

Every semantic-release run creates a `chore(release): x.y.z [skip ci]` commit that bumps `package.json` and updates `CHANGELOG.md`. For a pure frontend app where the only consumer of version info is the Settings page, these bot commits add noise to the git history with no signal value. GitHub Releases already provide a clean, browsable record of each version. Removing the git plugin eliminates these commits while preserving tags, releases, and the version display.

## What Changes

**Release plugins**

- From: `.releaserc.json` uses `@semantic-release/changelog` and `@semantic-release/git` to write CHANGELOG.md + bump package.json on every release
- To: Only `@semantic-release/commit-analyzer`, `@semantic-release/release-notes-generator`, `@semantic-release/npm` (npmPublish: false), and `@semantic-release/github`
- Reason: No more bot commits; tags + GitHub Releases are sufficient
- Impact: Non-breaking, CI-only change

**Version injection**

- From: `vite.config.ts` and `vitest.config.ts` import `pkg.version` from `package.json`
- To: Both configs call `git describe --tags --abbrev=0` via `execSync`, falling back to `'0.0.0'` if no tags exist
- Reason: `package.json` stays at `0.0.0` in the repo; version comes from git tags
- Impact: Non-breaking, build-time only

**Changelog**

- From: `CHANGELOG.md` generated locally and committed
- To: No local `CHANGELOG.md`; GitHub Releases serve as the canonical changelog
- Reason: Eliminates the file + the commit that writes it

## Capabilities

### New Capabilities

- `git-tag-version`: Read app version from git tags (`git describe --tags --abbrev=0`) at build time, falling back to `'0.0.0'` when no tags exist

### Modified Capabilities

- (none — no existing spec files change their requirements)

## Impact

- `.releaserc.json` — remove 2 plugins, keep 4
- `vite.config.ts` — replace `pkg.version` with `execSync` call
- `vitest.config.ts` — same replacement
- `src/pages/Settings.test.tsx` — test already works via Vitest `define`; no change needed if fallback `0.0.0` is acceptable
- `CHANGELOG.md` — no longer generated; can be deleted from repo
- `deploy.yml` — already has `fetch-depth: 0`; no change needed
- `release.yml` — no change needed
