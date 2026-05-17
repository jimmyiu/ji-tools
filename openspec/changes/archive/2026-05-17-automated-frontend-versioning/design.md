## Architecture

### CI/CD Pipeline

```
push to main
    │
    └──► release.yml workflow
            │
            ├── semantic-release analyzes commits
            ├── determines version bump (major/minor/patch)
            ├── updates package.json version
            ├── generates/updates CHANGELOG.md
            ├── creates GitHub Release
            ├── commits version bump back to main (with [skip ci])
            └── calls deploy.yml (workflow_call)
                    │
                    ├── pnpm install --frozen-lockfile
                    ├── pnpm run build  ← __APP_VERSION__ injected from package.json
                    └── deploy to GitHub Pages
```

### Version Injection

```ts
// vite.config.ts
import pkg from './package.json';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
```

```ts
// src/vite-env.d.ts (new)
declare const __APP_VERSION__: string;
```

```tsx
// src/pages/Settings.tsx
<span className="text-sm text-white">{__APP_VERSION__}</span>
```

### semantic-release Configuration

`.releaserc.json`:
- `@semantic-release/commit-analyzer` — read conventional commits
- `@semantic-release/release-notes-generator` — generate release notes
- `@semantic-release/changelog` — write CHANGELOG.md
- `@semantic-release/npm` — update package.json (`npmPublish: false`)
- `@semantic-release/git` — commit version bump + CHANGELOG back to repo (must include `[skip ci]` in commit message to prevent infinite loops)
- `@semantic-release/github` — create GitHub Release

Branch config: release from `main` only.

### New Workflow: release.yml

```yaml
name: Release
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  deploy:
    needs: release
    uses: ./.github/workflows/deploy.yml
    with:
      ref: main

---
# deploy.yml is now a reusable workflow only — no push triggers
name: Deploy to GitHub Pages
on:
  workflow_call:
    inputs:
      ref:
        required: false
        type: string
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          ref: ${{ inputs.ref || github.sha }}
          fetch-depth: 0

      - name: Security Scan
        uses: gitleaks/gitleaks-action@v2.3.9
        env:
          FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true

      - name: Install pnpm
        uses: pnpm/action-setup@v6
        with:
          version: 10

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install & Build
        run: pnpm install --frozen-lockfile && pnpm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: ./dist

      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

## Components

### Files to Create
- `.releaserc.json` — semantic-release configuration
- `.github/workflows/release.yml` — release + deploy orchestration workflow
- `src/vite-env.d.ts` — TypeScript declaration for `__APP_VERSION__`

### Files to Modify
- `vite.config.ts` — import `package.json` and add `define` with `__APP_VERSION__`
- `package.json` — add semantic-release + plugins as devDependencies
- `src/pages/Settings.tsx` — replace hardcoded `0.0.0` with `{__APP_VERSION__}`
- `.github/workflows/deploy.yml` — refactor to `workflow_call` reusable workflow only (remove all push triggers); checkout step must use `ref: ${{ inputs.ref || github.sha }}`

## Data Flow

1. Developer writes conventional commit message (enforced by commitlint)
2. PR merges to `main`
3. `release.yml` triggers semantic-release
4. semantic-release calculates next version, updates `package.json`, writes `CHANGELOG.md`, creates GitHub Release, commits bump back to `main` (with `[skip ci]` to avoid infinite loops)
5. `release.yml` calls `deploy.yml` via `workflow_call` after successful release
6. `deploy.yml` runs `pnpm build`, which reads `package.json` version via Vite `define`
7. Built app includes `__APP_VERSION__` constant visible in Settings

## Error Handling

- If no relevant commits since last release, semantic-release is a no-op (no version bump, no release). The release job succeeds and still calls deploy, so deploys always happen on `main` push
- If semantic-release fails, the release workflow fails — deploy is not called (`needs: release`)
- `deploy.yml` runs only via `workflow_call` from `release.yml` — no independent push triggers
- The `[skip ci]` tag on semantic-release's commit prevents the version-bump commit from re-triggering release.yml

## Testing

- Unit test: Settings component renders `__APP_VERSION__`
- Integration: push a feat commit, verify release workflow creates GitHub Release
- Integration: verify `__APP_VERSION__` appears in built output via Vite `define`