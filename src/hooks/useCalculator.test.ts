import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCalculator } from '../hooks/useCalculator'

describe('useCalculator', () => {
  const defaults = {
    startDate: '2025-05-12',
    initialPrincipal: 100000,
    depositMonths: 3,
    iterate: 1,
    hkdRate: 2.25,
    usdRate: 3.2,
    bankSellRate: 7.8468,
    bankBuyRate: 7.8103,
  }

  function run(overrides: Partial<typeof defaults>) {
    return renderHook(() => useCalculator({ ...defaults, ...overrides })).result
      .current
  }

  it('returns correct values for default inputs (HKD wins, break-even triggered)', () => {
    const r = run({})
    expect(r.hkdTotal).toBeCloseTo(100567.12328767, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(100348.81604957, 8)
    expect(r.difference).toBeCloseTo(-218.30723810, 8)
    expect(r.usdWins).toBe(false)
    expect(r.breakEvenIterate).toBe(2)
    expect(r.breakEvenDays).toBe(184)
    expect(r.breakEvenMonths).toBe(6)
    expect(r.totalDays).toBe(92)
  })

  it('returns correct values for iterate=2 (USD wins)', () => {
    const r = run({ iterate: 2 })
    expect(r.hkdTotal).toBeCloseTo(101137.46286358, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(101169.44636749, 8)
    expect(r.difference).toBeCloseTo(31.98350391, 8)
    expect(r.usdWins).toBe(true)
    expect(r.breakEvenIterate).toBeNull()
    expect(r.totalDays).toBe(184)
  })

  it('returns correct values for zero rates', () => {
    const r = run({ hkdRate: 0, usdRate: 0 })
    expect(r.hkdTotal).toBeCloseTo(100000, 8)
    expect(r.usdTotalInHkd).toBeCloseTo(99534.84222868, 8)
    expect(r.difference).toBeCloseTo(-465.15777132, 8)
    expect(r.usdWins).toBe(false)
    expect(r.breakEvenIterate).toBeNull()
    expect(r.totalDays).toBe(92)
  })

  it('returns 0 for zero principal', () => {
    const r = run({ initialPrincipal: 0 })
    expect(r.hkdTotal).toBe(0)
    expect(r.usdTotalInHkd).toBe(0)
    expect(r.difference).toBe(0)
    expect(r.usdWins).toBe(true)
    expect(r.breakEvenIterate).toBeNull()
    expect(r.totalDays).toBe(92)
  })
})
