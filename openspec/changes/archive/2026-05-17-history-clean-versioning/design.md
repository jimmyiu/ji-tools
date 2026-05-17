## Context

The project uses semantic-release to automate version bumps, changelog generation, and GitHub Releases. Currently, `@semantic-release/git` commits the bumped `package.json` and generated `CHANGELOG.md` back to the repo, creating bot commits in the history. The version is displayed on the Settings page via `__APP_VERSION__`, which is injected at build time from `package.json`.

The goal is to eliminate the bot commits while keeping the version display and the GitHub Release workflow intact. The key insight: for a pure frontend SPA deployed via GitHub Pages, the only consumer of the version number is the Settings page UI. Tags alone are sufficient for CI/CD.

## Goals / Non-Goals

**Goals:**

- Eliminate `chore(release): x.y.z [skip ci]` commits from git history
- Keep the version number displayed on the Settings page
- Keep git tags + GitHub Releases working as before
- Zero changes to the deploy workflow

**Non-Goals:**

- Changing the release cadence or process
- Changing the semantic-release configuration beyond plugin removal
- Modifying any UI component other than the version injection mechanism

## Decisions

1. **Use `git describe --tags --abbrev=0` instead of `pkg.version`** — The git tag is the canonical version source. Both `vite.config.ts` and `vitest.config.ts` will call `execSync` from Node's `child_process` to read it. Fallback to `'0.0.0'` when no tags exist (fresh clone, CI without tags).

2. **Keep `@semantic-release/npm` with `npmPublish: false`** — This plugin still bumps `package.json` on the CI runner, but since `@semantic-release/git` is gone, the bump is never committed. This is a harmless side effect — the file is discarded when the job ends.

3. **Remove `@semantic-release/changelog`** — No `CHANGELOG.md` file is needed on disk. GitHub Releases generate the changelog in the GitHub UI. The `CHANGELOG.md` file in the repo root will be deleted.

4. **Helper function location** — The `execSync` call lives inline in both config files rather than in a shared utility, since Vite/Vitest configs are already standalone and the function is trivial (3 lines).

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `git describe --tags` fails if no tags exist | Simple fallback to `'0.0.0'` |
| CI environments without git history fail | `deploy.yml` already uses `fetch-depth: 0`; `release.yml` also uses `fetch-depth: 0` |
| Test expects exact version string | Vitest `define` will still inject the version; test unchanged as long as fallback logic is consistent |
| `execSync` is sync and blocks Vite startup | Called once at config load time; negligible performance impact (<1ms) |
