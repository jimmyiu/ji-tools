import { useRef, useState, useLayoutEffect, useCallback } from 'react'

export function useBannerManager(canInstall: boolean, needRefresh: boolean) {
  const [dismissedUpdate, setDismissedUpdate] = useState(false)
  const [installBannerHeight, setInstallBannerHeight] = useState(0)
  const [updateBannerHeight, setUpdateBannerHeight] = useState(0)
  const bannerRef = useRef<HTMLDivElement>(null)
  const updateBannerRef = useRef<HTMLDivElement>(null)

  const showUpdateBanner = needRefresh && !dismissedUpdate

  useLayoutEffect(() => {
    setInstallBannerHeight(bannerRef.current?.offsetHeight ?? 0)
    setUpdateBannerHeight(updateBannerRef.current?.offsetHeight ?? 0)
  }, [canInstall, needRefresh, dismissedUpdate])

  const dismissUpdate = useCallback(() => setDismissedUpdate(true), [])

  return {
    bannerRef,
    updateBannerRef,
    installBannerHeight,
    totalBannerHeight: installBannerHeight + updateBannerHeight,
    showUpdateBanner,
    dismissUpdate,
  }
}
