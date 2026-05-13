import { useInputs, useCalculator } from '../hooks/useCalculator'

function fmt(n: number) {
  return n.toLocaleString('zh-HK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col h-full">
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

function ReadonlyDateField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col h-full">
      <label className="block text-xs text-[#9ca3af] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          readOnly
          tabIndex={-1}
          className="w-full bg-[#12151e] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm text-[#9ca3af] cursor-default"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b5563] text-xs">🔒</span>
      </div>
    </div>
  )
}

export default function FxDepositCompare() {
  const inputs = useInputs()
  const result = useCalculator(inputs)
  const hkdInterest = result.hkdTotal - Number(inputs.initialPrincipal)
  const usdInterestInHkd = result.usdTotalInHkd - Number(inputs.initialPrincipal)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      <p className="text-sm text-[#9ca3af] mb-8">
        比較港元定存與美元定存的實際淨回報，計算匯率差價影響及追平所需時間。
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1d27] border border-[#2e303a] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">輸入參數</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DateField
                label="開始日期"
                value={inputs.startDate}
                onChange={inputs.setStartDate}
              />
              <ReadonlyDateField
                label="結束日期"
                value={result.endDateDisplay}
              />
            </div>
            <InputField
              label="初始本金 (HKD)"
              value={inputs.initialPrincipal}
              onChange={inputs.setInitialPrincipal}
              step={1000}
            />
            <InputField
              label="存款月數"
              value={inputs.depositMonths}
              onChange={inputs.setDepositMonths}
              suffix="個月"
              step={1}
            />
            <InputField
              label="滾存次數 (Iterate)"
              value={inputs.iterate}
              onChange={inputs.setIterate}
              suffix="次"
              step={1}
              min={1}
            />
            <InputField
              label="港元定存年利率"
              value={inputs.hkdRate}
              onChange={inputs.setHkdRate}
              suffix="%"
              step={0.01}
            />
            <InputField
              label="美元定存年利率"
              value={inputs.usdRate}
              onChange={inputs.setUsdRate}
              suffix="%"
              step={0.01}
            />
            <InputField
              label="銀行賣出價 (HKD → USD)"
              value={inputs.bankSellRate}
              onChange={inputs.setBankSellRate}
              suffix="HKD/USD"
              step={0.001}
            />
            <InputField
              label="銀行買入價 (USD → HKD)"
              value={inputs.bankBuyRate}
              onChange={inputs.setBankBuyRate}
              suffix="HKD/USD"
              step={0.001}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-[#1a1d27] border border-[#2e303a] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-1">計算結果</h2>
            <p className="text-xs text-[#9ca3af] mb-5">
              {inputs.iterate} 次滾存 · 共 {result.totalDays} 日
            </p>
            <div className="space-y-4">
              <div className="flex items-start justify-between py-3 border-b border-[#2e303a]">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[#9ca3af]">港元實賺利息</span>
                  <span className="block text-xs text-[#6b7280]">
                    連本金總額: HK$ {fmt(result.hkdTotal)}
                  </span>
                </div>
                <span className="text-base font-semibold text-white whitespace-nowrap ml-2">
                  HK$ {fmt(hkdInterest)}
                </span>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-[#2e303a]">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[#9ca3af]">美元實賺利息 (換回HKD)</span>
                  <span className="block text-xs text-[#6b7280]">
                    連本金總額: HK$ {fmt(result.usdTotalInHkd)}
                  </span>
                </div>
                <span className="text-base font-semibold text-white whitespace-nowrap ml-2">
                  HK$ {fmt(usdInterestInHkd)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-[#9ca3af]">兩者淨差額</span>
                <span className={`text-base font-semibold whitespace-nowrap ml-2 ${result.usdWins ? 'text-green-400' : 'text-red-400'}`}>
                  {result.difference >= 0 ? '+' : ''}HK$ {fmt(result.difference)}
                </span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 border ${result.usdWins ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-3 ${result.usdWins ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                <span>{result.usdWins ? '🏆' : '📉'}</span>
                <span>{result.usdWins ? '美元定存較佳' : '港元定存較佳'}</span>
              </div>
              {!result.usdWins && result.breakEvenIterate !== null && (
                <div>
                  <p className="text-4xl font-bold text-white mb-1">{result.breakEvenIterate} 次滾存</p>
                  <p className="text-sm text-[#9ca3af]">共 {result.breakEvenDays} 日（約 {result.breakEvenMonths} 個月）後可追平並反超</p>
                  <p className="text-xs text-[#6b7280] mt-2">
                    需將美元定存滾存 {result.breakEvenIterate} 次（共 {result.breakEvenDays} 日），才能抵消匯率差價造成的損失
                  </p>
                </div>
              )}
              {result.usdWins && (
                <div>
                  <p className="text-3xl font-bold text-green-400 mb-1">+HK$ {fmt(result.difference)}</p>
                  <p className="text-sm text-[#9ca3af]">美元定存實際回報更高</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}