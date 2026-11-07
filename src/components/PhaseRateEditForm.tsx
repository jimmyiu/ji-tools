import { InputField } from './InputField'
import { DateField } from './DateField'
import {
  applyPhaseEndDate,
  applyPhaseStartDate,
  phaseDateBounds,
  type PhaseIndex,
  type PhaseState,
  type Phases,
} from '@/lib/phases'

interface PhaseRateEditFormProps {
  phases: Phases
  onChange: (updatedPhases: Phases) => void
}

function assertPhaseIndex(i: number): asserts i is PhaseIndex {
  if (i < 0 || i > 2) throw new Error(`Invalid phase index: ${i}`)
}

export function PhaseRateEditForm({ phases, onChange }: PhaseRateEditFormProps) {
  const updatePhase = (index: PhaseIndex, updates: Partial<PhaseState>) => {
    const next = [...phases] as Phases
    next[index] = { ...next[index], ...updates }
    onChange(next)
  }

  const updateStartDate = (index: PhaseIndex, v: string) => {
    onChange(applyPhaseStartDate(phases, index, v))
  }

  const updateEndDate = (index: PhaseIndex, v: string) => {
    onChange(applyPhaseEndDate(phases, index, v))
  }

  return (
    <div className="space-y-5">
      {phases.map((phase, i) => {
        assertPhaseIndex(i)
        const bounds = phaseDateBounds(phases, i)
        return (
          <div key={i} className="space-y-3">
            <div className="text-xs font-medium text-primary">
              階段 {i + 1}
              <span className="ml-2 text-muted-foreground/60">
                ({phase.startDate} ~ {phase.endDate})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <DateField
                label="開始日期"
                value={phase.startDate}
                onChange={(v) => updateStartDate(i, v)}
                min={bounds.minStart}
              />
              <DateField
                label="結束日期"
                value={phase.endDate}
                onChange={(v) => updateEndDate(i, v)}
                min={bounds.minEnd}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <InputField
                label="HKD 年利率"
                value={phase.hkdRate}
                onChange={(v) => updatePhase(i, { hkdRate: v })}
                suffix="%"
                step={0.01}
              />
              <InputField
                label="USD 年利率"
                value={phase.usdRate}
                onChange={(v) => updatePhase(i, { usdRate: v })}
                suffix="%"
                step={0.01}
              />
            </div>
            {i < phases.length - 1 && <div className="border-t border-border" />}
          </div>
        )
      })}
    </div>
  )
}
