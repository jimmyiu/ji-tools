import { InputField } from './InputField'
import { DateField } from './DateField'
import type { PhaseState } from '@/hooks/useMarathonSavings'

interface PhaseRateEditFormProps {
  phases: PhaseState[]
  onChange: (updatedPhases: PhaseState[]) => void
}

function assertPhaseIndex(i: number): asserts i is 0 | 1 | 2 {
  if (i < 0 || i > 2) throw new Error(`Invalid phase index: ${i}`)
}

export function PhaseRateEditForm({ phases, onChange }: PhaseRateEditFormProps) {
  const updatePhase = (index: number, updates: Partial<PhaseState>) => {
    const next = [...phases]
    next[index] = { ...next[index], ...updates }
    onChange(next)
  }

  return (
    <div className="space-y-5">
      {phases.map((phase, i) => {
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
                onChange={(v) => updatePhase(i, { startDate: v })}
              />
              <DateField
                label="結束日期"
                value={phase.endDate}
                onChange={(v) => updatePhase(i, { endDate: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
