import { useState, type ReactNode } from 'react'
import { History, X } from 'lucide-react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { MARATHON_SAVINGS_HISTORY, type MarathonSavingsPreset } from '@/lib/marathonPresets'
import { SectionHeader } from './SectionHeader'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'

interface PhaseRateHistoryProps {
  onLoad: (preset: MarathonSavingsPreset) => void
}

function presetLabel(preset: MarathonSavingsPreset): string {
  const firstPhase = preset.phases[0]
  const lastPhase = preset.phases[preset.phases.length - 1]
  const rates = preset.phases.map((phase) => `${phase.hkdRate}%`).join(' / ')
  return `${firstPhase.startDate} – ${lastPhase.endDate} · ${rates}`
}

export function PhaseRateHistory({ onLoad }: PhaseRateHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const close = () => {
    setIsOpen(false)
    setSelectedPresetId(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setSelectedPresetId(null)
      setIsOpen(true)
    } else {
      close()
    }
  }

  const applySelectedPreset = () => {
    const preset = MARATHON_SAVINGS_HISTORY.find(({ id }) => id === selectedPresetId)
    if (!preset) return
    onLoad(preset)
    close()
  }

  const pickerContent = (
    <>
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
    </>
  )

  const renderOverlayContent = (closeAction: ReactNode) => (
    <>
      <SectionHeader title="歷史階段利率" action={closeAction} />
      {pickerContent}
    </>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        aria-label="載入歷史利率"
        className="text-primary transition-colors hover:text-primary/80"
      >
        <History className="h-4 w-4" />
      </button>
      {isDesktop ? (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent
            hideClose
            aria-describedby={undefined}
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <DialogTitle className="sr-only">歷史階段利率</DialogTitle>
            {renderOverlayContent(
              <DialogClose asChild>
                <button
                  type="button"
                  aria-label="關閉"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>,
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
          <SheetContent
            hideClose
            aria-describedby={undefined}
            side="bottom"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <SheetTitle className="sr-only">歷史階段利率</SheetTitle>
            {renderOverlayContent(
              <SheetClose asChild>
                <button
                  type="button"
                  aria-label="關閉"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </SheetClose>,
            )}
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
