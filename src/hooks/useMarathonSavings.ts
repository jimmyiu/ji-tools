import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { computeMarathonSavings, type MarathonSavingsResult } from '../lib/marathon'
import type { Currency } from '../lib/calculator'
import { normalizePhases, type Phases } from '../lib/phases'

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
}

const defaultDates = {
  depositDate: toDateStr(new Date()),
}

const defaultPhases: Phases = [
  { startDate: '2026-10-02', endDate: '2026-11-30', hkdRate: 2.8, usdRate: 3.3 },
  { startDate: '2026-12-01', endDate: '2027-01-03', hkdRate: 3.0, usdRate: 3.5 },
  { startDate: '2027-01-04', endDate: '2027-02-01', hkdRate: 3.2, usdRate: 3.6 },
]

export function useInputs() {
  const [depositDate, setDepositDate] = useState(defaultDates.depositDate)
  const [currency, setCurrency] = useState<Currency>('HKD')
  const [principal, setPrincipal] = useState<string | number>(100000)
  const [phases, setPhases] = useState<Phases>(defaultPhases)

  const actions: InputActions = {
    setDepositDate,
    setCurrency,
    setPrincipal,
    setPhases: (next) => setPhases(normalizePhases(next)),
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
