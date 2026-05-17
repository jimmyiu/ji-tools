## 1. Release config changes

- [x] 1.1 Remove `@semantic-release/changelog` and `@semantic-release/git` from `.releaserc.json`, keeping only the four listed plugins
- [x] 1.2 Run `pnpm remove @semantic-release/changelog @semantic-release/git` to clean up unused dependencies
- [x] 1.3 Delete `CHANGELOG.md` from the repository root

## 2. Version injection changes

- [x] 2.1 Add `getAppVersion()` helper using `execSync('git describe --tags --abbrev=0')` with `'0.0.0'` fallback and `.replace(/^v/, '')` to strip the `v` prefix in `vite.config.ts`; replace `pkg.version` usage
- [x] 2.2 Add the same `getAppVersion()` helper (with `.replace(/^v/, '')`) in `vitest.config.ts`; replace `pkg.version` usage
- [x] 2.3 Remove `import pkg from './package.json'` from both config files

## 3. Verify

- [x] 3.1 Run `pnpm test` to confirm all tests pass
- [x] 3.2 Run `pnpm build` to confirm the build succeeds with the new version injection
