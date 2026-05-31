interface SectionSeparatorProps {
  className?: string
}

export function SectionSeparator({ className }: SectionSeparatorProps) {
  return <div className={`border-b border-border mx-4 ${className ?? ''}`.trim()} />
}
