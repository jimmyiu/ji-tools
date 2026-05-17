## Design Summary

Simplify the TabBar from 4 items to 2 items (Home, Settings), turning Home into a dashboard for selecting calculators.

## Alternatives Considered

### 方案 A：Keep 4-tab layout
- **做法**：保留現有 4 個 Tab（首頁、港美定存、馬拉松、設定），不做任何改動
- **優點**：不需改動，無開發成本
- **缺點**：底部 UI 過度擁擠；無法擴充新工具；與 Install/Update Banner 疊加後更顯雜亂；觸控目標太小
- **為何未採用**：無法解決當前的 UI 擁擠問題，也不具備未來擴充性

### 方案 B：Just remove calculator tabs（採納）
- **做法**：TabBar 縮減為「首頁」和「設定」兩項，單純移除底部捷徑，不加入返回按鈕
- **優點**：TabBar 簡化，觸控目標變大；開發量最小（僅刪除 tab 條目）；無需新增元件
- **缺點**：使用者進入計算機頁面後需用瀏覽器返回手勢或首頁卡片重新選擇
- **為何未採用**：N/A — 此為採納方案

## Agreed Approach

採納方案 B。TabBar 從 4 項縮減為 2 項（首頁 + 設定），移除港美定存和馬拉松的底部捷徑，不加入返回按鈕。首頁保持現有的工具卡片網格作為 Hub，用戶可透過首頁卡片或瀏覽器返回手勢導航。

## Key Decisions

1. **TabBar**: 移除 Calculator 和 TrendingUp 兩個 tab，保留 Home 和 Settings
2. **邊界調整**: TabBar 高度維持 56px（`TAB_BAR_HEIGHT`），常量不變
3. **Install/Update Banner**: 不受影響，繼續疊在 TabBar 上方
4. **不新增頁面路徑**: 不改變現有路由結構
5. **無返回按鈕**: 計算機頁面不加入返回按鈕，依賴首頁卡片和瀏覽器返回手勢
