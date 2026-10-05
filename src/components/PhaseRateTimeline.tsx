import { useMemo } from 'react'
import { fmtDateShort, fmtPhaseRate } from '@/lib/format'
import { computePhaseDays } from '@/lib/marathon'
import type { PhaseState } from '@/lib/phases'
import type { Currency } from '@/lib/calculator'

interface PhaseRateTimelineProps {
  phases: PhaseState[]
  depositDate: string
  currency: Currency
}

export function PhaseRateTimeline({ phases, depositDate, currency }: PhaseRateTimelineProps) {
  const phaseData = useMemo(() => {
    const { phases: allocation, totalDays, totalDuration } = computePhaseDays(phases, depositDate)
    const data = phases.map((phase, i) => ({
      ...phase,
      days: allocation[i].days,
      duration: allocation[i].duration,
    }))
    const computedBoundaries = data.reduce<{ runningTotal: number; boundaries: number[] }>(
      (acc, p) => {
        acc.boundaries.push(
          totalDuration > 0 ? (acc.runningTotal / totalDuration) * 100 : 0
        )
        acc.runningTotal += p.duration
        return acc
      },
      { runningTotal: 0, boundaries: [] }
    ).boundaries
    computedBoundaries.push(100)

    return { data, totalDays, totalDuration, boundaries: computedBoundaries }
  }, [phases, depositDate])

  const opacities = [0.2, 0.35, 0.5]

  if (phaseData.totalDays === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        存款日期在所有階段之後
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-1 w-full">
        {phaseData.data.map((phase, i) => {
          const isMuted = phase.days === 0
          const opacity = opacities[i] || 0.5

          return (
            <div
              key={phase.startDate + '-' + phase.endDate}
              className="flex flex-col items-center justify-center rounded-md min-w-[4.5rem] whitespace-nowrap overflow-hidden p-2 min-h-11"
              style={{
                flex: phase.duration,
                backgroundColor: `color-mix(in oklab, var(--color-phase-bar) ${opacity * 100}%, transparent)`,
                opacity: isMuted ? 0.4 : 1,
              }}
            >
              <span className="text-xs font-bold text-phase-bar-foreground">
                {currency === 'HKD'
                  ? `HKD ${fmtPhaseRate(phase.hkdRate)}%`
                  : `USD ${fmtPhaseRate(phase.usdRate)}%`}
              </span>
            </div>
          )
        })}
      </div>

      <div className="relative text-xs mt-1 min-h-4 text-muted-foreground pointer-events-none">
        {phaseData.data.map((phase, i) =>
          phase.startDate !== '' ? (
            <span
              key={phase.startDate + '-' + phase.endDate}
              className="absolute"
              style={{
                left: `${phaseData.boundaries[i]}%`,
                transform: i === 0 ? 'translateX(0)' : 'translateX(-50%)',
              }}
            >
              {fmtDateShort(phase.startDate)}
            </span>
          ) : null
        )}
        {phaseData.data[phaseData.data.length - 1].endDate !== '' && (
          <span
            className="absolute"
            style={{
              right: '0',
              transform: 'translateX(0)',
            }}
          >
            {fmtDateShort(phaseData.data[phaseData.data.length - 1].endDate)}
          </span>
        )}
      </div>
    </div>
  )
}
