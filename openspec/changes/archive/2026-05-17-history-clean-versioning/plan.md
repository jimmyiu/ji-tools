# History Clean Versioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate version-tagging bot commits from git history while keeping version display on Settings page

**Architecture:** Remove `@semantic-release/changelog` and `@semantic-release/git` plugins so no files are committed back to the repo. Read version at build time from `git describe --tags --abbrev=0` instead of `package.json`. Tags and GitHub Releases remain intact.

**Tech Stack:** semantic-release, Vite, Vitest, Node.js child_process

---

### Task 1: Update release config

**Files:**
- Modify: `.releaserc.json`
- Delete: `CHANGELOG.md`

- [ ] **Step 1: Remove changelog and git plugins from `.releaserc.json`**

Current content:
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

Replace with:
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/npm", { "npmPublish": false }],
    "@semantic-release/github"
  ]
}
```

- [ ] **Step 2: Remove unused npm dependencies**

Run: `pnpm remove @semantic-release/changelog @semantic-release/git`

- [ ] **Step 3: Delete CHANGELOG.md**

Run: `rm CHANGELOG.md`

- [ ] **Step 4: Commit**

```bash
git add .releaserc.json package.json
git rm CHANGELOG.md
git commit -m "chore: remove semantic-release changelog and git plugins

Eliminate version-tagging bot commits by removing @semantic-release/changelog
and @semantic-release/git. Tags and GitHub Releases remain the sole
versioning record."
```

---

### Task 2: Update Vite config to read version from git tags

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Add `execSync` import and `getAppVersion` helper at the top of `vite.config.ts`**

Current top:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import pkg from './package.json'
```

Replace with:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { execSync } from 'child_process'

const getAppVersion = () => {
  try {
    return execSync('git describe --tags --abbrev=0').toString().trim().replace(/^v/, '')
  } catch {
    return '0.0.0'
  }
}
```

- [ ] **Step 2: Replace `pkg.version` with `getAppVersion()` in the `define` block**

Current:
```typescript
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
```

Replace with:
```typescript
  define: {
    __APP_VERSION__: JSON.stringify(getAppVersion()),
  },
```

- [ ] **Step 3: Verify the build works**

Run: `pnpm build`
- Expected: Build succeeds, `__APP_VERSION__` resolves to a version like `1.1.1` (without `v` prefix) or `0.0.0` if no tags

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts
git commit -m "feat: read app version from git tags at build time

Replace package.json import with git describe --tags --abbrev=0
via execSync, falling back to 0.0.0 when no tags exist."
```

---

### Task 3: Update Vitest config

**Files:**
- Modify: `vitest.config.ts`

- [ ] **Step 1: Add `execSync` import and `getAppVersion` helper to `vitest.config.ts`**

Current:
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'
import pkg from './package.json'
```

Replace with:
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'
import { execSync } from 'child_process'

const getAppVersion = () => {
  try {
    return execSync('git describe --tags --abbrev=0').toString().trim().replace(/^v/, '')
  } catch {
    return '0.0.0'
  }
}
```

- [ ] **Step 2: Replace `pkg.version` with `getAppVersion()` in the `define` block**

Current:
```typescript
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
```

Replace with:
```typescript
  define: {
    __APP_VERSION__: JSON.stringify(getAppVersion()),
  },
```

- [ ] **Step 3: Run tests to confirm they pass**

Run: `pnpm test`
- Expected: All tests pass, including `Settings > renders the app version from __APP_VERSION__`

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: sync vitest config with git tag version injection"
```
