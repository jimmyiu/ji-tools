import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2.5 mb-5">
      <div className="flex items-center gap-2.5">
        <div data-testid="accent-bar" className="w-[3px] h-4 bg-muted-foreground/20 rounded-sm" />
        <h2 className="text-sm font-semibold text-foreground">
          {title}
          {description && (
            <span className="ml-2 text-xs font-normal text-muted-foreground/60">
              {description}
            </span>
          )}
        </h2>
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}
