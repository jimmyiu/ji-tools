import { fmtDateShort, fmtPhaseRate } from '@/lib/format'
import type { MarathonSavingsResult } from '@/lib/marathon'

interface PhaseRateTimelineProps {
  schedule: MarathonSavingsResult
}

const OPACITIES = [0.2, 0.35, 0.5]

export function PhaseRateTimeline({ schedule }: PhaseRateTimelineProps) {
  const phases = schedule.phaseResults
  const currency = schedule.currency

  if (schedule.totalDays === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        存款日期在所有階段之後
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-1 w-full">
        {phases.map((phase) => {
          const isMuted = phase.days === 0
          const opacity = OPACITIES[phase.index] || 0.5

          return (
            <div
              key={phase.index}
              data-testid="phase-band"
              className="flex flex-col items-center justify-center rounded-md min-w-[4.5rem] whitespace-nowrap overflow-hidden p-2 min-h-11"
              style={{
                flex: phase.width,
                backgroundColor: `color-mix(in oklab, var(--color-phase-bar) ${opacity * 100}%, transparent)`,
                opacity: isMuted ? 0.4 : 1,
              }}
            >
              <span className="text-xs font-bold text-phase-bar-foreground">
                {`${currency} ${fmtPhaseRate(phase.rate)}%`}
              </span>
            </div>
          )
        })}
      </div>

      <div className="relative text-xs mt-1 min-h-4 text-muted-foreground pointer-events-none">
        {phases.map((phase) =>
          phase.startDate !== '' ? (
            <span
              key={phase.index}
              className="absolute"
              style={{
                left: `${phase.position}%`,
                transform: phase.index === 0 ? 'translateX(0)' : 'translateX(-50%)',
              }}
            >
              {fmtDateShort(phase.startDate)}
            </span>
          ) : null
        )}
        {phases[phases.length - 1].endDate !== '' && (
          <span
            className="absolute"
            style={{
              right: '0',
              transform: 'translateX(0)',
            }}
          >
            {fmtDateShort(phases[phases.length - 1].endDate)}
          </span>
        )}
      </div>
    </div>
  )
}
