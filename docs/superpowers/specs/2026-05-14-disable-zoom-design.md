# Disable Pinch-to-Zoom and Double-Tap Zoom

**Date:** 2026-05-14
**Status:** Approved

## Problem

When users access the PWA via mobile browser, double-tapping quickly or pinching with two fingers zooms the entire page. This breaks the native app feel, causing text and cards to overflow and requiring awkward horizontal scrolling.

## Solution

Add `maximum-scale=1` to the existing viewport meta tag in `index.html`.

**Current:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

**New:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, viewport-fit=cover" />
```

## Scope

- Applied everywhere (browser and installed PWA), not conditionally
- Single file change: `index.html`
- No CSS or JavaScript changes needed

## What This Prevents

- Pinch-to-zoom (two-finger gesture)
- Double-tap-to-zoom (quick double-tap on any area)

## What This Preserves

- Normal single-finger scrolling
- Existing `touch-action: manipulation` on interactive elements (prevents 300ms delay)
- Overscroll containment (`overscroll-behavior-y: contain`)
- PWA standalone mode behavior

## Accessibility

This intentionally restricts zoom capability. The trade-off is acceptable because:

- The app is designed with mobile-appropriate typography and sizing
- Native apps同样不允许缩放 — matching that expectation
- Existing `touch-action: manipulation` already prevents double-tap zoom on interactive elements; this extends the same behavior to non-interactive areas

## Alternatives Considered

1. **Viewport meta + CSS `touch-action: pan-x pan-y`** — Redundant; no additional benefit over viewport meta alone.
2. **JavaScript touch event interception** — Fragile, can break scrolling, unnecessary complexity for something the viewport tag already solves.

## Testing

Verify on both platforms:
- iOS Safari: pinch-to-zoom and double-tap-to-zoom are disabled; scrolling works normally
- Android Chrome: same verification