import { useInputs, useCalculator } from '../hooks/useMarathonSavings'
import type { Currency } from '../hooks/useMarathonSavings'

function fmt(n: number) {
  return n.toLocaleString('zh-HK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtRate(n: number) {
  return n.toFixed(4)
}

interface InputFieldProps {
  label: string
  value: string | number
  onChange: (v: string) => void
  suffix?: string
  min?: number
  step?: number
}

function InputField({ label, value, onChange, suffix, min = 0, step = 0.01 }: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs text-[#9ca3af] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          step={step}
          className="w-full bg-[#1a1d27] border border-[#2e303a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9ca3af]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

interface DateFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}

function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <div>
      <label className="block text-xs text-[#9ca3af] mb-1.5">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1a1d27] border border-[#2e303a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors"
      />
    </div>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-xs text-[#9ca3af] mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1a1d27] border border-[#2e303a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function MarathonSavings() {
  const inputs = useInputs()
  const result = useCalculator(inputs)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      <p className="text-sm text-[#9ca3af] mb-8">
        揭示階梯式利率活期存款的「實際等效年利率」，擺脫銀行最高息宣傳迷思。
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-[#1a1d27] border border-[#2e303a] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">基本參數</h2>
            <div className="space-y-4">
              <DateField
                label="實際存款日期"
                value={inputs.depositDate}
                onChange={inputs.setDepositDate}
              />
              <SelectField
                label="存款貨幣"
                value={inputs.currency}
                onChange={(v) => inputs.setCurrency(v as Currency)}
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

          <div className="bg-[#1a1d27] border border-[#2e303a] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">階段利率設定</h2>
            <div className="space-y-5">
              {inputs.phases.map((phase, i) => (
                <div key={i} className="space-y-3">
                  <div className="text-xs font-medium text-[#818cf8]">
                    階段 {i + 1}
                    <span className="ml-2 text-[#6b7280]">
                      ({phase.startDate} ~ {phase.endDate})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <DateField
                      label="開始日期"
                      value={phase.startDate}
                      onChange={(v) => inputs.setPhaseStartDate(i as 0 | 1 | 2, v)}
                    />
                    <DateField
                      label="結束日期"
                      value={phase.endDate}
                      onChange={(v) => inputs.setPhaseEndDate(i as 0 | 1 | 2, v)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="HKD 年利率"
                      value={phase.hkdRate}
                      onChange={(v) => inputs.setPhaseHkdRate(i as 0 | 1 | 2, v)}
                      suffix="%"
                      step={0.01}
                    />
                    <InputField
                      label="USD 年利率"
                      value={phase.usdRate}
                      onChange={(v) => inputs.setPhaseUsdRate(i as 0 | 1 | 2, v)}
                      suffix="%"
                      step={0.01}
                    />
                  </div>
                  {i < 2 && <div className="border-t border-[#2e303a]" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-5 border border-[#818cf8]/30 bg-[#818cf8]/5">
              <div className="text-xs text-[#9ca3af] mb-2">HKD 實際等效年利率</div>
              <div className="text-2xl font-bold text-white mb-1">
                {fmtRate(result.hkdActualRate)}%
              </div>
              <div className="text-xs text-[#6b7280]">以存款日數加權平均計算</div>
            </div>
            <div className="rounded-xl p-5 border border-green-500/30 bg-green-500/5">
              <div className="text-xs text-[#9ca3af] mb-2">USD 實際等效年利率</div>
              <div className="text-2xl font-bold text-white mb-1">
                {fmtRate(result.usdActualRate)}%
              </div>
              <div className="text-xs text-[#6b7280]">以存款日數加權平均計算</div>
            </div>
          </div>

          <div className="bg-[#1a1d27] border border-[#2e303a] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">
              {inputs.currency === 'HKD' ? '港元' : '美元'} 利息明細
              <span className="ml-2 text-xs font-normal text-[#6b7280]">
                (本金 HK$ {fmt(Number(inputs.principal))})
              </span>
            </h2>
            <div className="space-y-3">
              {result.phaseResults.map((pr, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#2e303a] last:border-0">
                  <div>
                    <span className="text-sm text-[#9ca3af]">階段 {i + 1}</span>
                    <span className="ml-2 text-xs text-[#6b7280]">
                      {pr.days > 0 ? `${pr.days} 日 @ ${pr.rate}%` : '（不在存款期內）'}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${pr.interest > 0 ? 'text-white' : 'text-[#6b7280]'}`}>
                    {pr.interest > 0 ? `${inputs.currency === 'HKD' ? 'HK$' : 'US$'}${fmt(pr.interest)}` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-6 border border-[#6366f1]/30 bg-[#6366f1]/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#9ca3af] mb-1">總存款日數</div>
                <div className="text-2xl font-bold text-white">{result.totalDays} 日</div>
              </div>
              <div className="w-px h-12 bg-[#2e303a]" />
              <div className="text-right">
                <div className="text-sm text-[#9ca3af] mb-1">期滿總利息</div>
                <div className="text-2xl font-bold text-[#818cf8]">
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
