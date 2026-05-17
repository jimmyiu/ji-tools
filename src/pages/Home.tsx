import { Link } from 'react-router-dom'

const tools = [
  {
    path: '/fx-deposit-compare',
    title: '港美定存比較',
    description: '比較港元定存與美元定存的實際淨回報，計算匯率差價影響及追平所需時間。',
    emoji: '💰',
  },
  {
    path: '/marathon-savings',
    title: '馬拉松存款計算機',
    description: '揭露階梯式利率活期存款的實際等效年利率，助你精明選擇存款產品。',
    emoji: '🏦',
  },
]

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-4 page-enter">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="group block p-6 rounded-xl border border-border bg-card hover:border-primary hover:bg-card/90 transition-all duration-200 active:scale-[0.97] active:transition-transform"
          >
            <div className="text-3xl mb-3">{tool.emoji}</div>
            <h2 className="text-base font-semibold text-white mb-2 group-hover:text-primary transition-colors">
              {tool.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}