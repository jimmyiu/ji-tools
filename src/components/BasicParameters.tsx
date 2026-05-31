import { InputField } from './InputField'
import { DateField } from './DateField'
import { SectionHeader } from './SectionHeader'

interface BasicParametersProps {
  depositDate: string
  principal: string | number
  onDepositDateChange: (v: string) => void
  onPrincipalChange: (v: string) => void
}

export function BasicParameters({
  depositDate,
  principal,
  onDepositDateChange,
  onPrincipalChange,
}: BasicParametersProps) {
  return (
    <div className="px-4 py-4">
      <SectionHeader title="存款設定" />
      <p className="text-xs text-muted-foreground/60 mb-3">貨幣已在頂部設定 — 僅顯示 HKD/USD 計算結果</p>
      <div className="space-y-4">
        <DateField
          label="實際存款日期"
          value={depositDate}
          onChange={onDepositDateChange}
        />
        <InputField
          label="初始本金"
          value={principal}
          onChange={onPrincipalChange}
          step={1000}
        />
      </div>
    </div>
  )
}
