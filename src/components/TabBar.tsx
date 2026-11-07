import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Settings } from 'lucide-react'
import { TAB_BAR_HEIGHT } from '@/lib/navigation'

const tabs = [
  { to: '/', label: '首頁', icon: Home },
  { to: '/settings', label: '設定', icon: Settings },
]

export default function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = tabs.find((t) => location.pathname === t.to)?.to ?? ''

  return (
    <nav
      aria-label="底部導航"
      className="desktop-nav:hidden fixed left-4 right-4 z-40"
      style={{ bottom: 'var(--tab-bar-bottom)' }}
    >
      <div
        className="mx-auto max-w-[280px] rounded-2xl bg-card/80 backdrop-blur-xl border-t border-border/10 shadow-tab-bar"
        style={{ height: TAB_BAR_HEIGHT }}
      >
        <div className="flex h-full">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.to
            const Icon = tab.icon
            return (
              <button
                key={tab.to}
                onClick={() => navigate(tab.to)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 px-0 py-0 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                role="tab"
                aria-selected={isActive}
              >
                <Icon className="size-[22px]" fill={isActive ? 'currentColor' : 'none'} />
                <span className="text-xs leading-none">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
