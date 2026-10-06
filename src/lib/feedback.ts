/** Time the transient field highlight holds at full strength, in ms. */
export const FLASH_HOLD_MS = 500

/** Time the transient field highlight takes to fade back to rest, in ms. */
export const FLASH_FADE_MS = 1000

/** Total time feedback stays visible: highlight hold + fade, in ms. */
export const FEEDBACK_DURATION_MS = FLASH_HOLD_MS + FLASH_FADE_MS
