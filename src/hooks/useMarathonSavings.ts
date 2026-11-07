import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { computeMarathonSavings, type MarathonSavingsResult } from '../lib/marathon'
import type { Currency } from '../lib/calculator'
import { normalizePhases, type Phases } from '../lib/phases'
import { DEFAULT_MARATHON_PHASES, type MarathonSavingsPreset } from '../lib/marathonPresets'

function toDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export interface InputState {
  depositDate: string
  currency: Currency
  principal: string | number
  phases: Phases
}

interface InputActions {
  setDepositDate: (v: string) => void
  setCurrency: (v: Currency) => void
  setPrincipal: (v: string) => void
  setPhases: (phases: Phases) => void
  applyPreset: (preset: MarathonSavingsPreset) => void
}

const defaultDates = {
  depositDate: toDateStr(new Date()),
}

export function useInputs() {
  const [depositDate, setDepositDate] = useState(defaultDates.depositDate)
  const [currency, setCurrency] = useState<Currency>('HKD')
  const [principal, setPrincipal] = useState<string | number>(100000)
  const [phases, setPhases] = useState<Phases>(() =>
    DEFAULT_MARATHON_PHASES.map((phase) => ({ ...phase })) as Phases,
  )

  const actions: InputActions = {
    setDepositDate,
    setCurrency,
    setPrincipal,
    setPhases: (next) => setPhases(normalizePhases(next)),
    // One action so the loaded schedule is never half applied: phases and the
    // deposit date land together, and the date always matches phase 0's start.
    applyPreset: (preset) => {
      const next = normalizePhases(preset.phases)
      setPhases(next)
      setDepositDate(next[0].startDate)
    },
  }

  return { depositDate, currency, principal, phases, ...actions }
}

export function useCalculator(state: InputState): MarathonSavingsResult {
  const principal = Number(state.principal) || 0
  return useMemo(
    () => computeMarathonSavings(state.phases, state.depositDate, principal, state.currency),
    [state.phases, state.depositDate, principal, state.currency],
  )
}
