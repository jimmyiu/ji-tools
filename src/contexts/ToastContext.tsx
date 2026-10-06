import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CircleCheck } from 'lucide-react'
import { FEEDBACK_DURATION_MS } from '@/lib/feedback'
import { cn } from '@/lib/utils'
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
  variant?: 'default' | 'success'
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

export function ToastProvider({ children, duration = FEEDBACK_DURATION_MS }: ToastProviderProps) {
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
            className={cn(
              item.variant === 'success' &&
                'border-positive bg-positive text-positive-foreground'
            )}
            onOpenChange={(open) => {
              if (!open) dismiss(item.id)
            }}
          >
            <div className="flex items-center gap-2">
              {item.variant === 'success' && (
                <CircleCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
              )}
              <div className="grid gap-1">
                <ToastTitle>{item.title}</ToastTitle>
                {item.description && (
                  <ToastDescription>{item.description}</ToastDescription>
                )}
              </div>
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
