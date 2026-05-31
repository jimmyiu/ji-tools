import { useMemo } from 'react'
import { parseISO, differenceInDays, addDays } from 'date-fns'
import { fmtDateShort } from '@/lib/format'
import type { PhaseState, Currency } from '@/hooks/useMarathonSavings'

interface PhaseRateTimelineProps {
  phases: PhaseState[]
  depositDate: string
  currency: Currency
}

function effectiveDays(depositDate: Date, phaseStartDate: Date, phaseEndDate: Date): number {
  const effectiveStart = depositDate > phaseStartDate ? depositDate : phaseStartDate
  if (effectiveStart > phaseEndDate) return 0
  return differenceInDays(phaseEndDate, effectiveStart) + 1
}

function phaseDuration(startDate: string, endDate: string): number {
  return Math.max(differenceInDays(parseISO(endDate), parseISO(startDate)) + 1, 1)
}

export function PhaseRateTimeline({ phases, depositDate, currency }: PhaseRateTimelineProps) {
  const phaseData = useMemo(() => {
    const deposit = parseISO(depositDate)

    const { data } = phases.reduce<{
      data: Array<PhaseState & { days: number; duration: number }>
      previousEffectiveEnd: Date | null
    }>(
      (acc, phase) => {
        const start = parseISO(phase.startDate)
        const end = parseISO(phase.endDate)
        const clampedStart = acc.previousEffectiveEnd !== null && start <= acc.previousEffectiveEnd
          ? addDays(acc.previousEffectiveEnd, 1)
          : start
        const days = effectiveDays(deposit, clampedStart, end)
        const duration = phaseDuration(phase.startDate, phase.endDate)
        const effectiveEnd = days > 0 ? addDays(clampedStart, days - 1) : null

        acc.data.push({
          ...phase,
          startDate: phase.startDate,
          endDate: phase.endDate,
          days,
          duration,
        })
        if (effectiveEnd) acc.previousEffectiveEnd = effectiveEnd

        return acc
      },
      { data: [], previousEffectiveEnd: null }
    )

    const totalDuration = data.reduce((sum, p) => sum + p.duration, 0)
    const totalDays = data.reduce((sum, p) => sum + p.days, 0)
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
                {currency === 'HKD' ? `HKD ${phase.hkdRate}%` : `USD ${phase.usdRate}%`}
              </span>
            </div>
          )
        })}
      </div>

      <div className="relative text-xs mt-1 min-h-4 text-muted-foreground pointer-events-none">
        {phaseData.data.map((phase, i) => (
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
        ))}
        <span
          className="absolute"
          style={{
            right: '0',
            transform: 'translateX(0)',
          }}
        >
          {fmtDateShort(phaseData.data[phaseData.data.length - 1].endDate)}
        </span>
      </div>
    </div>
  )
}
