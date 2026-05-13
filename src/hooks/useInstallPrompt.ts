import { useState, useEffect, useCallback } from 'react'

export function useInstallPrompt() {
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('pwa_install_dismissed') === 'true'
  )
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const canInstall = !isStandalone && !dismissed && (isIOS || !!deferredPrompt)

  const dismiss = useCallback(() => {
    setDismissed(true)
    localStorage.setItem('pwa_install_dismissed', 'true')
  }, [])

  const resetDismissed = useCallback(() => {
    setDismissed(false)
    localStorage.removeItem('pwa_install_dismissed')
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }, [deferredPrompt])

  return { canInstall, isIOS, isStandalone, dismissed, dismiss, resetDismissed, install }
}
