import { forwardRef } from 'react'

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
        className="fixed left-0 right-0 z-50 p-4 bg-[#1a1d27] border-t border-[#2e303a]"
        style={{ bottom: 'calc(56px + env(safe-area-inset-bottom))', paddingBottom: '1rem' }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {isIOS ? '安裝 JI Tools 到主屏幕' : '安裝 JI Tools'}
            </p>
            {isIOS && (
              <p className="text-xs text-[#9ca3af] mt-1">
                點擊下方
                <svg
                  className="inline-block w-4 h-4 mx-0.5 align-text-bottom"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                分享按鈕，然後選擇「加入主畫面」
              </p>
            )}
          </div>
          {!isIOS && (
            <button
              onClick={install}
              className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-[#6366f1] rounded-lg hover:bg-[#818cf8] transition-colors"
            >
              安裝
            </button>
          )}
          <button
            onClick={dismiss}
            className="shrink-0 p-1 text-[#9ca3af] hover:text-white transition-colors"
            aria-label="關閉"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    )
  }
)

export default InstallBanner
