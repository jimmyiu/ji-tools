import { useRef, useState, useLayoutEffect } from 'react'

export function useBannerManager(canInstall: boolean) {
  const [installBannerHeight, setInstallBannerHeight] = useState(0)
  const bannerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    setInstallBannerHeight(bannerRef.current?.offsetHeight ?? 0)
  }, [canInstall])

  return {
    bannerRef,
    installBannerHeight,
    totalBannerHeight: installBannerHeight,
  }
}
