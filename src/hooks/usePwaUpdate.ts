import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePwaUpdate() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  return {
    needRefresh,
    update: () => updateServiceWorker(true),
  }
}
