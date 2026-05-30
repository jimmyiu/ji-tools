import { InputField } from '../components/InputField'
import { DateField } from '../components/DateField'
import { SelectField } from '../components/SelectField'
import { useInputs, useCalculator } from '../hooks/useMarathonSavings'
import type { Currency } from '../hooks/useMarathonSavings'
import { fmt, fmtRate } from '../lib/format'

function assertPhaseIndex(i: number): asserts i is 0 | 1 | 2 {
  if (i < 0 || i > 2) throw new Error(`Invalid phase index: ${i}`)
}

function parseCurrency(v: string): Currency {
  if (v === 'HKD' || v === 'USD') return v
  return 'HKD'
}

export default function MarathonSavings() {
  const inputs = useInputs()
  const result = useCalculator(inputs)

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 page-enter">
      <p className="text-sm text-muted-foreground mb-8">
        揭示階梯式利率活期存款的「實際等效年利率」，擺脫銀行最高息宣傳迷思。
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-foreground mb-5">基本參數</h2>
            <div className="space-y-4">
              <DateField
                label="實際存款日期"
                value={inputs.depositDate}
                onChange={inputs.setDepositDate}
              />
              <SelectField
                label="存款貨幣"
                value={inputs.currency}
                onChange={(v) => inputs.setCurrency(parseCurrency(v))}
                options={[
                  { value: 'HKD', label: 'HKD 港元' },
                  { value: 'USD', label: 'USD 美元' },
                ]}
              />
              <InputField
                label="初始本金"
                value={inputs.principal}
                onChange={inputs.setPrincipal}
                step={1000}
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-foreground mb-5">階段利率設定</h2>
            <div className="space-y-5">
              {inputs.phases.map((phase, i) => {
                assertPhaseIndex(i)
                return (
                <div key={i} className="space-y-3">
                  <div className="text-xs font-medium text-primary">
                    階段 {i + 1}
                    <span className="ml-2 text-muted-foreground/60">
                      ({phase.startDate} ~ {phase.endDate})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <DateField
                      label="開始日期"
                      value={phase.startDate}
                      onChange={(v) => inputs.setPhaseStartDate(i, v)}
                    />
                    <DateField
                      label="結束日期"
                      value={phase.endDate}
                      onChange={(v) => inputs.setPhaseEndDate(i, v)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="HKD 年利率"
                      value={phase.hkdRate}
                      onChange={(v) => inputs.setPhaseHkdRate(i, v)}
                      suffix="%"
                      step={0.01}
                    />
                    <InputField
                      label="USD 年利率"
                      value={phase.usdRate}
                      onChange={(v) => inputs.setPhaseUsdRate(i, v)}
                      suffix="%"
                      step={0.01}
                    />
                  </div>
                  {i < inputs.phases.length - 1 && <div className="border-t border-border" />}
                </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-5 border border-primary/30 bg-primary/5">
              <div className="text-xs text-muted-foreground mb-2">HKD 實際等效年利率</div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {fmtRate(result.hkdActualRate)}%
              </div>
              <div className="text-xs text-muted-foreground/60">以存款日數加權平均計算</div>
            </div>
            <div className="rounded-xl p-5 border border-green-500/30 bg-green-500/5">
              <div className="text-xs text-muted-foreground mb-2">USD 實際等效年利率</div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {fmtRate(result.usdActualRate)}%
              </div>
              <div className="text-xs text-muted-foreground/60">以存款日數加權平均計算</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              {inputs.currency === 'HKD' ? '港元' : '美元'} 利息明細
              <span className="ml-2 text-xs font-normal text-muted-foreground/60">
                (本金 HK$ {fmt(Number(inputs.principal))})
              </span>
            </h2>
            <div className="space-y-3">
              {result.phaseResults.map((pr, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div>
                    <span className="text-sm text-muted-foreground">階段 {i + 1}</span>
                    <span className="ml-2 text-xs text-muted-foreground/60">
                      {pr.days > 0 ? `${pr.days} 日 @ ${pr.rate}%` : '（不在存款期內）'}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${pr.interest > 0 ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                    {pr.interest > 0 ? `${inputs.currency === 'HKD' ? 'HK$' : 'US$'}${fmt(pr.interest)}` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-6 border border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">總存款日數</div>
                <div className="text-2xl font-bold text-foreground">{result.totalDays} 日</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">期滿總利息</div>
                <div className="text-2xl font-bold text-primary">
                  {inputs.currency === 'HKD' ? 'HK$' : 'US$'}{fmt(result.totalInterest)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
