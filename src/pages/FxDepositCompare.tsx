import { InputField } from '../components/InputField'
import { DateField } from '../components/DateField'
import { ReadonlyDateField } from '../components/ReadonlyDateField'
import { useCalculator } from '../hooks/useCalculator'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { fmt } from '../lib/format'

const amountRegex = /^\d+(\.\d+)?$/
const intRegex = /^\d+$/

const schema = z.object({
  startDate: z.string().min(1, '請選擇開始日期'),
  initialPrincipal: z.string().min(1, '請輸入本金').regex(amountRegex, '請輸入有效金額'),
  depositMonths: z.string().min(1, '請輸入存款月數').regex(amountRegex, '請輸入有效數字'),
  iterate: z.string().min(1, '請輸入滾存次數').regex(intRegex, '請輸入整數'),
  hkdRate: z.string().min(1, '請輸入港元利率').regex(amountRegex, '請輸入有效利率'),
  usdRate: z.string().min(1, '請輸入美元利率').regex(amountRegex, '請輸入有效利率'),
  bankSellRate: z.string().min(1, '請輸入賣出價').regex(amountRegex, '請輸入有效匯率'),
  bankBuyRate: z.string().min(1, '請輸入買入價').regex(amountRegex, '請輸入有效匯率'),
})

type FormData = z.infer<typeof schema>

export default function FxDepositCompare() {
  const {
    control,
    setValue,
    formState,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: format(new Date(), 'yyyy-MM-dd'),
      initialPrincipal: '100000',
      depositMonths: '3',
      iterate: '1',
      hkdRate: '2.25',
      usdRate: '3.2',
      bankSellRate: '7.8574',
      bankBuyRate: '7.8154',
    },
    mode: 'onTouched',
  })

  const startDate = useWatch({ control, name: 'startDate' })
  const initialPrincipal = useWatch({ control, name: 'initialPrincipal' })
  const depositMonths = useWatch({ control, name: 'depositMonths' })
  const iterate = useWatch({ control, name: 'iterate' })
  const hkdRate = useWatch({ control, name: 'hkdRate' })
  const usdRate = useWatch({ control, name: 'usdRate' })
  const bankSellRate = useWatch({ control, name: 'bankSellRate' })
  const bankBuyRate = useWatch({ control, name: 'bankBuyRate' })

  const result = useCalculator({
    startDate,
    initialPrincipal,
    depositMonths,
    iterate,
    hkdRate,
    usdRate,
    bankSellRate,
    bankBuyRate,
  })
  const principal = Number(initialPrincipal) || 0
  const hkdInterest = result.hkdTotal - principal
  const usdInterestInHkd = result.usdTotalInHkd - principal

  const handleChange = (field: keyof FormData) => (v: string) => setValue(field, v, { shouldValidate: true })

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 page-enter">
      <p className="text-sm text-muted-foreground mb-8">
        比較港元定存與美元定存的實際淨回報，計算匯率差價影響及追平所需時間。
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-5">輸入參數</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DateField
                label="開始日期"
                value={startDate}
                onChange={handleChange('startDate')}
              />
              <ReadonlyDateField
                label="結束日期"
                value={result.endDateDisplay}
              />
            </div>
            <InputField
              label="初始本金 (HKD)"
              value={initialPrincipal}
              onChange={handleChange('initialPrincipal')}
              step={1000}
              error={formState.errors.initialPrincipal?.message}
            />
            <InputField
              label="存款月數"
              value={depositMonths}
              onChange={handleChange('depositMonths')}
              suffix="個月"
              step={1}
              error={formState.errors.depositMonths?.message}
            />
            <InputField
              label="滾存次數 (Iterate)"
              value={iterate}
              onChange={handleChange('iterate')}
              suffix="次"
              step={1}
              min={1}
              error={formState.errors.iterate?.message}
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="港元定存年利率"
                value={hkdRate}
                onChange={handleChange('hkdRate')}
                suffix="%"
                step={0.01}
                error={formState.errors.hkdRate?.message}
              />
              <InputField
                label="美元定存年利率"
                value={usdRate}
                onChange={handleChange('usdRate')}
                suffix="%"
                step={0.01}
                error={formState.errors.usdRate?.message}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="銀行賣出價 (HKD → USD)"
                value={bankSellRate}
                onChange={handleChange('bankSellRate')}
                suffix="HKD/USD"
                step={0.001}
                error={formState.errors.bankSellRate?.message}
              />
              <InputField
                label="銀行買入價 (USD → HKD)"
                value={bankBuyRate}
                onChange={handleChange('bankBuyRate')}
                suffix="HKD/USD"
                step={0.001}
                error={formState.errors.bankBuyRate?.message}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-foreground mb-1">計算結果</h2>
            <p className="text-xs text-muted-foreground mb-5">
              {iterate} 次滾存 · 共 {result.totalDays} 日
            </p>
            <div className="space-y-4">
              <div className="flex items-start justify-between py-3 border-b border-border">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-muted-foreground">港元實賺利息</span>
                  <span className="block text-xs text-muted-foreground/60">
                    連本金總額: HK$ {fmt(result.hkdTotal)}
                  </span>
                </div>
                <span className="text-base font-semibold text-foreground whitespace-nowrap ml-2">
                  HK$ {fmt(hkdInterest)}
                </span>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-border">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-muted-foreground">美元實賺利息 (換回HKD)</span>
                  <span className="block text-xs text-muted-foreground/60">
                    連本金總額: HK$ {fmt(result.usdTotalInHkd)}
                  </span>
                </div>
                <span className="text-base font-semibold text-foreground whitespace-nowrap ml-2">
                  HK$ {fmt(usdInterestInHkd)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">兩者淨差額</span>
                <span className={`text-base font-semibold whitespace-nowrap ml-2 ${result.usdWins ? 'text-positive' : 'text-negative'}`}>
                  {result.difference >= 0 ? '+' : ''}HK$ {fmt(result.difference)}
                </span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 border ${result.usdWins ? 'border-positive/30 bg-positive/5' : 'border-negative/30 bg-negative/5'}`}>
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-3 ${result.usdWins ? 'bg-positive/15 text-positive' : 'bg-negative/15 text-negative'}`}>
                <span>{result.usdWins ? '🏆' : '📉'}</span>
                <span>{result.usdWins ? '美元定存較佳' : '港元定存較佳'}</span>
              </div>
              {!result.usdWins && result.breakEvenIterate !== null && (
                <div>
                  <p className="text-4xl font-bold text-foreground mb-1">{result.breakEvenIterate} 次滾存</p>
                  <p className="text-sm text-muted-foreground">共 {result.breakEvenDays} 日（約 {result.breakEvenMonths} 個月）後可追平並反超</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    需將美元定存滾存 {result.breakEvenIterate} 次（共 {result.breakEvenDays} 日），才能抵消匯率差價造成的損失
                  </p>
                </div>
              )}
              {result.usdWins && (
                <div>
                  <p className="text-3xl font-bold text-positive mb-1">+HK$ {fmt(result.difference)}</p>
                  <p className="text-sm text-muted-foreground">美元定存實際回報更高</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground/50 mt-6 text-center">
        *利息以每年365日（港元）及360日（美元）計算
      </p>
    </div>
  )
}
