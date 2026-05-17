# Automated Frontend Versioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate version management using semantic-release on push to main, and inject the version into the Settings page via Vite define.

**Architecture:** A new `release.yml` workflow runs semantic-release on push to `main`, which bumps `package.json`, generates `CHANGELOG.md`, creates a GitHub Release, and commits back with `[skip ci]`. It then calls the refactored `deploy.yml` (now a `workflow_call`-only reusable workflow) with `ref: main` to deploy the post-bump version. The frontend reads the version at build time via Vite's `define` option importing `package.json`.

**Tech Stack:** semantic-release, @semantic-release/* plugins, GitHub Actions, Vite define, TypeScript, Vitest, React Testing Library

---

### Task 1: Version Injection — TypeScript Declaration

**Files:**
- Create: `src/vite-env.d.ts`

- [ ] **Step 1: Create `src/vite-env.d.ts`**

Create the file with the global declaration for `__APP_VERSION__`:

```ts
declare const __APP_VERSION__: string
```

- [ ] **Step 2: Verify TypeScript recognizes the declaration**

Run: `pnpm run build`
Expected: Build succeeds with no type errors about `__APP_VERSION__` (it won't be used yet, just declared).

- [ ] **Step 3: Commit**

```bash
git add src/vite-env.d.ts
git commit -m "feat: add TypeScript declaration for __APP_VERSION__"
```

---

### Task 2: Version Injection — Vite Config

**Files:**
- Modify: `vite.config.ts:1-38`

- [ ] **Step 1: Update `vite.config.ts` to import package.json and add `define`**

The current file starts with imports and exports `defineConfig`. Add `import pkg from './package.json'` at the top, and add a `define` key to the config object:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import pkg from './package.json'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/ji-tools/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'JI Tools',
        short_name: 'JI Tools',
        description: '前端工具集 - 港美定存比較、馬拉松存款計算機',
        theme_color: '#0f1117',
        background_color: '#0f1117',
        display: 'standalone',
        scope: '/ji-tools/',
        start_url: '/ji-tools/',
        lang: 'zh-Hant',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
```

Key changes: added `import pkg from './package.json'` and `define: { __APP_VERSION__: JSON.stringify(pkg.version) }` as the first config key.

- [ ] **Step 2: Verify build succeeds with the version injected**

Run: `pnpm run build`
Expected: Build succeeds. Then verify the version is inlined:

```bash
grep -r "0.0.0" dist/assets/*.js | head -5
```

Expected: The string `"0.0.0"` (with quotes) appears in the built JS output, confirming `JSON.stringify` produced a quoted string literal.

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "feat: inject __APP_VERSION__ via Vite define"
```

---

### Task 3: Version Injection — Settings Page

**Files:**
- Modify: `src/pages/Settings.tsx:15`

- [ ] **Step 1: Replace hardcoded `0.0.0` with `__APP_VERSION__`**

In `src/pages/Settings.tsx`, change line 15 from:

```tsx
          <span className="text-sm text-white">0.0.0</span>
```

to:

```tsx
          <span className="text-sm text-white">{__APP_VERSION__}</span>
```

- [ ] **Step 2: Verify the app renders the version**

Run: `pnpm run build`
Then search the output for the version string:

```bash
grep -o '"0.0.0"' dist/assets/*.js | head -3
```

Expected: The quoted string `"0.0.0"` is found in the built JS (since `package.json` version is currently `0.0.0`).

- [ ] **Step 3: Commit**

```bash
git add src/pages/Settings.tsx
git commit -m "feat: display __APP_VERSION__ in Settings page"
```

---

### Task 4: Version Injection — Unit Test

**Files:**
- Create: `src/pages/Settings.test.tsx`

- [ ] **Step 1: Write a failing test for the Settings component rendering `__APP_VERSION__`**

Create `src/pages/Settings.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Settings from './Settings'

function renderSettings() {
  return render(<BrowserRouter><Settings /></BrowserRouter>)
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe('Settings', () => {
  it('renders the app version from __APP_VERSION__', () => {
    renderSettings()
    expect(screen.getByText(__APP_VERSION__)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it passes**

Run: `pnpm test -- src/pages/Settings.test.tsx`
Expected: PASS — `__APP_VERSION__` is replaced by Vitest/Vite at test time with the value from `package.json` (`"0.0.0"`).

- [ ] **Step 3: Commit**

```bash
git add src/pages/Settings.test.tsx
git commit -m "test: add unit test for Settings version display"
```

---

### Task 5: semantic-release — Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install semantic-release and its 6 plugins as devDependencies**

Run:

```bash
pnpm add -D semantic-release @semantic-release/commit-analyzer @semantic-release/release-notes-generator @semantic-release/changelog @semantic-release/npm @semantic-release/git @semantic-release/github
```

Expected: `pnpm-lock.yaml` updated, `package.json` devDependencies section includes all 7 packages.

- [ ] **Step 2: Commit the dependency additions**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add semantic-release and plugins as devDependencies"
```

---

### Task 6: semantic-release — Configuration

**Files:**
- Create: `.releaserc.json`

- [ ] **Step 1: Create `.releaserc.json` with the full plugin chain and configuration**

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", { "npmPublish": false }],
    ["@semantic-release/git", {
      "assets": ["package.json", "CHANGELOG.md"],
      "message": "chore(release): ${nextRelease.version} [skip ci]"
    }],
    "@semantic-release/github"
  ]
}
```

Key details:
- `branches: ["main"]` — only release from main
- `npmPublish: false` — private project, don't publish to npm
- `@semantic-release/git` commit message includes `[skip ci]` to prevent infinite loops
- `assets` lists `package.json` and `CHANGELOG.md` as the files to commit back

- [ ] **Step 2: Verify the config is valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('.releaserc.json','utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Run semantic-release dry-run to verify configuration**

Run: `npx semantic-release --dry-run --no-ci`
Expected: It may error about missing `GITHUB_TOKEN` or no previous releases. This is expected locally — the real token is provided by GitHub Actions. The `--no-ci` flag bypasses CI environment checks. The goal is to confirm the config file is parsed correctly (no JSON schema errors, plugin resolution works).

- [ ] **Step 4: Commit**

```bash
git add .releaserc.json
git commit -m "chore: add semantic-release configuration"
```

---

### Task 7: Release Workflow — Create release.yml

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create `.github/workflows/release.yml`**

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

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  deploy:
    needs: release
    uses: ./.github/workflows/deploy.yml
    with:
      ref: main
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add release workflow with semantic-release"
```

---

### Task 8: Release Workflow — Refactor deploy.yml

**Files:**
- Modify: `.github/workflows/deploy.yml:1-57`

- [ ] **Step 1: Refactor `deploy.yml` to be a reusable workflow**

Replace the entire file content. The key changes are:
- Remove `on: push: branches: [main, develop]` — no more push triggers
- Add `on: workflow_call: inputs: ref:` — make it a reusable workflow
- Update checkout to use `${{ inputs.ref || github.sha }}`
- Update action versions to `@v4`

```yaml
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
        uses: pnpm/action-setup@v4
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
        uses: actions/upload-pages-artifact@v5
        with:
          path: ./dist

      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Verify YAML syntax**

Run: `npx yaml-lint .github/workflows/deploy.yml` or visually inspect for indentation errors.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "refactor: convert deploy.yml to reusable workflow_call"
```

---

### Task 9: Validation — Build, Test, and Lint

**Files:**
- No new files

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: All tests pass, including the new `Settings.test.tsx`.

- [ ] **Step 2: Run the linter**

Run: `pnpm run lint`
Expected: No errors.

- [ ] **Step 3: Run a production build**

Run: `pnpm run build`
Expected: Build succeeds with exit code 0.

- [ ] **Step 4: Verify version string in build output**

Run: `grep -o '"0.0.0"' dist/assets/*.js | head -3`
Expected: `"0.0.0"` found in the built JS (quoted string, matching the current `package.json` version).

---

### Task 10: Validation — Integration Test on Merge

**Files:**
- No new files

- [ ] **Step 1: Push all changes to a branch and create a PR**

```bash
git checkout -b feat/automated-frontend-versioning
git push origin feat/automated-frontend-versioning
```

Create a PR targeting `main`.

- [ ] **Step 2: Merge the PR to `main` and observe the release workflow**

After merge, check the GitHub Actions tab:
1. `release.yml` should trigger on push to `main`
2. The release job should run `semantic-release`
3. Since there's no prior release tag, semantic-release should create the first release (`v1.0.0` or based on commit history)
4. `package.json` and `CHANGELOG.md` should be committed back to `main` with `[skip ci]`
5. The deploy job should call `deploy.yml` with `ref: main`
6. A GitHub Release should appear on the repository

- [ ] **Step 3: Verify the deployed Settings page shows the new version**

After deployment, open the Settings page and confirm the version row shows the released version (e.g., `1.0.0`) instead of `0.0.0`.