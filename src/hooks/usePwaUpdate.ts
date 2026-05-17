import { useCallback } from 'react'
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

  const update = useCallback(() => {
    updateServiceWorker(true).catch((err) => {
      console.error('SW update failed:', err)
    })
  }, [updateServiceWorker])

  return {
    needRefresh,
    update,
  }
}
