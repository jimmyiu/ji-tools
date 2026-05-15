import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DateFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1.5">{label}</Label>
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
