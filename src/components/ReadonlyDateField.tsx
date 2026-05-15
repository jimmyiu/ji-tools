import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock } from 'lucide-react'

interface ReadonlyDateFieldProps {
  label: string
  value: string
}

export function ReadonlyDateField({ label, value }: ReadonlyDateFieldProps) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1.5">{label}</Label>
      <div className="relative">
        <Input
          type="text"
          value={value}
          readOnly
          tabIndex={-1}
          className="bg-card/80 text-muted-foreground cursor-default border-border/80"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-xs">
          <Lock className="size-3" />
        </span>
      </div>
    </div>
  )
}
