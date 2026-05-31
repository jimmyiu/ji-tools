import { fmt } from '@/lib/format'
import { SectionHeader } from './SectionHeader'
import type { Currency, PhaseResult } from '@/hooks/useMarathonSavings'

interface ResultsPanelProps {
  currency: Currency
  principal: string | number
  phaseResults: PhaseResult[]
  totalDays: number
  totalInterest: number
}

export function ResultsPanel({
  currency,
  principal,
  phaseResults,
  totalDays,
  totalInterest,
}: ResultsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-6">
        <SectionHeader
          title={`${currency === 'HKD' ? '港元' : '美元'} 利息明細`}
          description={`(本金 ${currency === 'HKD' ? 'HK$' : 'US$'} ${fmt(Number(principal))})`}
        />
        <div className="space-y-3">
          {phaseResults.map((pr, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div>
                <span className="text-sm text-muted-foreground">階段 {i + 1}</span>
                <span className="ml-2 text-xs text-muted-foreground/60">
                  {pr.days > 0 ? `${pr.days} 日 @ ${pr.rate}%` : '（不在存款期內）'}
                </span>
              </div>
              <span className={`text-sm font-medium ${pr.interest > 0 ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                {pr.interest > 0 ? `${currency === 'HKD' ? 'HK$' : 'US$'}${fmt(pr.interest)}` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-6 border border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">總存款日數</div>
            <div className="text-2xl font-bold text-foreground">{totalDays} 日</div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">期滿總利息</div>
            <div className="text-2xl font-bold text-primary">
              {currency === 'HKD' ? 'HK$' : 'US$'}{fmt(totalInterest)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
