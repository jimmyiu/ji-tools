## 1. Set up test mock for virtual module

- [x] 1.1 Add `vi.mock('virtual:pwa-register/react', ...)` in test setup or test file so `usePwaUpdate` tests can import without module resolution error

## 2. Fix updateServiceWorker crash

- [x] 2.1 Write test proving `updateServiceWorker(true)` returning `undefined` doesn't crash
- [x] 2.2 Add optional chaining (`?.catch(...)`) in `usePwaUpdate`

## 3. Rewrite usePwaUpdate with single visible field

- [x] 3.1 Write tests for new `usePwaUpdate` API (visible: boolean, needRefresh→true, dismiss→false, update→false, toggle→flip, localStorage persistence, localStorage cleanup of old keys, default `false`)
- [x] 3.2 Rewrite `src/hooks/usePwaUpdate.ts` with single `visible` state + localStorage persistence + immediate hide on update + cleanup old keys `pwa_update_dismissed` and `pwa_update_force_show`

## 4. Create shared context

- [x] 4.1 Write tests for `PwaUpdateContext` provider + consumer hook (cross-component state sharing, interface contract matching `{ showUpdateBanner, update, dismiss, toggleShow }`)
- [x] 4.2 Create `src/contexts/PwaUpdateContext.tsx` with provider and `usePwaUpdateContext`

## 5. Update Layout to use context

- [x] 5.1 Update `src/components/Layout.tsx` to wrap content with `PwaUpdateProvider` (calls `usePwaUpdate` internally), read `showUpdateBanner` from context
- [x] 5.2 Write test verifying Layout + Settings share visible state via context (provider + two consumers)

## 6. Update Settings to use context

- [x] 6.1 Write tests for Settings toggle using context
- [x] 6.2 Update `src/pages/Settings.tsx` to use `usePwaUpdateContext`, remove direct `localStorage` access and `getUpdateBannerForceShown`/`toggleUpdateBannerForceShow` imports

## 7. Update UpdateBanner prop

- [x] 7.1 Rename `needRefresh` prop to `visible` in `UpdateBanner` component
- [x] 7.2 Update `UpdateBanner.test.tsx`

## 8. Strip update banner logic from useBannerManager

- [x] 8.1 Update `src/hooks/useBannerManager.ts` to remove `dismissUpdate`, `resetUpdateDismissed`, `showUpdateBanner`
- [x] 8.2 Update `useBannerManager.test.ts`

## 9. Verify build and tests

- [x] 9.1 Run `pnpm run lint` and `pnpm test` — all pass
