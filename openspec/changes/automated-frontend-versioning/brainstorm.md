## Design Summary

Automate version management for ji-tools using semantic-release on push to `main`. Conventional commits (already enforced via commitlint + Husky) drive version calculation. The Settings page displays the build-time-injected version string. A new GitHub Actions release workflow handles the full release cycle: version bump → CHANGELOG → GitHub Release → commit back to main.

## Alternatives Considered

### 方案 A：semantic-release（全自動）
- **做法**：Push to main 觸發 semantic-release，自動計算版本、更新 package.json、產生 CHANGELOG.md、建立 GitHub Release
- **優點**：
  - 零手動操作 — merge 到 main 即自動發佈
  - 與現有 commitlint 規範一致
  - 豐富的插件生態系
  - 無需維護 release PR
- **缺點**：
  - 較少控制 — 不良 commit 一旦進入 main 即觸發 release
  - 插件配置可能較冗長
- **為何未採用**：✅ 已採用

### 方案 B：release-please（Release PR 模型）
- **做法**：Google release-please-action 維護一個 release PR，merge 後自動產生 GitHub Release
- **優點**：
  - 可審閱後才發佈
  - 較簡單的配置
- **缺點**：
  - 需要手動 merge release PR
  - Release PR 可能過時
- **為何未採用**：使用者偏好全自動化流程

### 方案 C：Git Tag + 簡單腳本（最小方案）
- **做法**：手動打 tag，CI 讀取最新 tag 注入版本號
- **優點**：最小設定，無新依賴
- **缺點**：手動 tag 易出錯、無自動 CHANGELOG、無自動 GitHub Release
- **為何未採用**：失去自動化優勢

## Agreed Approach

**方案 A：semantic-release 全自動流程**

選擇理由：使用者已採用 commitlint 強制 conventional commits，semantic-release 能完全利用既有規範實現零手動版本管理。全自動流程符合「push to main 即 release」的期望。

核心設計：
1. **CI/CD Pipeline**：新 `release.yml` workflow 於 push to `main` 時觸發 semantic-release，其更新 `package.json` 版本、產生/更新 `CHANGELOG.md`、建立 GitHub Release，並 commit 版本變更回 `main`。Release 完成後呼叫 `deploy.yml` 確保使用新版本號構建。
2. **版本注入**：Vite `define` 將 `__APP_VERSION__` 替換為 `package.json` 版本號，僅在 Settings 頁面顯示
3. **Release 配置**：`.releaserc.json` 使用 6 個插件（commit-analyzer → release-notes-generator → changelog → npm → git → github），`npmPublish: false`，僅 `main` 分支觸發
4. **Deploy 與 Release 串接**：`deploy.yml` 改為僅在 `develop` push 時自動觸發，在 `main` 分支則由 `release.yml` 成功後透過 `workflow_call` 呼叫，確保部署使用已更新的版本號

## Key Decisions

1. **Release 僅在 main 分支觸發**：develop 分支部署不會觸發版本變更
2. **使用 semantic-release 而非 release-please**：全自動，無需手動 merge release PR
3. **版本僅顯示在 Settings 頁面**：不額外添加 footer 版本標籤
4. **Vite `define` 注入版本**：直接 import `package.json` 讀取 `version` 欄位（而非依賴 `process.env.npm_package_version`），package-manager-agnostic 且更穩健
5. **`npmPublish: false`**：私有項目，不發佈至 npm，僅用 npm plugin 更新 package.json 版本
6. **Deploy 由 Release 串接**：避免 infinite loop 及舊版本部署問題；`@semantic-release/git` 的 commit 帶 `[skip ci]` 防止重複觸發，`deploy.yml` 僅由 `release.yml` 透過 `workflow_call` 呼叫，不再有獨立的 push 觸發
7. **deploy.yml checkout 需使用 ref input**：當由 `release.yml` 透過 `workflow_call` 呼叫時，checkout step 必須使用 `ref: ${{ inputs.ref || github.sha }}` 以確保取得 bump 後的 commit，而非原始觸發的 SHA
8. **develop 不再部署至 GitHub Pages**：`deploy.yml` 移除所有 push 觸發，僅保留 `workflow_call`。Deployment 只在 release 成功後由 `release.yml` 呼叫

## Open Questions

- ~~Infinite loop risk~~ → Resolved: semantic-release 的 git commit 帶 `[skip ci]`，且 `deploy.yml` 在 main 分支僅由 `release.yml` 透過 `workflow_call` 呼叫，避免重複觸發