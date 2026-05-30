## 1. CSS Animation

- [x] 1.1 Add `slide-up` keyframes to `src/index.css` (`translateY(100%); opacity: 0` → `translateY(0); opacity: 1`, 300ms ease-out)
- [x] 1.2 Add `.animate-slide-up` utility class to `src/index.css`

## 2. UpdateBanner Component

- [x] 2.1 Rewrite `UpdateBanner` to use `position: fixed; bottom: calc(TAB_BAR_HEIGHT + 24px + env(safe-area-inset-bottom)); z-50; w-full` on mobile and `bottom: calc(24px + env(safe-area-inset-bottom))` on desktop
- [x] 2.2 Replace `animate-slide-in` with `animate-slide-up` on the banner container
- [x] 2.3 Remove `installBannerHeight` prop from `UpdateBannerProps` and the component
- [x] 2.4 Remove `sticky`, `top`, `border-b`, and `style={{ top: ... }}` from the UpdateBanner element

## 3. useBannerManager Hook

- [x] 3.1 Remove `updateBannerHeight` state and `updateBannerRef` from `useBannerManager`
- [x] 3.2 Change `totalBannerHeight` to equal `installBannerHeight` only (remove UpdateBanner height)
- [x] 3.3 Remove `updateBannerRef` and `showUpdateBanner` computation from hook return (keep `showUpdateBanner` and `dismissUpdate`)
- [x] 3.4 Remove `useLayoutEffect` dependency on `dismissedUpdate` for update banner height measurement (or remove the measurement entirely)
- [x] 4.1 Update `Layout.tsx` to remove `installBannerHeight` prop from `<UpdateBanner>` and remove `updateBannerRef` prop
- [x] 4.2 Verify header `top` style uses `totalBannerHeight` (now only install height) correctly
- [x] 4.3 Remove top-offset logic for UpdateBanner from Layout (banner is now fixed-bottom, not in flow)
- [x] 5.1 Update `Layout.test.tsx`: verify header `top` no longer includes UpdateBanner height (only InstallBanner)
- [x] 5.2 Update `UpdateBanner` tests (if any) to test fixed-bottom positioning and absence of `installBannerHeight` prop
- [x] 5.3 Update `useBannerManager` tests (if any) to reflect `totalBannerHeight` = `installBannerHeight` only

## 6. Settings Testing Toggle

- [x] 6.1 Add `pwa_update_force_show` localStorage key with `getUpdateBannerForceShown()` and `toggleUpdateBannerForceShow()` exported functions in `useBannerManager.ts`
- [x] 6.2 Add `pwa_update_dismissed` localStorage persistence to `useBannerManager` (mirrors `useInstallPrompt` pattern)
- [x] 6.3 Add custom event system (`app-storage`) so Layout's `useBannerManager` reacts to Settings changes without remount
- [x] 6.4 Add "顯示更新提示" / "隱藏更新提示" toggle button in Settings page
- [x] 6.5 Ensure toggle also resets dismissed flag when force-showing