## 1. Version Injection (Frontend)

- [x] 1.1 Create `src/vite-env.d.ts` declaring `__APP_VERSION__` as a global `string` constant (actual file: `src/types/app.d.ts` per project convention)
- [x] 1.2 Update `vite.config.ts` to import `package.json` and add `define: { __APP_VERSION__: JSON.stringify(pkg.version) }`
- [x] 1.3 Update `src/pages/Settings.tsx` to replace the hardcoded `0.0.0` with `{__APP_VERSION__}`
- [x] 1.4 Verify build output inlines the version string correctly (`pnpm build` then check dist for quoted version)

## 2. semantic-release Configuration

- [x] 2.1 Install semantic-release and plugins as devDependencies: `semantic-release`, `@semantic-release/commit-analyzer`, `@semantic-release/release-notes-generator`, `@semantic-release/changelog`, `@semantic-release/npm`, `@semantic-release/git`, `@semantic-release/github`
- [x] 2.2 Create `.releaserc.json` with 6 plugins in order (commit-analyzer → release-notes-generator → changelog → npm → git → github), `npmPublish: false`, branch config for `main` only, and `[skip ci]` in git commit message
- [x] 2.3 Verify `.releaserc.json` is valid by running `npx semantic-release --dry-run` locally (expects no previous release, should exit without error; missing `GITHUB_TOKEN` errors are expected locally — the real token is provided by GitHub Actions)

## 3. Release Workflow

- [x] 3.1 Create `.github/workflows/release.yml` with push trigger on `main`, `contents: write` permission, release job running `npx semantic-release` with `GITHUB_TOKEN`, and deploy job calling `deploy.yml` via `workflow_call` with `ref: main`
- [x] 3.2 Refactor `.github/workflows/deploy.yml` to remove all `push` triggers, add `workflow_call` with `ref` input, and update checkout step to use `ref: ${{ inputs.ref || github.sha }}`
- [x] 3.3 Verify `release.yml` and `deploy.yml` syntax with a YAML linter or `actionlint`

## 4. Testing & Validation

- [x] 4.1 Add a unit test for the Settings component asserting it renders `__APP_VERSION__` (not hardcoded `0.0.0`)
- [x] 4.2 Run `pnpm build` locally and verify `__APP_VERSION__` is correctly inlined as a quoted string in the output
- [x] 4.3 Run `pnpm test` and `pnpm run lint` to ensure no regressions
- [ ] 4.4 Merge to main and verify the release workflow triggers semantic-release (creates GitHub Release, updates CHANGELOG.md, bumps package.json) — **REMOTE OPERATION** (requires PR + merge to main)