import { useRef, useState, useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useScrollPosition } from '../hooks/useScrollPosition'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import TabBar from './TabBar'
import InstallBanner from './InstallBanner'

const TAB_BAR_HEIGHT = 56
const SPACING = 16

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'JI Tools' },
  '/fx-deposit-compare': { title: '港美定存比較' },
  '/marathon-savings': { title: '馬拉松存款' },
  '/settings': { title: '設定' },
}

export default function Layout() {
  const location = useLocation()
  const { isScrolled } = useScrollPosition(44)
  const pageInfo = pageTitles[location.pathname] ?? { title: 'JI Tools' }
  const { canInstall, isIOS, dismiss, install } = useInstallPrompt()
  const [bannerHeight, setBannerHeight] = useState(0)
  const bannerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (bannerRef.current) {
      setBannerHeight(bannerRef.current.offsetHeight)
    } else {
      setBannerHeight(0)
    }
  }, [canInstall])

  const bottomOffset = canInstall
    ? `calc(${SPACING + bannerHeight + TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom))`
    : `calc(${SPACING + TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom))`

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0f1117] text-[#e2e8f0] flex flex-col">
      <header
        className={`sticky top-0 z-30 bg-[#0f1117] transition-all duration-200 ${
          isScrolled ? 'border-b border-[#2e303a]' : ''
        }`}
      >
        {isScrolled ? (
          <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="max-w-5xl mx-auto px-4 h-11 flex items-center">
              <h2 className="text-base font-semibold text-white truncate">{pageInfo.title}</h2>
            </div>
          </div>
        ) : (
          <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="max-w-5xl mx-auto px-4 pt-2 pb-2">
              <h1 className="text-2xl font-bold text-white">{pageInfo.title}</h1>
              {pageInfo.subtitle && (
                <p className="text-[#9ca3af] text-sm mt-1">{pageInfo.subtitle}</p>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="page-enter" style={{ paddingBottom: bottomOffset }}>
        <Outlet />
      </main>

      <InstallBanner ref={bannerRef} canInstall={canInstall} isIOS={isIOS} install={install} dismiss={dismiss} />
      <TabBar />
    </div>
  )
}
