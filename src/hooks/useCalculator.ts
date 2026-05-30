import { useMemo } from 'react'
import Decimal from 'decimal.js'
import { format } from 'date-fns'
import {
  computePeriods,
  DAY_BASE_MAP,
  calculateCompoundDayBased,
} from '../lib/calculator'

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

export function useCalculator(state: InputState) {
  const startDate = state.startDate
  const initialPrincipal = Number(state.initialPrincipal) || 0
  const depositMonths = Number(state.depositMonths) || 3
  const iterate = Number(state.iterate) || 1
  const hkdRate = Number(state.hkdRate) || 0
  const usdRate = Number(state.usdRate) || 0
  const bankSellRate = Number(state.bankSellRate) || 0
  const bankBuyRate = Number(state.bankBuyRate) || 0

  return useMemo(() => {
    const periods = computePeriods(startDate, depositMonths, iterate)
    const totalDays = periods.reduce((sum, p) => sum + p.length, 0)
    const startDateDisplay = format(periods[0].startDate, 'dd-MMM-yyyy')
    const endDateDisplay = format(periods[periods.length - 1].endDate, 'dd-MMM-yyyy')

    const p = new Decimal(initialPrincipal)
    const rH = new Decimal(hkdRate).div(100)
    const rU = new Decimal(usdRate).div(100)
    const s = new Decimal(bankSellRate)
    const b = new Decimal(bankBuyRate)
    const dayCounts = periods.map(per => per.length)

    const hkdTotal = calculateCompoundDayBased(p, rH, dayCounts, DAY_BASE_MAP.HKD)
    const usdPrincipal = p.div(s)
    const usdTotalInUSD = calculateCompoundDayBased(usdPrincipal, rU, dayCounts, DAY_BASE_MAP.USD)
    const usdTotalInHkd = usdTotalInUSD.times(b)
    const difference = usdTotalInHkd.minus(hkdTotal)
    const usdWins = difference.gte(0)

    let breakEvenIterate: number | null = null
    let breakEvenDays: number | null = null
    if (!usdWins) {
      const maxIterate = Math.min(100, Math.ceil(1200 / depositMonths))
      const allPeriods = computePeriods(startDate, depositMonths, maxIterate)
      const allDayCounts = allPeriods.map(per => per.length)
      for (let n = 1; n <= maxIterate; n++) {
        const testDayCounts = allDayCounts.slice(0, n)
        const testHKD = calculateCompoundDayBased(p, rH, testDayCounts, DAY_BASE_MAP.HKD)
        const testUSD = calculateCompoundDayBased(p.div(s), rU, testDayCounts, DAY_BASE_MAP.USD).times(b)
        if (testUSD.gte(testHKD)) {
          breakEvenIterate = n
          breakEvenDays = testDayCounts.reduce((sum, d) => sum + d, 0)
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
  }, [startDate, initialPrincipal, depositMonths, iterate, hkdRate, usdRate, bankSellRate, bankBuyRate])
}
