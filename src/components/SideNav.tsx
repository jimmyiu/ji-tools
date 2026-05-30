import { Link, useLocation } from 'react-router-dom'
import { Home, Settings } from 'lucide-react'

export default function SideNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="主導航"
      className="hidden desktop-nav:flex fixed left-0 top-0 bottom-0 w-20 z-40 bg-muted border-r border-border flex-col items-center"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
      }}
    >
      <div className="flex flex-col items-center gap-1 pt-6">
        <Link
          to="/"
          className={
            location.pathname === '/'
              ? 'flex flex-col items-center gap-1 p-2 rounded-xl bg-primary/15 text-primary'
              : 'flex flex-col items-center gap-1 p-2 rounded-xl text-muted-foreground hover:text-foreground'
          }
        >
          <Home className="size-6" />
          <span className="text-[11px] leading-none">首頁</span>
        </Link>
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-1 pb-6">
        <Link
          to="/settings"
          className={
            location.pathname === '/settings'
              ? 'flex flex-col items-center gap-1 p-2 rounded-xl bg-primary/15 text-primary'
              : 'flex flex-col items-center gap-1 p-2 rounded-xl text-muted-foreground hover:text-foreground'
          }
        >
          <Settings className="size-6" />
          <span className="text-[11px] leading-none">設定</span>
        </Link>
      </div>
    </nav>
  )
}