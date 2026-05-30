## Context

馬拉松存款頁面（`src/pages/MarathonSavings.tsx`）目前將階段利率設定表單直接內嵌在頁面中，佔據多個螢幕高度。核心價值指標（等效年利率、總利息）被推至頁面底部。現有 2 欄 grid 佈局（`lg:grid-cols-2`）存在但內容順序不佳。

現有技術基礎：
- `useInputs()` + `useCalculator()` hooks 管理所有狀態和計算邏輯
- `radix-ui` meta-package 已在 package.json 中
- shadcn/ui 元件模式已建立（`src/components/ui/`）
- 無 Sheet/Dialog/Drawer 元件
- 無 `useMediaQuery` hook（但 `useIsDesktopNav()` 在 `src/lib/breakpoints.ts` 中有類似模式可參考）

## Goals / Non-Goals

**Goals:**
- 重構頁面佈局為價值優先流程：Hero → Timeline → Params → Results
- 建立可複用 `<EditableSection>` 複合元件，支援響應式覆層（Sheet/Dialog）
- 建立階段利率時間軸視覺化（雙標籤橫條 + 邊界對齊日期）
- 新增 shadcn Sheet 和 Dialog UI 原語
- Hero Metrics 增加存款起始日期上下文

**Non-Goals:**
- 不修改 `useInputs()` 或 `useCalculator()` hooks 的計算邏輯
- 不修改其他頁面（FxDepositCompare、Home、Settings）
- 不引入新的 npm 依賴
- 不實作拖拽排序階段或動態增減階段數量
- 不新增通用 overlay provider 系統

## Decisions

### 1. EditableSection 複合元件

**決定**: 使用 compound component 模式（`<EditableSection.Summary>` + `<EditableSection.Form>`），內部根據斷點切換 Sheet/Dialog。

**理由**: 用戶明確要求可複用的編輯模板。Compound component 提供乾淨 API，消費者只需填入摘要內容和表單內容，不需關心覆層行為。相比 Context-based overlay system，避免了全域狀態和過度工程。

**實現**:
- `EditableSection` 管理 open/close 狀態
- `useMediaQuery('(min-width: 1024px)')` 切換 Sheet/Dialog
- `Form` 子元件管理草稿狀態（`structuredClone` on open）
- 鉛筆圖標（lucide-react `Pencil`）作為編輯觸發器，`aria-label="編輯階段利率"`

### 2. 時間軸：雙標籤橫條 + 絕對定位日期

**決定**: 單一橫條，每段內 HKD（紫色）在上 USD（綠色）在下。日期使用絕對定位錨定到段落邊界。

**理由**: 
- Dual Labels 相比 Dual Bars 更緊湊，相比 Follows Currency 可同時比較兩種貨幣
- 絕對定位確保日期與段落邊界精確對齊，不受 flex 佈局中文字寬度影響

**邊界百分比計算**:
```
boundary[0] = 0%
boundary[1] = (phase1Days / totalDays) * 100%
boundary[2] = ((phase1Days + phase2Days) / totalDays) * 100%
boundary[3] = 100%
```

**響應式字幕**:
- 桌面：階段字幕（"階段 X · N 日"）使用與橫條相同的 `flex` 比例置中於段落下方
- 行動裝置：僅顯示邊界日期，無天數和階段標籤

**日期格式**: `dd-MMM`（`date-fns` `format(date, 'dd-MMM')`），新增 `fmtDateShort()` 至 `src/lib/format.ts`

### 3. 編輯表單：Cancel/Confirm 草稿模式

**決定**: 表單開啟時深層複製 phases 為本地草稿，確認時套用，取消時捨棄。

**理由**: 防止意外變更和不必要的重新計算。相比即時套用模式，用戶有明確的「撤銷」路徑。

### 4. Hero Metrics 增加存款日期

**決定**: 在等效年利率下方顯示 "由 dd-MMM 起計" 副標題。

**理由**: 等效年利率是從存款日期開始計算的加權平均值，不是整個時間軸期間的利率。缺少此上下文會誤導用戶。

### 5. shadcn Sheet + Dialog

**決定**: 新增 `src/components/ui/sheet.tsx`（底部工作表）和 `src/components/ui/dialog.tsx`（置中對話框），基於 radix-ui Dialog 原語。

**理由**: 遵循現有 shadcn/ui 模式。Sheet 使用 `data-[state=open]:animate-in data-[state=closed]:animate-out` + `slide-in-from-bottom` 動畫。Dialog 使用標準置中佈局 + backdrop overlay。

### 6. 頁面元件拆分

**決定**: 將 `MarathonSavings.tsx` 拆分為 `HeroMetrics`、`BasicParameters`、`ResultsPanel` 子元件，加上新的 `PhaseRateTimeline` 和 `PhaseRateEditForm`。

**理由**: 每個元件職責單一，易於測試和維護。頁面本身成為純組合層。

## Risks / Trade-offs

**[Compound component API 複雜度]** → Mitigation: 僅兩個子元件（Summary + Form），API 表面小。TypeScript 型別檢查確保正確使用。

**[Sheet/Dialog 切換時的視覺跳躍]** → Mitigation: 斷點切換時覆層不會開啟（用戶需重新點擊），避免中途切換的問題。`useMediaQuery` 在覆層開啟前評估。

**[絕對定位日期在極端比例下的重疊]** → Mitigation: 當某階段天數極少（如 1 天 vs 119 天），邊界日期可能重疊。可接受 — 實際使用中階段天數通常均勻分佈。若未來需要，可加入碰撞偵測。

**[structuredClone 對大型物件的效能]** → Mitigation: phases 僅 3 個物件，clone 成本可忽略。

**[useMediaQuery SSR 行為]** → Mitigation: 伺服器端回傳 `false`（行動裝置），hydration 後更新。與現有 `useIsDesktopNav()` 模式一致。
