import { describe, it, expect } from 'vitest'
import { fmtDateShort, fmtPhaseRate } from './format'

describe('fmtDateShort', () => {
  it('formats 2026-05-04 to 04-May', () => {
    expect(fmtDateShort('2026-05-04')).toBe('04-May')
  })

  it('formats 2026-08-31 to 31-Aug', () => {
    expect(fmtDateShort('2026-08-31')).toBe('31-Aug')
  })

  it('formats 2026-01-01 to 01-Jan', () => {
    expect(fmtDateShort('2026-01-01')).toBe('01-Jan')
  })

  it('formats 2026-12-25 to 25-Dec', () => {
    expect(fmtDateShort('2026-12-25')).toBe('25-Dec')
  })
})

describe('fmtPhaseRate', () => {
  it.each([
    [3, '3.0'],
    [2.8, '2.8'],
    [3.2, '3.2'],
    [3.25, '3.25'],
    ['3', '3.0'],
    ['2.8', '2.8'],
  ])('formats %s as %s', (input, expected) => {
    expect(fmtPhaseRate(input)).toBe(expected)
  })
})
