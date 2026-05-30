import { useCallback, useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePwaUpdate() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      if (import.meta.env.DEV) console.log('SW registered:', r)
    },
    onRegisterError(e) {
      console.error('SW registration error:', e)
    },
  })

  const [visible, setVisible] = useState(() => {
    localStorage.removeItem('pwa_update_dismissed')
    localStorage.removeItem('pwa_update_force_show')
    return localStorage.getItem('pwa_update_visible') === 'true'
  })

  useEffect(() => {
    if (visible) {
      localStorage.setItem('pwa_update_visible', 'true')
    } else {
      localStorage.removeItem('pwa_update_visible')
    }
  }, [visible])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (needRefresh) setVisible(true)
  }, [needRefresh])

  const dismiss = useCallback(() => setVisible(false), [])

  const update = useCallback(() => {
    setVisible(false)
    updateServiceWorker(true)?.catch((err) => {
      console.error('SW update failed:', err)
    })
  }, [updateServiceWorker])

  const toggleShow = useCallback(() => {
    setVisible(v => !v)
  }, [])

  return { showUpdateBanner: visible, update, dismiss, toggleShow }
}
