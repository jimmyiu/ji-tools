// Single source for navigation metrics.
//
// These values are mirrored by custom properties in `src/index.css`. The
// accompanying test reads those properties and fails when the two drift, so a
// change here without the matching stylesheet change cannot land.
export const DESKTOP_NAV_PX = 1024

export const SIDE_NAV_WIDTH = 80

export const TAB_BAR_HEIGHT = 64
export const TAB_BAR_BOTTOM_INSET = 24
// Space kept under the tab bar so content can scroll clear of its shadow.
const CONTENT_BOTTOM_GAP = 16

export const NAV_BOTTOM_OFFSET = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_INSET + CONTENT_BOTTOM_GAP
