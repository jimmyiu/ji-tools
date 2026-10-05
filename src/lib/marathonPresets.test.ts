import { describe, expect, it } from 'vitest'
import { DEFAULT_MARATHON_PHASES, MARATHON_SAVINGS_HISTORY } from './marathonPresets'

describe('marathon savings history data', () => {
  it('ships immutable phases so a loaded preset can never be edited in place', () => {
    expect(Object.isFrozen(DEFAULT_MARATHON_PHASES)).toBe(true)
    expect(DEFAULT_MARATHON_PHASES.every(Object.isFrozen)).toBe(true)

    expect(() => {
      DEFAULT_MARATHON_PHASES[0].hkdRate = 99
    }).toThrow(TypeError)
  })

  it('keeps every history record as immutable as the default phases', () => {
    for (const preset of MARATHON_SAVINGS_HISTORY) {
      expect(Object.isFrozen(preset.phases)).toBe(true)
      expect(preset.phases.every(Object.isFrozen)).toBe(true)
    }
  })
})
