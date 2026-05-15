import { useRef, useState, useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useScrollPosition } from '../hooks/useScrollPosition'
import { useScrollLock } from '../hooks/useScrollLock'
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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export default function Layout() {
  const location = useLocation()
  const { scrollProgress } = useScrollPosition(44)
  const pageInfo = pageTitles[location.pathname] ?? { title: 'JI Tools' }
  const { canInstall, isIOS, dismiss, install } = useInstallPrompt()
  const [bannerHeight, setBannerHeight] = useState(0)
  const bannerRef = useRef<HTMLDivElement>(null)

  useScrollLock(location.pathname)

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

  const titleFontSize = `${lerp(1.5, 1, scrollProgress)}rem`
  const titleFontWeight = Math.round(lerp(700, 600, scrollProgress))
  const containerPT = `${lerp(0.5, 0, scrollProgress)}rem`
  const containerPB = `${lerp(0.5, 0, scrollProgress)}rem`
  const containerMH = `${lerp(0, 2.75, scrollProgress)}rem`

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 bg-background">
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
              className="text-white truncate"
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

      <main className="page-enter" style={{ paddingBottom: bottomOffset }}>
        <Outlet />
      </main>

      <InstallBanner ref={bannerRef} canInstall={canInstall} isIOS={isIOS} install={install} dismiss={dismiss} />
      <TabBar />
    </div>
  )
}
