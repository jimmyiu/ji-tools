## 1. Install Dependencies

- [x] 1.1 Install `husky`, `@commitlint/cli`, and `@commitlint/config-conventional` as dev dependencies via `pnpm add -D`
- [x] 1.2 Add `"prepare": "husky"` script to `package.json`

## 2. Configure Commitlint

- [x] 2.1 Create `commitlint.config.cjs` at project root extending `@commitlint/config-conventional`

## 3. Set Up Git Hook

- [x] 3.1 Initialize Husky via `pnpm exec husky init`
- [x] 3.2 Delete the default `.husky/pre-commit` file created by Husky init
- [x] 3.3 Create `.husky/commit-msg` hook that runs `npx --no -- commitlint --edit $1`

## 4. Fix Historical Commit

- [x] 4.1 Amend the commit `deps: bump dependencies` to `chore(deps): bump dependencies` and force push

## 5. Verify

- [x] 5.1 Test that a bad commit message (e.g., `bad message`) is rejected by commitlint
- [x] 5.2 Test that a valid commit message (e.g., `feat: test`) passes commitlint
