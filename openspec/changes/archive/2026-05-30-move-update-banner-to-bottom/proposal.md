## Why

The UpdateBanner sits at `top: 0` (or stacked below InstallBanner), overlapping the OS status bar (time, battery, notch/Dynamic Island). The "重新整理" button is hard to tap and the text is unreadable behind system UI. Moving the banner to the bottom—stacked above the TabBar—follows modern mobile UX patterns, keeps the button in the thumb zone, and eliminates safe-area conflicts at the top.

## What Changes

- **Remove top positioning from UpdateBanner**: Strip `sticky`, `top: ${installBannerHeight}px`, and `slide-down` animation
- **Add bottom positioning to UpdateBanner**: Make it `position: fixed; bottom: calc(TAB_BAR_HEIGHT + 24px + env(safe-area-inset-bottom))` to sit exactly above the TabBar capsule
- **Change animation**: Replace `slide-down` with `slide-up` (translateY(+100%) → translateY(0))
- **Remove UpdateBanner from sticky top flow**: UpdateBanner no longer participates in the top banner stack; `totalBannerHeight` only includes InstallBanner height
- **Update header offset**: Header `top` only accounts for InstallBanner height, not UpdateBanner
- **Add Settings testing toggle**: Force-show the update banner from Settings for visual testing without a real SW update

## Capabilities

### New Capabilities
- `bottom-update-banner`: Position UpdateBanner as a fixed-bottom element above the TabBar, with slide-up animation and safe-area-aware bottom offset

### Modified Capabilities
- `top-positioned-banners`: Remove UpdateBanner from top banner stacking; only InstallBanner remains at the top
- `pwa-update-prompt`: Update UpdateBanner positioning from sticky-top to fixed-bottom above TabBar; update animation from slide-down to slide-up; remove installBannerHeight prop dependency; add Settings force-show toggle with localStorage persistence

## Impact

- `src/components/UpdateBanner.tsx` — change from sticky-top to fixed-bottom positioning
- `src/components/Layout.tsx` — remove UpdateBanner from top flow; remove/update header offset logic
- `src/hooks/useBannerManager.ts` — remove `updateBannerHeight` and `updateBannerRef` from top-banner height calculation; `totalBannerHeight` now only tracks InstallBanner; add localStorage-based force-show and dismiss persistence with custom event cross-component sync
- `src/components/Layout.test.tsx` — update tests for new header offset (no UpdateBanner in top flow)
- `src/index.css` — add `slide-up` keyframes, rename/repurpose `animate-slide-in`
- `src/pages/Settings.tsx` — add "顯示更新提示" / "隱藏更新提示" toggle button