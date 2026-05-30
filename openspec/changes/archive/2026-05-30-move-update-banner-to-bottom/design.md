## Context

The UpdateBanner currently uses `position: sticky; top: ${installBannerHeight}px` to stack below the InstallBanner at the top of the viewport. On mobile devices with notches/Dynamic Island, `env(safe-area-inset-top)` padding on the InstallBanner pushes content down, but the UpdateBanner still overlaps system UI elements. The banner's "重新整理" button sits in an awkward tap zone at the very top of the screen.

The TabBar is a `position: fixed; bottom: calc(24px + env(safe-area-inset-bottom))` floating glass capsule, 64px tall (`TAB_BAR_HEIGHT = 64`). Moving the UpdateBanner above this capsule aligns with mobile UX best practices.

## Goals / Non-Goals

**Goals:**
- Reposition UpdateBanner to the bottom of the screen, stacked above the TabBar capsule
- Use `position: fixed` with `bottom` calculated relative to TabBar position
- Switch from `slide-down` to `slide-up` animation
- Remove UpdateBanner from the top-banner height calculation so the header offset only accounts for InstallBanner
- Ensure safe-area inset is handled correctly for bottom positioning

**Non-Goals:**
- Changing InstallBanner behavior (it stays top-positioned)
- Changing TabBar height or position
- Changing the banner's visual content (text, buttons, dismiss behavior)
- Modal or overlay alternatives for the update prompt

## Decisions

**Decision 1: Fixed positioning over sticky**
UpdateBanner will use `position: fixed` instead of `sticky`. Rationale: The banner needs to ride above a fixed-position TabBar. A sticky element in document flow can't float above a fixed element at the bottom. `fixed` positions it relative to the viewport, matching the TabBar's positioning model.

**Decision 2: Bottom offset formula**
`bottom: calc(TAB_BAR_HEIGHT + 24px + env(safe-area-inset-bottom))`. The TabBar capsule sits at `bottom: calc(24px + env(safe-area-inset-bottom))` and is 64px tall. The UpdateBanner should sit directly above it, so its `bottom` equals the TabBar's `bottom` + the TabBar's `height`. This mirrors the same calculation the TabBar uses internally.

**Decision 3: Slide-up animation**
A new `slide-up` keyframe animation (`translateY(100%) → translateY(0)`) replaces `slide-down`. The banner slides in from the bottom, consistent with its new position.

**Decision 4: Remove UpdateBanner from totalBannerHeight**
`useBannerManager` will stop tracking `updateBannerHeight` and `updateBannerRef`. `totalBannerHeight` becomes just `installBannerHeight`. The header offset and Layout no longer need to account for UpdateBanner height. The `installBannerHeight` prop on UpdateBanner is removed since it's no longer needed for top-stacking.

**Decision 5: Z-index layering**
UpdateBanner gets `z-50`, same as the TabBar's `z-40`, so it renders above the TabBar but below any modal overlays.

## Risks / Trade-offs

- **[Content overlap]** UpdateBanner may overlap bottom content in `<main>`. Mitigation: Banner is temporary (user dismisses or refreshes) and the TabBar already occupies that space; the main content has `paddingBottom: var(--nav-bottom-offset)` which accounts for TabBar. We do not adjust main content padding for the banner since it's transient.
- **[Z-index stacking with InstallBanner]** No conflict — InstallBanner is at the top (`z-50`, sticky), UpdateBanner is at the bottom (`z-50`, fixed). They don't compete for the same screen area.
- **[Double banner on small screens]** If both InstallBanner (top) and UpdateBanner (bottom) are visible, they occupy different screen regions by design. Thumb reach for "重新整理" is optimal at the bottom.