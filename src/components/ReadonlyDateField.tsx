import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock } from 'lucide-react'

interface ReadonlyDateFieldProps {
  label: string
  value: string
  disabled?: boolean
}

export function ReadonlyDateField({ label, value, disabled }: ReadonlyDateFieldProps) {
  const id = useId()
  return (
    <div className="flex flex-col h-full">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative flex-1">
        <Input
          id={id}
          type="text"
          value={value}
          readOnly
          disabled={disabled}
          tabIndex={-1}
          className="bg-card/80 text-muted-foreground cursor-default border-border/80"
        />
        <span aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-xs">
          <Lock className="size-3" />
        </span>
      </div>
    </div>
  )
}
