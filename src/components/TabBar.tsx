import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Settings } from 'lucide-react'

const tabs = [
  { to: '/', label: '首頁', icon: Home },
  { to: '/settings', label: '設定', icon: Settings },
]

export default function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = tabs.find((t) => location.pathname === t.to)?.to ?? ''

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-5xl mx-auto">
        <Tabs value={currentTab} onValueChange={(v) => navigate(v)}>
          <TabsList className="w-full h-14 bg-transparent gap-0 p-0 rounded-none" variant="line">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.to}
                value={tab.to}
                className="flex-1 flex-col gap-0 h-full px-0 py-1 rounded-none data-[state=active]:text-primary not-data-[state=active]:text-muted-foreground"
              >
                <tab.icon className="size-5" />
                <span className="text-[10px] leading-none">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </nav>
  )
}
