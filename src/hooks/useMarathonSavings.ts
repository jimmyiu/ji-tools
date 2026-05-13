import { useMemo, useState } from 'react'
import { differenceInDays, parseISO, format } from 'date-fns'
import Decimal from 'decimal.js'

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

function toDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

function parseDateStr(str: string): Date {
  return parseISO(str)
}

export type Currency = 'HKD' | 'USD'

export interface PhaseState {
  startDate: string
  endDate: string
  hkdRate: string | number
  usdRate: string | number
}

export interface InputState {
  depositDate: string
  currency: Currency
  principal: string | number
  phases: [PhaseState, PhaseState, PhaseState]
}

interface InputActions {
  setDepositDate: (v: string) => void
  setCurrency: (v: Currency) => void
  setPrincipal: (v: string) => void
  setPhaseStartDate: (index: 0 | 1 | 2, v: string) => void
  setPhaseEndDate: (index: 0 | 1 | 2, v: string) => void
  setPhaseHkdRate: (index: 0 | 1 | 2, v: string) => void
  setPhaseUsdRate: (index: 0 | 1 | 2, v: string) => void
}

const defaultDates = {
  depositDate: toDateStr(new Date()),
  phase1Start: '2026-05-04',
  phase1End: '2026-07-01',
  phase2Start: '2026-07-02',
  phase2End: '2026-08-02',
  phase3Start: '2026-08-03',
  phase3End: '2026-08-31',
}

const defaultPhases: [PhaseState, PhaseState, PhaseState] = [
  { startDate: '2026-05-04', endDate: '2026-07-01', hkdRate: 1.85, usdRate: 3.0 },
  { startDate: '2026-07-02', endDate: '2026-08-02', hkdRate: 2.0, usdRate: 3.1 },
  { startDate: '2026-08-03', endDate: '2026-08-31', hkdRate: 2.2, usdRate: 3.3 },
]

export function useInputs() {
  const [depositDate, setDepositDate] = useState(defaultDates.depositDate)
  const [currency, setCurrency] = useState<Currency>('HKD')
  const [principal, setPrincipal] = useState<string | number>(100000)
  const [phases, setPhases] = useState<[PhaseState, PhaseState, PhaseState]>(defaultPhases)

  const actions: InputActions = {
    setDepositDate,
    setCurrency,
    setPrincipal,
    setPhaseStartDate: (index, v) =>
      setPhases((prev) => {
        const next = [...prev] as [PhaseState, PhaseState, PhaseState]
        next[index] = { ...next[index], startDate: v }
        return next
      }),
    setPhaseEndDate: (index, v) =>
      setPhases((prev) => {
        const next = [...prev] as [PhaseState, PhaseState, PhaseState]
        next[index] = { ...next[index], endDate: v }
        return next
      }),
    setPhaseHkdRate: (index, v) =>
      setPhases((prev) => {
        const next = [...prev] as [PhaseState, PhaseState, PhaseState]
        next[index] = { ...next[index], hkdRate: v }
        return next
      }),
    setPhaseUsdRate: (index, v) =>
      setPhases((prev) => {
        const next = [...prev] as [PhaseState, PhaseState, PhaseState]
        next[index] = { ...next[index], usdRate: v }
        return next
      }),
  }

  return { depositDate, currency, principal, phases, ...actions }
}

function effectiveDays(depositDate: Date, phaseStartDate: Date, phaseEndDate: Date): number {
  const effectiveStart = depositDate > phaseStartDate ? depositDate : phaseStartDate
  if (effectiveStart > phaseEndDate) return 0
  return differenceInDays(phaseEndDate, effectiveStart) + 1
}

function phaseInterest(principal: number, rate: number, days: number, currency: Currency): number {
  const dayBase = currency === 'USD' ? 360 : 365
  return new Decimal(principal).times(rate).div(100).times(days).div(dayBase).toNumber()
}

export interface PhaseResult {
  days: number
  rate: number
  interest: number
}

export interface Result {
  hkdActualRate: number
  usdActualRate: number
  phaseResults: PhaseResult[]
  totalDays: number
  totalInterest: number
}

export function useCalculator(state: InputState): Result {
  return useMemo(() => {
    const deposit = parseDateStr(state.depositDate)
    const principal = Number(state.principal) || 0

    const phaseDays: number[] = []
    const phaseRatesHKD: number[] = []
    const phaseRatesUSD: number[] = []

    for (let i = 0; i < 3; i++) {
      const p = state.phases[i]
      const start = parseDateStr(p.startDate)
      const end = parseDateStr(p.endDate)
      const days = effectiveDays(deposit, start, end)
      phaseDays.push(days)
      phaseRatesHKD.push(Number(p.hkdRate) || 0)
      phaseRatesUSD.push(Number(p.usdRate) || 0)
    }

    let totalWeightedHKD = 0
    let totalWeightedUSD = 0
    let totalDays = 0
    for (let i = 0; i < 3; i++) {
      totalWeightedHKD += phaseDays[i] * phaseRatesHKD[i]
      totalWeightedUSD += phaseDays[i] * phaseRatesUSD[i]
      totalDays += phaseDays[i]
    }

    const hkdActualRate = totalDays === 0 ? 0 : totalWeightedHKD / totalDays
    const usdActualRate = totalDays === 0 ? 0 : totalWeightedUSD / totalDays

    const phaseResults: PhaseResult[] = state.phases.map((p, i) => {
      const rate = state.currency === 'HKD' ? (Number(p.hkdRate) || 0) : (Number(p.usdRate) || 0)
      const interest = phaseInterest(principal, rate, phaseDays[i], state.currency)
      return { days: phaseDays[i], rate, interest }
    })

    const totalInterest = phaseResults.reduce((sum, r) => sum + r.interest, 0)

    return {
      hkdActualRate,
      usdActualRate,
      phaseResults,
      totalDays,
      totalInterest,
    }
  }, [state])
}
