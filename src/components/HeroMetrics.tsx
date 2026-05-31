import { fmtRate, fmtDateShort } from '@/lib/format'

interface HeroMetricsProps {
  hkdActualRate: number
  usdActualRate: number
  depositDate: string
}

export function HeroMetrics({ hkdActualRate, usdActualRate, depositDate }: HeroMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl p-5 border border-primary/30 bg-primary/5">
        <div className="text-xs text-muted-foreground mb-2">HKD 實際等效年利率</div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {fmtRate(hkdActualRate)}%
        </div>
        <div className="text-xs text-muted-foreground/60">由 {fmtDateShort(depositDate)} 起計</div>
      </div>
      <div className="rounded-xl p-5 border border-positive/30 bg-positive/5">
        <div className="text-xs text-muted-foreground mb-2">USD 實際等效年利率</div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {fmtRate(usdActualRate)}%
        </div>
        <div className="text-xs text-muted-foreground/60">由 {fmtDateShort(depositDate)} 起計</div>
      </div>
    </div>
  )
}
