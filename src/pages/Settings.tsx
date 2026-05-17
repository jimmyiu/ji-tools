import { ExternalLink } from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function Settings() {
  const { dismissed, resetDismissed } = useInstallPrompt()

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 page-enter">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-white">關於</h2>
        </div>
        <div className="px-6 py-4 flex items-center justify-between border-b border-border">
          <span className="text-sm text-muted-foreground">版本</span>
          <span className="text-sm text-white">{__APP_VERSION__}</span>
        </div>
        <div className="px-6 py-4 flex items-center justify-between border-b border-border">
          <span className="text-sm text-muted-foreground">主題</span>
          <span className="text-sm text-white">深色（跟隨系統）</span>
        </div>
        <a
          href="https://github.com/jimmyiu/ji-tools"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between px-6 py-4 border-b border-border hover:bg-card/90 active:opacity-90 transition-colors"
        >
          <span className="text-sm text-muted-foreground">GitHub</span>
          <ExternalLink className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </a>
        {dismissed && (
          <button
            onClick={resetDismissed}
            className="w-full px-6 py-4 text-left text-sm text-primary hover:bg-card/90 transition-colors active:opacity-90"
          >
            重新顯示安裝提示
          </button>
        )}
      </div>
    </div>
  )
}
