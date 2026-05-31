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
      <div className="grid grid-cols-2 gap-4">
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
