import { fmtRate, fmtDateShort } from '@/lib/format'
import type { Currency } from '@/hooks/useMarathonSavings'

interface CurrencyToggleProps {
  hkdActualRate: number
  usdActualRate: number
  currency: Currency
  depositDate: string
  onCurrencyChange: (v: Currency) => void
}

export function CurrencyToggle({ hkdActualRate, usdActualRate, currency, depositDate, onCurrencyChange }: CurrencyToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-4">
      <button
        type="button"
        onClick={() => currency !== 'HKD' && onCurrencyChange('HKD')}
        className={`relative rounded-xl p-5 text-left transition-all border-2 ${
          currency === 'HKD'
            ? 'border-primary bg-primary/5'
            : 'border-border opacity-50'
        }`}
      >
        <span
          className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 transition-all ${
            currency === 'HKD'
              ? 'border-primary bg-primary'
              : 'border-muted-foreground bg-transparent'
          }`}
        />
        <div className="text-xs text-muted-foreground mb-2">HKD 實際等效年利率</div>
        <div className="text-2xl font-bold text-foreground mb-1">{fmtRate(hkdActualRate)}%</div>
        <div className="text-xs text-muted-foreground/60">由 {fmtDateShort(depositDate)} 起計</div>
      </button>
      <button
        type="button"
        onClick={() => currency !== 'USD' && onCurrencyChange('USD')}
        className={`relative rounded-xl p-5 text-left transition-all border-2 ${
          currency === 'USD'
            ? 'border-primary bg-primary/5'
            : 'border-border opacity-50'
        }`}
      >
        <span
          className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 transition-all ${
            currency === 'USD'
              ? 'border-primary bg-primary'
              : 'border-muted-foreground bg-transparent'
          }`}
        />
        <div className="text-xs text-muted-foreground mb-2">USD 實際等效年利率</div>
        <div className="text-2xl font-bold text-foreground mb-1">{fmtRate(usdActualRate)}%</div>
        <div className="text-xs text-muted-foreground/60">由 {fmtDateShort(depositDate)} 起計</div>
      </button>
    </div>
  )
}
