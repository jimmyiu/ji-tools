import { useState } from 'react'
import { History } from 'lucide-react'
import { MARATHON_SAVINGS_HISTORY, type MarathonSavingsPreset } from '@/lib/marathonPresets'
import type { Currency } from '@/lib/calculator'
import { fmtPhaseRate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useToast } from '@/contexts/ToastContext'
import { ResponsiveOverlay } from './ResponsiveOverlay'
import { IconButton } from './IconButton'

interface PhaseRateHistoryProps {
  currency: Currency
  onLoad: (preset: MarathonSavingsPreset) => void
}

function presetDateRange(preset: MarathonSavingsPreset): string {
  const firstPhase = preset.phases[0]
  const lastPhase = preset.phases[preset.phases.length - 1]
  return `${firstPhase.startDate} ~ ${lastPhase.endDate}`
}

function presetRates(preset: MarathonSavingsPreset, rateKey: 'hkdRate' | 'usdRate'): string {
  return preset.phases.map((phase) => `${fmtPhaseRate(phase[rateKey])}%`).join(' / ')
}

function presetLabel(preset: MarathonSavingsPreset): string {
  const hkd = presetRates(preset, 'hkdRate')
  const usd = presetRates(preset, 'usdRate')
  return `${presetDateRange(preset)} (HKD ${hkd}；USD ${usd})`
}

export function PhaseRateHistory({ currency, onLoad }: PhaseRateHistoryProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)

  const close = () => {
    setIsOpen(false)
    setSelectedPresetId(null)
  }

  const open = () => {
    setSelectedPresetId(MARATHON_SAVINGS_HISTORY[0]?.id ?? null)
    setIsOpen(true)
  }

  const handleOpenChange = (next: boolean) => {
    if (next) open()
    else close()
  }

  const applySelectedPreset = () => {
    const preset = MARATHON_SAVINGS_HISTORY.find(({ id }) => id === selectedPresetId)
    if (!preset) return
    onLoad(preset)
    close()
    toast({ title: '已成功套用歷史利率' })
  }

  return (
    <>
      <IconButton onClick={open} aria-label="歷史階段利率">
        <History className="h-4 w-4" />
      </IconButton>
      <ResponsiveOverlay open={isOpen} onOpenChange={handleOpenChange} title="歷史階段利率">
        <div role="radiogroup" aria-label="歷史階段利率" className="max-h-[70svh] space-y-2 overflow-y-auto">
          {MARATHON_SAVINGS_HISTORY.map((preset) => {
            const isSelected = selectedPresetId === preset.id
            const isHkdActive = currency === 'HKD'
            return (
              <label
                key={preset.id}
                data-selected={isSelected}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-input/30 hover:bg-accent'
                )}
              >
                <input
                  type="radio"
                  name="marathon-history-preset"
                  value={preset.id}
                  checked={isSelected}
                  onChange={() => setSelectedPresetId(preset.id)}
                  aria-label={presetLabel(preset)}
                  className="sr-only"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {presetDateRange(preset)}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span
                      data-testid={`preset-${preset.id}-hkd`}
                      data-active={isHkdActive}
                      className={cn(
                        'flex items-center justify-between gap-4 text-sm tabular-nums',
                        isHkdActive
                          ? 'font-semibold text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      <span>HKD</span>
                      <span>{presetRates(preset, 'hkdRate')}</span>
                    </span>
                    <span
                      data-testid={`preset-${preset.id}-usd`}
                      data-active={!isHkdActive}
                      className={cn(
                        'flex items-center justify-between gap-4 text-sm tabular-nums',
                        !isHkdActive
                          ? 'font-semibold text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      <span>USD</span>
                      <span>{presetRates(preset, 'usdRate')}</span>
                    </span>
                  </span>
                </span>
              </label>
            )
          })}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            取消
          </button>
          <button
            type="button"
            onClick={applySelectedPreset}
            disabled={selectedPresetId === null}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            套用
          </button>
        </div>
      </ResponsiveOverlay>
    </>
  )
}
