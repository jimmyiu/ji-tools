import { useMemo } from 'react'
import { compareFxDeposit, type FxDepositComparison } from '../lib/fxDeposit'

interface InputState {
  initialPrincipal: string | number
  depositMonths: string | number
  rolloverCount: string | number
  hkdRate: string | number
  usdRate: string | number
  bankSellRate: string | number
  bankBuyRate: string | number
  startDate: string
}

// Pass-through adapter: input coercion and defaults for the deep calculation
// module. All FX deposit comparison math lives in src/lib/fxDeposit.ts.
export function useCalculator(state: InputState): FxDepositComparison {
  return useMemo(
    () =>
      compareFxDeposit({
        startDate: state.startDate,
        // Field defaults: blank fields fall back to the calculator's starting
        // point rather than computing an empty comparison.
        principal: Number(state.initialPrincipal) || 0,
        depositMonths: Number(state.depositMonths) || 3,
        rolloverCount: Number(state.rolloverCount) || 1,
        hkdRate: Number(state.hkdRate) || 0,
        usdRate: Number(state.usdRate) || 0,
        bankSellRate: Number(state.bankSellRate) || 0,
        bankBuyRate: Number(state.bankBuyRate) || 0,
      }),
    [
      state.startDate,
      state.initialPrincipal,
      state.depositMonths,
      state.rolloverCount,
      state.hkdRate,
      state.usdRate,
      state.bankSellRate,
      state.bankBuyRate,
    ],
  )
}
