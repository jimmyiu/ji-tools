import { useMemo, useState } from 'react'
import Decimal from 'decimal.js'
import { addMonths, subDays, addDays, differenceInDays, getDate, parseISO, format, isLastDayOfMonth } from 'date-fns'

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

export const DAY_BASE = 365

export interface PeriodInfo {
  startDate: Date
  endDate: Date
  days: number
}

export function computeEndDate(startDate: Date, depositMonths: number): Date {
  const foo = addMonths(startDate, depositMonths)
  if (getDate(foo) === getDate(startDate)) {
    if (isLastDayOfMonth(foo)) {
      return foo
    }
    return subDays(foo, 1)
  }
  return foo
}

export function computePeriods(startDateStr: string, depositMonths: number, iterate: number): PeriodInfo[] {
  const periods: PeriodInfo[] = []
  let currentStart = parseISO(startDateStr)
  for (let i = 0; i < iterate; i++) {
    const endDate = computeEndDate(currentStart, depositMonths)
    const days = differenceInDays(endDate, currentStart) + 1
    periods.push({ startDate: currentStart, endDate, days })
    currentStart = addDays(endDate, 1)
  }
  return periods
}

interface InputState {
  initialPrincipal: string | number
  depositMonths: string | number
  iterate: string | number
  hkdRate: string | number
  usdRate: string | number
  bankSellRate: string | number
  bankBuyRate: string | number
  startDate: string
}

interface InputActions {
  setInitialPrincipal: (v: string) => void
  setDepositMonths: (v: string) => void
  setIterate: (v: string) => void
  setHkdRate: (v: string) => void
  setUsdRate: (v: string) => void
  setBankSellRate: (v: string) => void
  setBankBuyRate: (v: string) => void
  setStartDate: (v: string) => void
}

export function useInputs() {
  const [initialPrincipal, setInitialPrincipal] = useState<string | number>(100000)
  const [depositMonths, setDepositMonths] = useState<string | number>(3)
  const [iterate, setIterate] = useState<string | number>(1)
  const [hkdRate, setHkdRate] = useState<string | number>(2.25)
  const [usdRate, setUsdRate] = useState<string | number>(3.2)
  const [bankSellRate, setBankSellRate] = useState<string | number>(7.8468)
  const [bankBuyRate, setBankBuyRate] = useState<string | number>(7.8103)
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const state: InputState = {
    initialPrincipal,
    depositMonths,
    iterate,
    hkdRate,
    usdRate,
    bankSellRate,
    bankBuyRate,
    startDate,
  }

  const actions: InputActions = {
    setInitialPrincipal,
    setDepositMonths,
    setIterate,
    setHkdRate,
    setUsdRate,
    setBankSellRate,
    setBankBuyRate,
    setStartDate,
  }

  return { ...state, ...actions }
}

export function calculateCompoundDayBased(
  principal: Decimal,
  rate: Decimal,
  periods: PeriodInfo[],
  iterate: number
): Decimal {
  const dayBase = new Decimal(DAY_BASE)
  let current = principal
  for (let i = 0; i < iterate; i++) {
    const interest = current.times(rate).times(periods[i].days).div(dayBase)
    current = current.plus(interest)
  }
  return current
}

export function useCalculator(state: InputState) {
  return useMemo(() => {
    const { startDate } = state
    const initialPrincipal = Number(state.initialPrincipal) || 0
    const depositMonths = Number(state.depositMonths) || 3
    const iterate = Number(state.iterate) || 1
    const hkdRate = Number(state.hkdRate) || 0
    const usdRate = Number(state.usdRate) || 0
    const bankSellRate = Number(state.bankSellRate) || 0
    const bankBuyRate = Number(state.bankBuyRate) || 0

    const periods = computePeriods(startDate, depositMonths, iterate)
    const totalDays = periods.reduce((sum, p) => sum + p.days, 0)
    const startDateDisplay = format(periods[0].startDate, 'dd-MMM-yyyy')
    const endDateDisplay = format(periods[periods.length - 1].endDate, 'dd-MMM-yyyy')

    const p = new Decimal(initialPrincipal)
    const rH = new Decimal(hkdRate).div(100)
    const rU = new Decimal(usdRate).div(100)
    const s = new Decimal(bankSellRate)
    const b = new Decimal(bankBuyRate)

    const hkdTotal = calculateCompoundDayBased(p, rH, periods, iterate)
    const usdPrincipal = p.div(s)
    const usdTotalInUSD = calculateCompoundDayBased(usdPrincipal, rU, periods, iterate)
    const usdTotalInHkd = usdTotalInUSD.times(b)
    const difference = usdTotalInHkd.minus(hkdTotal)
    const usdWins = difference.gte(0)

    let breakEvenIterate: number | null = null
    let breakEvenDays: number | null = null
    if (!usdWins) {
      const maxIterate = Math.min(100, Math.ceil(1200 / depositMonths))
      const allPeriods = computePeriods(startDate, depositMonths, maxIterate)
      for (let n = 1; n <= maxIterate; n++) {
        const testPeriods = allPeriods.slice(0, n)
        const testHKD = calculateCompoundDayBased(p, rH, testPeriods, n)
        const testUSD = calculateCompoundDayBased(p.div(s), rU, testPeriods, n).times(b)
        if (testUSD.gte(testHKD)) {
          breakEvenIterate = n
          breakEvenDays = testPeriods.reduce((sum, p) => sum + p.days, 0)
          break
        }
      }
    }

    return {
      hkdTotal: hkdTotal.toNumber(),
      usdTotalInHkd: usdTotalInHkd.toNumber(),
      difference: difference.toNumber(),
      breakEvenIterate,
      breakEvenMonths: breakEvenIterate !== null ? breakEvenIterate * depositMonths : null,
      breakEvenDays,
      usdWins,
      startDateDisplay,
      endDateDisplay,
      totalDays,
    }
  }, [state])
}
