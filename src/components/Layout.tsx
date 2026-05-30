import { Outlet, useLocation } from 'react-router-dom'
import { useScrollPosition } from '../hooks/useScrollPosition'
import { useScrollLock } from '../hooks/useScrollLock'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { usePwaUpdate } from '../hooks/usePwaUpdate'
import { useBannerManager } from '../hooks/useBannerManager'
import TabBar from './TabBar'
import SideNav from './SideNav'
import InstallBanner from './InstallBanner'
import UpdateBanner from './UpdateBanner'

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'JI Tools' },
  '/fx-deposit-compare': { title: '港美定存比較' },
  '/marathon-savings': { title: '馬拉松存款' },
  '/settings': { title: '設定' },
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export default function Layout() {
  const location = useLocation()
  const { scrollProgress } = useScrollPosition(44)
  const pageInfo = pageTitles[location.pathname] ?? { title: 'JI Tools' }
  const { canInstall, isIOS, dismiss, install } = useInstallPrompt()
  const { needRefresh, update } = usePwaUpdate()
  const {
    bannerRef,
    totalBannerHeight,
    showUpdateBanner,
    dismissUpdate,
  } = useBannerManager(canInstall, needRefresh)

  useScrollLock(location.pathname)

  const titleFontSize = `${lerp(1.5, 1, scrollProgress)}rem`
  const titleFontWeight = Math.round(lerp(700, 600, scrollProgress))
  const containerPT = `${lerp(0.5, 0, scrollProgress)}rem`
  const containerPB = `${lerp(0.5, 0, scrollProgress)}rem`
  const containerMH = `${lerp(0, 2.75, scrollProgress)}rem`

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background text-foreground flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">跳到主內容</a>
      <InstallBanner ref={bannerRef} canInstall={canInstall} isIOS={isIOS} install={install} dismiss={dismiss} />
      <UpdateBanner
        needRefresh={showUpdateBanner}
        update={update}
        dismiss={dismissUpdate}
      />
      <header className="sticky z-30 bg-background" style={{ top: totalBannerHeight || 0, paddingLeft: 'var(--nav-left-offset)' }}>
        <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div
              className="max-w-5xl mx-auto px-4 flex flex-col justify-center"
              style={{
                paddingTop: containerPT,
                paddingBottom: containerPB,
                minHeight: containerMH,
              }}
            >
              <h1
                className="text-foreground truncate"
                style={{ fontSize: titleFontSize, fontWeight: titleFontWeight }}
              >
                {pageInfo.title}
              </h1>
              {pageInfo.subtitle && scrollProgress < 1 && (
                <p
                  className="text-muted-foreground text-sm mt-1"
                  style={{ opacity: 1 - scrollProgress }}
                >
                  {pageInfo.subtitle}
                </p>
              )}
            </div>
          </div>
          <div
            className="border-b border-border"
            style={{ opacity: scrollProgress }}
          />
      </header>
      <SideNav />
      <main id="main-content" className="page-enter transition-[padding] duration-150 ease-out" style={{ paddingBottom: 'var(--nav-bottom-offset)', paddingLeft: 'var(--nav-left-offset)' }}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}