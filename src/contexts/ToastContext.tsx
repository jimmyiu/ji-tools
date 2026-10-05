import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  Toast,
  ToastDescription,
  ToastProvider as ToastPrimitiveProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

export interface ToastOptions {
  title: string
  description?: string
}

interface ToastItem extends ToastOptions {
  id: number
}

export interface ToastContextValue {
  toast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextToastId = 0

interface ToastProviderProps {
  children: ReactNode
  duration?: number
}

export function ToastProvider({ children, duration = 3000 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((options: ToastOptions) => {
    nextToastId += 1
    setToasts((prev) => [...prev, { id: nextToastId, ...options }])
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitiveProvider duration={duration} label="通知">
        {children}
        {toasts.map((item) => (
          <Toast
            key={item.id}
            open
            onOpenChange={(open) => {
              if (!open) dismiss(item.id)
            }}
          >
            <div className="grid gap-1">
              <ToastTitle>{item.title}</ToastTitle>
              {item.description && (
                <ToastDescription>{item.description}</ToastDescription>
              )}
            </div>
          </Toast>
        ))}
        <ToastViewport />
      </ToastPrimitiveProvider>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
