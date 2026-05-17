## Context

TabBar 目前有 4 個 tab（首頁、港美定存、馬拉松、設定），與 Install/Update Banner 疊加後底部 UI 過度擁擠。為改善觸控體驗與支援未來擴充，將 TabBar 縮減為 2 項，計算機頁面改由首頁 Hub 進入。

## Goals / Non-Goals

**Goals:**
- TabBar 從 4 項縮減為 2 項（首頁、設定）
- 保持首頁現有工具卡片網格作為 Hub
- 保持 Install/Update Banner 行為不變
- 觸控目標增大，底部 UI 簡潔

**Non-Goals:**
- 不改變路由結構
- 不改變任何計算邏輯或頁面內容
- 不改變 Settings 頁面行為
- 不新增第三方依賴

## Decisions

1. **刪除 Tab 條目 vs 條件渲染**: 直接從 `tabs` 陣列移除 Calculator 和 TrendingUp 條目。由於 Layout.tsx 的 `pageTitles` 對照表已經涵蓋所有頁面，TabBar 變更不會影響 header 標題顯示。
2. **active tab 邏輯**: 簡化 `tabs.find()` 邏輯，只需在 `/` 與 `/settings` 之間切換。
3. **Banner 不受影響**: Install/Update Banner 的 z-index (z-50) 高於 TabBar (z-40)，疊加關係不變。

## Risks / Trade-offs

- 使用者初期可能不習慣缺少底部捷徑 → 首頁卡片和瀏覽器返回手勢仍可導航
- 首頁工具增多時可能需要 redesign → 但卡片網格天然支援擴充
