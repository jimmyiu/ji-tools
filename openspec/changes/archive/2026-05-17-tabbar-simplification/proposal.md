## Why

現有底部 TabBar 塞入 4 個項目（首頁、港美定存、馬拉松、設定），在加裝 Install/Update Banner 後底部 UI 極為擁擠，觸控目標過小且缺乏擴充性。簡化為 Home + Settings 兩項可大幅改善 UX，並為未來新增工具提供 scalable 的導航模式。

## What Changes

**TabBar Navigation**
- From: 4 tabs — 首頁, 港美定存, 馬拉松, 設定
- To: 2 tabs — 首頁, 設定
- Reason: 減少底部擁擠、加大觸控目標、支援未來擴充
- Impact: Non-breaking (移除捷徑，功能仍在)

**Home Page**
- From: 已有工具卡片網格
- To: 保持不變，作為 Hub 入口
- Reason: 已有良好的 Hub 設計，無需改動
- Impact: Non-breaking

## Capabilities

### New Capabilities
- `tab-bar-simplification`: Simplify bottom TabBar from 4 items to 2 items (Home, Settings)

### Modified Capabilities
- （無現有 spec 需要修改）

## Impact

- `src/components/TabBar.tsx`: 移除 2 個 tab 條目
- `src/App.tsx` / `src/components/Layout.tsx`: 無需變更
- `src/lib/constants.ts`: 無需變更
