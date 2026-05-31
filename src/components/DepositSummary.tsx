import { fmt } from '@/lib/format'
import type { Currency } from '@/hooks/useMarathonSavings'

interface DepositSummaryProps {
  currency: Currency
  totalDays: number
  totalInterest: number
}

export function DepositSummary({ currency, totalDays, totalInterest }: DepositSummaryProps) {
  return (
    <div className="px-4 py-4">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground mb-1">總存款日數</div>
          <div className="text-3xl font-bold text-foreground">{totalDays} 日</div>
        </div>
        <div className="w-px h-16 bg-border" />
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">期滿總利息</div>
          <div className="text-3xl font-bold text-primary">
            {currency === 'HKD' ? 'HK$' : 'US$'}{fmt(totalInterest)}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
