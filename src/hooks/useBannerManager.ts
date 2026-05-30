import { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react'

const STORAGE_KEYS = {
  DISMISSED: 'pwa_update_dismissed',
  FORCE_SHOW: 'pwa_update_force_show',
} as const

function dispatchStorageEvent(key: string, value: string | null) {
  window.dispatchEvent(new CustomEvent('app-storage', { detail: { key, value } }))
}

export function getUpdateBannerForceShown(): boolean {
  return localStorage.getItem(STORAGE_KEYS.FORCE_SHOW) === 'true'
}

export function toggleUpdateBannerForceShow(): boolean {
  const next = !getUpdateBannerForceShown()
  if (next) {
    localStorage.setItem(STORAGE_KEYS.FORCE_SHOW, 'true')
    localStorage.removeItem(STORAGE_KEYS.DISMISSED)
    dispatchStorageEvent(STORAGE_KEYS.DISMISSED, null)
  } else {
    localStorage.removeItem(STORAGE_KEYS.FORCE_SHOW)
  }
  dispatchStorageEvent(STORAGE_KEYS.FORCE_SHOW, next ? 'true' : null)
  return next
}

export function useBannerManager(canInstall: boolean, needRefresh: boolean) {
  const [dismissedUpdate, setDismissedUpdate] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.DISMISSED) === 'true'
  )
  const [forceShowUpdate, setForceShowUpdate] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.FORCE_SHOW) === 'true'
  )
  const [installBannerHeight, setInstallBannerHeight] = useState(0)
  const bannerRef = useRef<HTMLDivElement>(null)

  const showUpdateBanner = (needRefresh || forceShowUpdate) && !dismissedUpdate

  useEffect(() => {
    const handler = (e: Event) => {
      const { key, value } = (e as CustomEvent).detail
      if (key === STORAGE_KEYS.DISMISSED) setDismissedUpdate(value === 'true')
      if (key === STORAGE_KEYS.FORCE_SHOW) setForceShowUpdate(value === 'true')
    }
    window.addEventListener('app-storage', handler)
    return () => window.removeEventListener('app-storage', handler)
  }, [])

  useLayoutEffect(() => {
    setInstallBannerHeight(bannerRef.current?.offsetHeight ?? 0)
  }, [canInstall])

  const dismissUpdate = useCallback(() => {
    setDismissedUpdate(true)
    localStorage.setItem(STORAGE_KEYS.DISMISSED, 'true')
    dispatchStorageEvent(STORAGE_KEYS.DISMISSED, 'true')
  }, [])

  const resetUpdateDismissed = useCallback(() => {
    setDismissedUpdate(false)
    localStorage.removeItem(STORAGE_KEYS.DISMISSED)
    dispatchStorageEvent(STORAGE_KEYS.DISMISSED, null)
  }, [])

  return {
    bannerRef,
    installBannerHeight,
    totalBannerHeight: installBannerHeight,
    showUpdateBanner,
    dismissUpdate,
    resetUpdateDismissed,
  }
}