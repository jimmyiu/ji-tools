import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function Settings() {
  const { dismissed, resetDismissed } = useInstallPrompt()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      <div className="bg-[#1a1d27] border border-[#2e303a] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2e303a]">
          <h2 className="text-sm font-semibold text-white">關於</h2>
        </div>
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#2e303a]">
          <span className="text-sm text-[#9ca3af]">版本</span>
          <span className="text-sm text-white">0.0.0</span>
        </div>
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#2e303a]">
          <span className="text-sm text-[#9ca3af]">主題</span>
          <span className="text-sm text-white">深色（跟隨系統）</span>
        </div>
        <a
          href="https://github.com/jimmyiu/ji-tools"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-6 py-4 border-b border-[#2e303a] hover:bg-[#1e2233] transition-colors active:opacity-90"
        >
          <span className="text-sm text-[#9ca3af]">GitHub</span>
          <svg className="w-4 h-4 text-[#9ca3af]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
        {dismissed && (
          <button
            onClick={resetDismissed}
            className="w-full px-6 py-4 text-left text-sm text-[#818cf8] hover:bg-[#1e2233] transition-colors active:opacity-90"
          >
            重新顯示安裝提示
          </button>
        )}
      </div>
    </div>
  )
}
