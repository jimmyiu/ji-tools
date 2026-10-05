import { useState } from 'react'
import { History } from 'lucide-react'
import { MARATHON_SAVINGS_HISTORY, type MarathonSavingsPreset } from '@/lib/marathonPresets'
import { ResponsiveOverlay } from './ResponsiveOverlay'

interface PhaseRateHistoryProps {
  onLoad: (preset: MarathonSavingsPreset) => void
}

function presetLabel(preset: MarathonSavingsPreset): string {
  const firstPhase = preset.phases[0]
  const lastPhase = preset.phases[preset.phases.length - 1]
  const rates = preset.phases.map((phase) => `${phase.hkdRate}%`).join(' / ')
  return `${firstPhase.startDate} ~ ${lastPhase.endDate} (${rates})`
}

export function PhaseRateHistory({ onLoad }: PhaseRateHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)

  const close = () => {
    setIsOpen(false)
    setSelectedPresetId(null)
  }

  const open = () => {
    setSelectedPresetId(null)
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
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="載入歷史利率"
        className="text-primary transition-colors hover:text-primary/80"
      >
        <History className="h-4 w-4" />
      </button>
      <ResponsiveOverlay open={isOpen} onOpenChange={handleOpenChange} title="歷史階段利率">
        <div role="radiogroup" aria-label="歷史階段利率" className="max-h-[70svh] space-y-2 overflow-y-auto">
          {MARATHON_SAVINGS_HISTORY.map((preset) => {
            const isSelected = selectedPresetId === preset.id
            return (
              <label
                key={preset.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-input/30 hover:bg-accent'
                }`}
              >
                <input
                  type="radio"
                  name="marathon-history-preset"
                  value={preset.id}
                  checked={isSelected}
                  onChange={() => setSelectedPresetId(preset.id)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{presetLabel(preset)}</span>
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
            載入
          </button>
        </div>
      </ResponsiveOverlay>
    </>
  )
}
