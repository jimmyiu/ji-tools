# PWA Update Reload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "new version available" banner that prompts users to refresh when a new PWA version is deployed.

**Architecture:** Switch `vite-plugin-pwa` to `registerType: 'prompt'` mode, wrap `useRegisterSW()` from `virtual:pwa-register/react` in a small hook, and show a fixed-bottom banner (stacked above InstallBanner, above TabBar). The banner calls `updateServiceWorker(true)` on user tap, which triggers SW activation + page reload.

**Tech Stack:** vite-plugin-pwa, workbox-window, virtual:pwa-register/react, React 19, Tailwind CSS 4

---

### Task 1: Configuration

**Files:**
- Modify: `vite.config.ts:22`
- Modify: `tsconfig.app.json:7` (add types)

- [ ] **Step 1: Change registerType from 'autoUpdate' to 'prompt'**

In `vite.config.ts`, change line 22:

```diff
-      registerType: 'autoUpdate',
+      registerType: 'prompt',
```

- [ ] **Step 2: Add vite-plugin-pwa/client to tsconfig types**

In `tsconfig.app.json`, change line 7:

```diff
-    "types": ["vite/client"],
+    "types": ["vite/client", "vite-plugin-pwa/client"],
```

This ensures TypeScript resolves `virtual:pwa-register/react` module declarations.

- [ ] **Step 3: Install workbox-window dependency**

`registerType: 'prompt'` requires `workbox-window` at runtime (used by the generated virtual module for SW lifecycle events):

```bash
pnpm add workbox-window
```

- [ ] **Step 4: Verify build still compiles**

```bash
pnpm build
```

Expected: Build succeeds. SW now uses prompt-based registration, with `workbox-window.prod.es5` in the bundle.

---

### Task 2: Update Detection Hook

**Files:**
- Create: `src/hooks/usePwaUpdate.ts`

- [ ] **Step 1: Create usePwaUpdate.ts**

```ts
import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePwaUpdate() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  return {
    needRefresh,
    update: () => updateServiceWorker(true),
  }
}
```

Note: `needRefresh` from `useRegisterSW` is a tuple `[boolean, Dispatch<SetStateAction<boolean>>]` — we extract just the boolean value.

---

### Task 3: Update Banner Component

**Files:**
- Create: `src/components/UpdateBanner.tsx`
- Read: `src/components/InstallBanner.tsx` (match styling)

- [ ] **Step 1: Create UpdateBanner component**

Read `src/components/InstallBanner.tsx` and create a matching component at `src/components/UpdateBanner.tsx`:

```tsx
import { forwardRef } from 'react'
import { RotateCw, X } from 'lucide-react'
import { TAB_BAR_HEIGHT } from '../lib/constants'

interface UpdateBannerProps {
  needRefresh: boolean
  installBannerHeight: number
  update: () => void
  dismiss: () => void
}

const UpdateBanner = forwardRef<HTMLDivElement, UpdateBannerProps>(
  function UpdateBanner({ needRefresh, installBannerHeight, update, dismiss }, ref) {
    if (!needRefresh) return null

    return (
      <div
        ref={ref}
        className="fixed left-0 right-0 z-50 p-4 bg-card border-t border-border animate-slide-up"
        role="alert"
        style={{
          bottom: `calc(${TAB_BAR_HEIGHT}px + ${installBannerHeight}px + env(safe-area-inset-bottom))`,
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              新版本已可用
            </p>
          </div>
          <button
            onClick={update}
            className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none transition-colors"
          >
            <RotateCw className="inline-block size-4 mr-1 align-text-bottom" />
            重新整理
          </button>
          <button
            onClick={dismiss}
            className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="關閉"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    )
  },
)

export default UpdateBanner
```

- [ ] **Step 2: Add slide-up animation**

Add to `src/index.css`:

```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
```

---

### Task 4: Layout Integration

**Files:**
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Integrate UpdateBanner and usePwaUpdate in Layout.tsx**

Read the current `src/components/Layout.tsx`. Add imports and integrate both banners:

Add at the top:
```ts
import UpdateBanner from './UpdateBanner'
import { usePwaUpdate } from '../hooks/usePwaUpdate'
```

Inside the component function, add after the existing banner ref/hooks:
```ts
const { needRefresh, update } = usePwaUpdate()
const [dismissedUpdate, setDismissedUpdate] = useState(false)
const updateBannerRef = useRef<HTMLDivElement>(null)
```

Add the dismiss handler:
```ts
const dismissUpdate = useCallback(() => setDismissedUpdate(true), [])
```

Update the `bannerHeight` calculation in `useLayoutEffect` to also measure `updateBannerRef`:
```ts
useLayoutEffect(() => {
  const ib = bannerRef.current?.offsetHeight ?? 0
  const ub = updateBannerRef.current?.offsetHeight ?? 0
  setBannerHeight(ib + ub)
}, [canInstall, needRefresh, dismissedUpdate])
```

Adjust the `bottomOffset` to use `canInstall || needRefresh`:
```diff
-  const bottomOffset = canInstall
+  const bottomOffset = canInstall || needRefresh
```

Render UpdateBanner before InstallBanner:
```tsx
<UpdateBanner
  ref={updateBannerRef}
  needRefresh={needRefresh && !dismissedUpdate}
  installBannerHeight={bannerRef.current?.offsetHeight ?? 0}
  update={update}
  dismiss={dismissUpdate}
/>
```

Note: `needRefresh && !dismissedUpdate` ensures banner hides on dismiss but checks again on next app session.

---

### Task 5: Test Mock & Verification

**Files:**
- Modify: `src/components/Layout.test.tsx` (add mock)

- [ ] **Step 1: Add vitest mock for the virtual module**

In `src/components/Layout.test.tsx`, add before `renderWithRouter`:

```ts
vi.mock('../hooks/usePwaUpdate', () => ({
  usePwaUpdate: () => ({
    needRefresh: false,
    update: vi.fn(),
  }),
}))
```

This prevents Vitest from trying to resolve the virtual module at transform time.

- [ ] **Step 2: Run TypeScript check and build**

```bash
pnpm build
```

Expected: Compiles without errors. SW file generated with prompt registration.

- [ ] **Step 3: Run tests**

```bash
pnpm test
```

Expected: All existing tests pass (66 tests, 6 suites).

- [ ] **Step 4: Run lint**

```bash
pnpm run lint
```

Expected: No lint errors.
