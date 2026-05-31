import { InputField } from './InputField'
import { DateField } from './DateField'
import { SelectField } from './SelectField'
import { SectionHeader } from './SectionHeader'
import type { Currency } from '@/hooks/useMarathonSavings'

interface BasicParametersProps {
  depositDate: string
  currency: Currency
  principal: string | number
  onDepositDateChange: (v: string) => void
  onCurrencyChange: (v: Currency) => void
  onPrincipalChange: (v: string) => void
}

function parseCurrency(v: string): Currency {
  if (v === 'HKD' || v === 'USD') return v
  return 'HKD'
}

export function BasicParameters({
  depositDate,
  currency,
  principal,
  onDepositDateChange,
  onCurrencyChange,
  onPrincipalChange,
}: BasicParametersProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <SectionHeader title="存款設定" />
      <div className="space-y-4">
        <DateField
          label="實際存款日期"
          value={depositDate}
          onChange={onDepositDateChange}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="存款貨幣"
            value={currency}
            onChange={(v) => onCurrencyChange(parseCurrency(v))}
            options={[
              { value: 'HKD', label: 'HKD 港元' },
              { value: 'USD', label: 'USD 美元' },
            ]}
          />
          <InputField
            label="初始本金"
            value={principal}
            onChange={onPrincipalChange}
            step={1000}
          />
        </div>
      </div>
    </div>
  )
}
