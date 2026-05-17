## Design Summary

Eliminate version-tagging bot commits (e.g., `chore(release): 1.1.1 [skip ci]`) from git history by removing the `@semantic-release/changelog` and `@semantic-release/git` plugins. The version will be read at build time via `git describe --tags --abbrev=0` instead of from `package.json`, so the version shown in the Settings page still works. Tags and GitHub Releases remain intact; the one and only Semantic Release side effect becomes the GitHub Release + tag.

## Alternatives Considered

### Alternative A: Keep current setup
- **Approach**: Status quo — Semantic Release commits `package.json` and `CHANGELOG.md` back to the repo.
- **Pros**: Works today, no changes needed.
- **Cons**: Pollutes commit history with bot commits; each release adds a commit that has zero signal for human readers.
- **Rejected because**: The user explicitly wants clean history.

### Alternative B: Remove version display entirely
- **Approach**: Delete the version display from the Settings page so there's no need to inject a version at build time.
- **Pros**: Simplest possible change; no need for `__APP_VERSION__` at all.
- **Cons**: Loses user-facing version info; requires test changes.
- **Rejected because**: Losing the version display is a regression — users should see what version they're running.

### Alternative C: Inject version from Git tags at build time (Agreed Approach)
- **Approach**: Remove `@semantic-release/changelog` and `@semantic-release/git` from `.releaserc.json`. Replace `pkg.version` in `vite.config.ts` with `git describe --tags --abbrev=0` (falling back to `0.0.0`). Update `vitest.config.ts` similarly. Keep `@semantic-release/npm` (with `npmPublish: false`) so the version is bumped in the CI runner's temporary `package.json` (which is discarded). Tags and releases are still created by `@semantic-release/github`.
- **Pros**: Zero bot commits; version still shown in Settings; leverages git tags which already exist.
- **Cons**: Requires test mocking for CI environments without tags; minor build logic change.
- **Why chosen**: Cleanest approach — no regressions, minimal changes, aligns with user's requirement.

## Agreed Approach

Alternative C: Read version from `git describe --tags --abbrev=0` at build time. Remove changelog and git plugins from release config. Keep `@semantic-release/npm` for version bumping (discarded after CI run). Update `vite.config.ts` and `vitest.config.ts` to call `execSync` instead of importing `package.json`. Update test to mock the git call.

## Key Decisions

1. `package.json` stays at `0.0.0` in the repo — version comes from git tags only.
2. `@semantic-release/npm` stays — it bumps `package.json` during the CI run but is never committed.
3. `deploy.yml` already has `fetch-depth: 0` — no change needed there.
4. Test: The `__APP_VERSION__` in tests will be set via Vitest's `define` just like today. The version string will come from the same `execSync` call, with fallback to `0.0.0`. In test environments without git tags, the fallback works fine.
5. `CHANGELOG.md` is no longer generated locally — the GitHub Release serves as the canonical changelog.

## Open Questions

- Should the fallback version be `0.0.0-dev` instead of `0.0.0` to make it more obvious when the version couldn't be resolved? → Deferred to implementation review.
