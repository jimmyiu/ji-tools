import { RotateCw, X } from 'lucide-react'
import { BannerActionButton } from './ui/banner-action-button'

interface UpdateBannerProps {
  visible: boolean
  update: () => void
  dismiss: () => void
}

export default function UpdateBanner({ visible, update, dismiss }: UpdateBannerProps) {
  if (!visible) return null

  return (
    <div
      className="fixed z-50 w-full p-4 bg-card animate-slide-up"
      role="alert"
      style={{ bottom: 'var(--update-banner-bottom)' }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            新版本已可用
          </p>
        </div>
        <BannerActionButton onClick={update} aria-label="更新">
          <RotateCw className="inline-block size-4 mr-1 align-text-bottom" />
          重新整理
        </BannerActionButton>
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
}