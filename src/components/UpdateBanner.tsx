import { forwardRef } from 'react'
import { RotateCw, X } from 'lucide-react'
import { TAB_BAR_HEIGHT } from '../lib/constants'

interface UpdateBannerProps {
  needRefresh: boolean
  installBannerHeight: number
  update: () => void
  dismiss: () => void
}

const UpdateBanner = forwardRef<HTMLDivElement, UpdateBannerProps>(
  function UpdateBanner({ needRefresh, installBannerHeight, update, dismiss }, ref) {
    if (!needRefresh) return null

    return (
      <div
        ref={ref}
        className="fixed left-0 right-0 z-50 p-4 bg-card border-t border-border animate-slide-up"
        role="alert"
        style={{
          bottom: `calc(${TAB_BAR_HEIGHT}px + ${installBannerHeight}px + env(safe-area-inset-bottom))`,
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              新版本已可用
            </p>
          </div>
          <button
            onClick={update}
            className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none transition-colors"
          >
            <RotateCw className="inline-block size-4 mr-1 align-text-bottom" />
            重新整理
          </button>
          <button
            onClick={dismiss}
            className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="關閉"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    )
  },
)

export default UpdateBanner
