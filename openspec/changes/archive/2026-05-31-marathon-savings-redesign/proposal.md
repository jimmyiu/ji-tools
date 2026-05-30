## Why

馬拉松存款頁面的核心價值（實際等效年利率、期滿總利息）被埋在頁面底部，用戶必須滾動過巨大的三階段利率設定表單才能看到結果。這造成高認知負荷和摩擦，尤其在行動裝置上。現在重構為「價值優先黃金流程」，讓用戶立即看到結果，再深入細節。

## What Changes

**頁面佈局重構**
- From: 基本參數 → 階段利率設定（大型表單）→ 等效利率 → 利息明細 → 總利息
- To: 等效利率（Hero）→ 階段利率時間軸（摘要）→ 基本參數 → 結果與明細
- Reason: 價值優先，減少滾動摩擦，提升轉換
- Impact: Breaking — MarathonSavings.tsx 完全重構，拆分為多個子元件

**階段利率設定：內嵌表單 → 編輯覆層**
- From: 三階段完整表單直接顯示在頁面上（佔據多個螢幕高度）
- To: 緊湊時間軸摘要 + 鉛筆圖標，點擊開啟編輯覆層（行動裝置底部工作表 / 桌面置中對話框）
- Reason: 大幅減少初始頁面長度，編輯是次要操作
- Impact: Breaking — 新增 EditableSection、PhaseRateTimeline、PhaseRateEditForm 元件

**新增可複用 EditableSection 元件**
- From: 無此元件
- To: 複合元件 API（Summary + Form slots），內部處理響應式覆層（Sheet/Dialog）
- Reason: 未來頁面可複用相同的「檢視摘要 → 編輯覆層」模式
- Impact: 新增 src/components/EditableSection.tsx

**新增 shadcn Sheet 和 Dialog 元件**
- From: 無這些 UI 原語
- To: 使用 radix-ui 建立 shadcn Sheet（底部工作表）和 Dialog（置中對話框）
- Reason: EditableSection 需要響應式覆層，未來其他功能也可能使用
- Impact: 新增 src/components/ui/sheet.tsx、dialog.tsx

**Hero Metrics 增加存款起始日期**
- From: 僅顯示 HKD/USD 等效年利率
- To: 增加「由 dd-MMM 起計」副標題，明確計算起點
- Reason: 避免用戶誤以為是整個時間軸期間的利率
- Impact: 新增 HeroMetrics 元件

**時間軸視覺化**
- From: 無視覺化，僅表單
- To: 雙標籤橫條（HKD 紫色 + USD 綠色），邊界對齊日期（dd-MMM 格式），絕對定位
- Reason: 緊湊展示所有階段利率，一目了然
- Impact: 新增 PhaseRateTimeline 元件

## Capabilities

### New Capabilities
- `editable-section`: 可複用複合元件，提供「檢視摘要 + 編輯覆層」模式，響應式切換 Sheet（行動）/ Dialog（桌面），管理草稿狀態和確認/取消流程
- `phase-rate-timeline`: 階段利率時間軸視覺化，雙標籤橫條（HKD/USD），邊界對齊日期，響應式字幕（桌面顯示階段名稱和天數，行動僅顯示日期）

### Modified Capabilities
（無現有 capability 的需求層級變更）

## Impact

- **元件**: MarathonSavings.tsx 重構，新增 HeroMetrics、EditableSection、PhaseRateTimeline、PhaseRateEditForm、BasicParameters、ResultsPanel
- **UI 原語**: 新增 shadcn sheet.tsx、dialog.tsx
- **Hooks**: 新增 useMediaQuery.ts（響應式斷點偵測）
- **工具函數**: format.ts 新增 fmtDateShort()（dd-MMM 格式）
- **依賴**: 無新增（使用現有 radix-ui、date-fns、lucide-react）
- **測試**: 新增 PhaseRateTimeline、EditableSection、PhaseRateEditForm 單元測試；現有 useMarathonSavings 測試不變
- **無 API 變更**
