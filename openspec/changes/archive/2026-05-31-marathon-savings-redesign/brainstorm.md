## Design Summary

馬拉松存款頁面重構為「價值優先黃金流程」：Hero Metrics → Phase Rate Timeline → Basic Parameters → Results。階段利率設定從內嵌大型表單改為緊湊時間軸摘要 + 編輯覆層（行動裝置底部工作表 / 桌面置中對話框）。引入可複用 `<EditableSection>` 複合元件，支援未來的「檢視摘要 → 編輯覆層」模式。

## Alternatives Considered

### 方案 A: Page-level restructure + shadcn primitives
- **做法**: 新增 shadcn Sheet/Dialog，頁面直接組合元件，響應式切換邏輯寫在頁面層級
- **優點**: 最小抽象，清晰所有權，shadcn 元件經過測試，易於理解
- **缺點**: Sheet/Dialog 切換邏輯只存在一處，未來的「可編輯區塊」需複製模式
- **為何未採用**: 用戶明確要求可複用的編輯元件/模板

### 方案 B: Generic `<EditableSection>` compound component
- **做法**: 高階 `<EditableSection>` 含 Summary + Form slots，內部處理響應式覆層、編輯按鈕、開關狀態
- **優點**: 乾淨 API，未來區塊直接插入，覆層行為單一來源
- **缺點**: 較多前期設計投入，複合元件 API 需謹慎保持彈性
- **為何未採用**: 此為最終選擇方案（見 Agreed Approach）

### 方案 C: Context-based overlay system
- **做法**: 單一 `<OverlayProvider>` 在應用層級，任何元件可呼叫 `useOverlay()` 開啟/關閉覆層
- **優點**: 最大彈性，任何元件任何地方都可開啟覆層
- **缺點**: 對此用例過度工程，增加全域狀態，更難推理
- **為何未採用**: 過度工程，全域狀態增加複雜度

### 編輯覆層：桌面行為
- **Centered Modal Dialog**: 傳統置中對話框 + 背景遮罩，桌面表單編輯的自然模式
- **Bottom Sheet（同行動裝置）**: 跨裝置一致，但寬螢幕上底部工作表感覺不自然
- **Inline Expand/Collapse**: 摘要就地展開顯示表單，無遮層，但推下內容造成版面偏移
- **決定**: 桌面使用 Centered Modal Dialog，行動裝置使用 Bottom Sheet

### 階段利率摘要格式
- **Inline Chips**: 緊湊標籤如 "P1: 1.85% · P2: 2.0% · P3: 2.2%"
- **Mini Table Row**: 單行表格顯示階段編號、日期範圍、利率
- **Timeline Strip**: 水平比例橫條，含利率標籤和天數
- **決定**: Timeline Strip，經多次迭代細化為雙標籤（HKD + USD）+ 邊界對齊日期

### USD 利率顯示
- **Dual Bars（堆疊）**: 兩條時間軸堆疊，HKD 上方 USD 下方，共享日期軸
- **Follows Selected Currency**: 時間軸僅顯示基本參數中選擇的貨幣利率
- **Dual Labels（單橫條）**: 單一橫條，每段內 HKD 利率在上 USD 利率在下
- **決定**: Dual Labels — 緊湊，兩者皆可見，單一橫條

### 編輯按鈕樣式
- **Icon only（鉛筆）**: 最小化，乾淨，標準內嵌編輯操作模式
- **Icon + "編輯" 文字**: 更明確，更好的無障礙性
- **Text only "編輯"**: 簡潔文字連結樣式
- **決定**: Icon only — 鉛筆圖標普遍被理解，摘要視圖應保持低視覺權重

### Hero Metrics 存款日期位置
- **Subtitle**: "由 31-May 起計" 在利率數字下方
- **Header row**: "31-May 起" 與標籤同行右對齊
- **決定**: Subtitle — 清晰可讀，不擠壓標題行

### 編輯表單行為
- **Cancel/Confirm buttons**: 用戶在草稿狀態編輯，確認套用或取消捨棄
- **Real-time（即時套用）**: 變更在用戶輸入時即時套用
- **決定**: Cancel/Confirm — 防止意外變更和不必要的重新計算

## Agreed Approach

採用方案 B（`<EditableSection>` compound component），內部使用 shadcn Sheet（行動裝置）和 Dialog（桌面）原語。

**核心架構**:
```
MarathonSavings (page)
├── HeroMetrics (hkdRate, usdRate, depositDate)
├── EditableSection (title="階段利率")
│   ├── Summary → PhaseRateTimeline (phases, depositDate)
│   └── Form → PhaseRateEditForm (phases, onConfirm, onCancel)
├── BasicParameters (depositDate, currency, principal + setters)
└── ResultsPanel (totalDays, totalInterest, phaseResults, currency, principal)
```

**響應式覆層切換**: `useMediaQuery('(min-width: 1024px)')` — 行動裝置 Sheet，桌面 Dialog。兩者皆基於 radix-ui，共享無障礙功能（焦點陷阱、Escape 關閉、捲動鎖定）。

**時間軸視覺化**:
- 雙標籤橫條：每段顯示 HKD 利率（紫色 `#c4b5fd`）+ USD 利率（綠色 `#86efac`）
- 段落寬度按天數比例（`flex: N`）
- 邊界對齊日期使用絕對定位，百分比從天數比例計算
- 日期格式：`dd-MMM`（如 `04-May`、`02-Jul`）
- 桌面：階段字幕（"階段 X · N 日"）置中於段落下方 + 日期絕對定位於邊界
- 行動裝置：僅邊界日期，無天數

**Hero Metrics**: HKD + USD 等效年利率，副標題 "由 dd-MMM 起計" 使用 `inputs.depositDate`

**編輯表單**: Cancel/Confirm 按鈕，開啟時深層複製 phases 為本地草稿，確認時呼叫 `onConfirm(draftPhases)`，取消時捨棄

## Key Decisions

1. **頁面順序**: Hero → Timeline → Params → Results（價值優先）
2. **桌面佈局**: 2 欄 — 左欄（Hero + Timeline + Params），右欄（Results 錨定頂部）
3. **EditableSection API**: 複合元件 `<EditableSection.Summary>` + `<EditableSection.Form onConfirm onCancel>`
4. **覆層切換**: `useMediaQuery` hook，`lg` 斷點（1024px）
5. **時間軸**: 雙標籤橫條（HKD 紫 + USD 綠），邊界對齊日期（絕對定位）
6. **日期格式**: `dd-MMM`（`date-fns` `format(date, 'dd-MMM')`）
7. **編輯按鈕**: 鉛筆圖標 only（lucide-react `Pencil`）
8. **編輯表單**: Cancel/Confirm 草稿狀態
9. **Hero 日期**: 副標題 "由 dd-MMM 起計"
10. **shadcn 元件**: 新增 sheet.tsx（底部工作表）、dialog.tsx（置中對話框）
11. **邊界日期定位**: 絕對定位 + `left: X%` + `transform: translateX(-50%)`，百分比從天數比例計算
12. **0 天數邊界**: 段落以最小寬度（`flex: 1`）+ 淡化樣式（opacity 0.4）渲染
13. **總天數為 0**: 顯示空橫條 + 訊息 "存款日期在所有階段之後"

## Open Questions

無。所有設計決策已在腦力激盪中確認。
