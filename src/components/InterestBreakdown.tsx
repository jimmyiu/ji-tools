import { fmt } from '@/lib/format'
import { SectionHeader } from './SectionHeader'
import type { Currency, PhaseResult } from '@/hooks/useMarathonSavings'

interface InterestBreakdownProps {
  currency: Currency
  principal: string | number
  phaseResults: PhaseResult[]
}

export function InterestBreakdown({ currency, principal, phaseResults }: InterestBreakdownProps) {
  return (
    <div className="px-4 py-4">
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
  )
}
