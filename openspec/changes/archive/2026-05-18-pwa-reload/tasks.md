## 1. Configuration

- [x] 1.1 Change `registerType` from `'autoUpdate'` to `'prompt'` in `vite.config.ts`
- [x] 1.2 Verify `vite-plugin-pwa/client` types are available — add type reference if needed

## 2. Hook

- [x] 2.1 Create `src/hooks/usePwaUpdate.ts` wrapping `useRegisterSW` from `virtual:pwa-register/react`
- [x] 2.2 Export `{ needRefresh: boolean, update: () => void }` from the hook

## 3. Component

- [x] 3.1 Create `src/components/UpdateBanner.tsx` with fixed-bottom positioning matching InstallBanner style
- [x] 3.2 Show "新版本已可用" text + "重新整理" button when `needRefresh` is true
- [x] 3.3 Wire "重新整理" button to call `update()` and trigger page reload
- [x] 3.4 Add dismissible state (local useState, hides until next session)
- [x] 3.5 Add slide-up/fade-in CSS animation on mount

## 4. Layout Integration

- [x] 4.1 Import and render `UpdateBanner` in `Layout.tsx`
- [x] 4.2 Compute combined height of UpdateBanner + InstallBanner via refs
- [x] 4.3 Update main content `paddingBottom` to include combined banner heights

## 5. Settings Fallback (Optional)

- [~] 5.1 Show "更新可用" indicator in `Settings.tsx` when `needRefresh` is true and banner was dismissed (deferred — out of scope for this change)

## 6. Verification

- [x] 6.1 Run `pnpm build` — verify TypeScript compiles cleanly
- [x] 6.2 Run `pnpm test` — verify existing tests still pass
- [x] 6.3 Run `pnpm run lint` — verify no lint errors
