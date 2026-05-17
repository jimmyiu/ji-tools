import { forwardRef } from 'react'
import { X, Share } from 'lucide-react'
import { TAB_BAR_HEIGHT } from '../lib/constants'
import { BannerActionButton } from './ui/banner-action-button'

interface InstallBannerProps {
  canInstall: boolean
  isIOS: boolean
  install: () => Promise<void>
  dismiss: () => void
}

const InstallBanner = forwardRef<HTMLDivElement, InstallBannerProps>(
  function InstallBanner({ canInstall, isIOS, install, dismiss }, ref) {
    if (!canInstall) return null

    return (
      <div
        ref={ref}
        className="fixed left-0 right-0 z-50 p-4 bg-card border-t border-border"
        role="alert"
        style={{ bottom: `calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom))` }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {isIOS ? '安裝 JI Tools 到主屏幕' : '安裝 JI Tools'}
            </p>
            {isIOS && (
              <p className="text-xs text-muted-foreground mt-1">
                點擊下方
                <Share className="inline-block size-4 mx-0.5 align-text-bottom" />
                分享按鈕，然後選擇「加入主畫面」
              </p>
            )}
          </div>
          {!isIOS && (
            <BannerActionButton onClick={install}>
              安裝
            </BannerActionButton>
          )}
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
)

export default InstallBanner
