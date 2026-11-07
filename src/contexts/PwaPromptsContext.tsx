import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export interface InstallPrompt {
  visible: boolean
  isIOS: boolean
  dismiss(): void
  toggle(): void
  prompt(): void
}

export interface UpdatePrompt {
  visible: boolean
  dismiss(): void
  toggle(): void
  reload(): void
}

export interface PwaPrompts {
  install: InstallPrompt
  update: UpdatePrompt
}

const INSTALL_DISMISSED_KEY = 'pwa_install_dismissed'
const UPDATE_VISIBLE_KEY = 'pwa_update_visible'
const LEGACY_UPDATE_KEYS = ['pwa_update_dismissed', 'pwa_update_force_show']

const PwaPromptsContext = createContext<PwaPrompts | null>(null)

function isInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIOSDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  )
}

function useInstallPrompt(): InstallPrompt {
  const [installed] = useState(isInstalled)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(INSTALL_DISMISSED_KEY) === 'true'
  )
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [ios] = useState(isIOSDevice)

  useEffect(() => {
    const handler = (event: BeforeInstallPromptEvent) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const visible = !installed && !dismissed && (ios || deferredPrompt !== null)

  const dismiss = useCallback(() => {
    setDismissed(true)
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true')
  }, [])

  const toggle = useCallback(() => {
    setDismissed(false)
    localStorage.removeItem(INSTALL_DISMISSED_KEY)
  }, [])

  const prompt = useCallback(() => {
    if (!deferredPrompt) return
    void deferredPrompt.prompt()
    void deferredPrompt.userChoice.then(() => setDeferredPrompt(null))
  }, [deferredPrompt])

  return useMemo(
    () => ({ visible, isIOS: ios, dismiss, toggle, prompt }),
    [visible, ios, dismiss, toggle, prompt]
  )
}

function useUpdatePrompt(): UpdatePrompt {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(registration) {
      if (import.meta.env.DEV) console.log('SW registered:', registration)
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  const [visible, setVisible] = useState(() => {
    LEGACY_UPDATE_KEYS.forEach((key) => localStorage.removeItem(key))
    return localStorage.getItem(UPDATE_VISIBLE_KEY) === 'true'
  })

  useEffect(() => {
    if (visible) {
      localStorage.setItem(UPDATE_VISIBLE_KEY, 'true')
    } else {
      localStorage.removeItem(UPDATE_VISIBLE_KEY)
    }
  }, [visible])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (needRefresh) setVisible(true)
  }, [needRefresh])

  const dismiss = useCallback(() => setVisible(false), [])

  const toggle = useCallback(() => setVisible((current) => !current), [])

  const reload = useCallback(() => {
    setVisible(false)
    updateServiceWorker(true)?.catch((error) => {
      console.error('SW update failed:', error)
    })
  }, [updateServiceWorker])

  return useMemo(() => ({ visible, dismiss, toggle, reload }), [visible, dismiss, toggle, reload])
}

export function PwaPromptsProvider({ children }: { children: ReactNode }) {
  const install = useInstallPrompt()
  const update = useUpdatePrompt()
  const value = useMemo<PwaPrompts>(() => ({ install, update }), [install, update])

  return <PwaPromptsContext.Provider value={value}>{children}</PwaPromptsContext.Provider>
}

export function usePwaPrompts(): PwaPrompts {
  const prompts = useContext(PwaPromptsContext)
  if (!prompts) throw new Error('usePwaPrompts must be used within a PwaPromptsProvider')
  return prompts
}
