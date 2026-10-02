import { describe, it, expect } from 'vitest'
import { applyPhaseEndDate, applyPhaseStartDate, type Phases, type PhaseState } from './phases'

function phases(
  overrides: Partial<PhaseState>[] = [],
): Phases {
  const base: Phases = [
    { startDate: '2026-05-04', endDate: '2026-07-01', hkdRate: 1.85, usdRate: 3.0 },
    { startDate: '2026-07-02', endDate: '2026-08-02', hkdRate: 2.0, usdRate: 3.1 },
    { startDate: '2026-08-03', endDate: '2026-08-31', hkdRate: 2.2, usdRate: 3.3 },
  ]
  return overrides.reduce(
    (acc, o, i) => {
      acc[i] = { ...acc[i], ...o }
      return acc
    },
    base.map((p) => ({ ...p })) as Phases,
  )
}

describe('applyPhaseEndDate', () => {
  it.each([
    { label: 'phase 1', index: 0 as const, end: '2026-06-30', nextStart: '2026-07-01' },
    { label: 'phase 2', index: 1 as const, end: '2026-08-01', nextStart: '2026-08-02' },
  ])('setting $label end makes next start end + 1 day ($nextStart)', ({ index, end, nextStart }) => {
    const result = applyPhaseEndDate(phases(), index, end)
    expect(result[index].endDate).toBe(end)
    expect(result[index + 1].startDate).toBe(nextStart)
  })

  it('setting phase 3 end moves nothing else', () => {
    const before = phases()
    const result = applyPhaseEndDate(before, 2, '2026-09-30')
    expect(result[2].endDate).toBe('2026-09-30')
    expect(result[0]).toEqual(before[0])
    expect(result[1]).toEqual(before[1])
  })

  it('does not preserve phase lengths when an earlier end moves', () => {
    const result = applyPhaseEndDate(phases(), 0, '2026-06-15')
    expect(result[1].endDate).toBe('2026-08-02')
    expect(result[2].endDate).toBe('2026-08-31')
  })

  it('unsets an end date earlier than its own start date', () => {
    const result = applyPhaseEndDate(phases(), 0, '2026-05-01')
    expect(result[0].endDate).toBe('')
  })

  it('cascades: an empty end makes the next start empty, later end dates stay', () => {
    const result = applyPhaseEndDate(phases(), 0, '')
    expect(result[0].endDate).toBe('')
    expect(result[1].startDate).toBe('')
    expect(result[1].endDate).toBe('2026-08-02')
    expect(result[2].startDate).toBe('2026-08-03')
    expect(result[2].endDate).toBe('2026-08-31')
  })

  it('cascades: end pushed past the following end unsets the following end', () => {
    const result = applyPhaseEndDate(phases(), 0, '2026-09-15')
    expect(result[0].endDate).toBe('2026-09-15')
    expect(result[1].startDate).toBe('2026-09-16')
    expect(result[1].endDate).toBe('')
    expect(result[2].startDate).toBe('')
    expect(result[2].endDate).toBe('2026-08-31')
  })
})

describe('applyPhaseStartDate', () => {
  it('phase 1 start does not move phase 1 end', () => {
    const result = applyPhaseStartDate(phases(), 0, '2026-05-10')
    expect(result[0].startDate).toBe('2026-05-10')
    expect(result[0].endDate).toBe('2026-07-01')
    expect(result[1]).toEqual(phases()[1])
    expect(result[2]).toEqual(phases()[2])
  })

  it('phase 1 start beyond phase 1 end unsets the end', () => {
    const result = applyPhaseStartDate(phases(), 0, '2026-08-01')
    expect(result[0].startDate).toBe('2026-08-01')
    expect(result[0].endDate).toBe('')
    expect(result[1].startDate).toBe('')
  })

  it.each([
    { label: 'phase 2', index: 1 as const, start: '2026-09-10', prevEnd: '2026-09-09' },
    { label: 'phase 3', index: 2 as const, start: '2026-09-20', prevEnd: '2026-09-19' },
  ])('setting $label start moves previous end to start - 1 day ($prevEnd)', ({ index, start, prevEnd }) => {
    const result = applyPhaseStartDate(phases(), index, start)
    expect(result[index - 1].endDate).toBe(prevEnd)
    expect(result[index].startDate).toBe(start)
  })

  it('phase 3 start beyond phase 3 end unsets phase 3 end', () => {
    const result = applyPhaseStartDate(phases(), 2, '2026-09-20')
    expect(result[2].startDate).toBe('2026-09-20')
    expect(result[2].endDate).toBe('')
    expect(result[1].endDate).toBe('2026-09-19')
  })

  it('phase 3 start earlier than phase 3 end leaves phase 3 end untouched', () => {
    const result = applyPhaseStartDate(phases(), 2, '2026-08-20')
    expect(result[2].endDate).toBe('2026-08-31')
    expect(result[1].endDate).toBe('2026-08-19')
  })

  it('phase 2 start before phase 1 start unsets phase 1 end', () => {
    const result = applyPhaseStartDate(phases(), 1, '2026-05-01')
    expect(result[0].endDate).toBe('')
    expect(result[1].startDate).toBe('')
  })

  it('an empty derived start is a no-op', () => {
    const empty = phases([{ endDate: '' }, { startDate: '' }])
    const result = applyPhaseStartDate(empty, 1, '')
    expect(result).toEqual(empty)
  })
})

it('returns new objects and never mutates the input', () => {
  const before = phases()
  const snapshot = JSON.parse(JSON.stringify(before))
  applyPhaseEndDate(before, 0, '2026-06-15')
  applyPhaseStartDate(before, 1, '2026-09-10')
  expect(before).toEqual(snapshot)
})
