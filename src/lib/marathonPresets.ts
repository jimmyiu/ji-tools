import type { Phases } from './phases'

export interface MarathonSavingsPreset {
  id: string
  phases: Phases
}

export const DEFAULT_MARATHON_PHASES: Phases = [
  { startDate: '2026-10-02', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3 },
  { startDate: '2026-12-01', endDate: '2027-01-03', hkdRate: 3.0, usdRate: 3.5 },
  { startDate: '2027-01-04', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
]

export const MARATHON_SAVINGS_HISTORY: readonly MarathonSavingsPreset[] = [
  {
    id: 'default-marathon-period',
    phases: DEFAULT_MARATHON_PHASES,
  },
].sort((a, b) => b.phases[0].startDate.localeCompare(a.phases[0].startDate))
