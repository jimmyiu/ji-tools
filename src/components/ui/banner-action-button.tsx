import type { ButtonHTMLAttributes, ReactNode } from 'react'

const baseClass =
  'shrink-0 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none transition-colors'

interface BannerActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function BannerActionButton({ children, ...props }: BannerActionButtonProps) {
  return (
    <button className={baseClass} {...props}>
      {children}
    </button>
  )
}
