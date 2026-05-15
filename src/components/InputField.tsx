import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InputFieldProps {
  label: string
  value: string | number
  onChange: (v: string) => void
  suffix?: string
  min?: number
  step?: number
  error?: string
}

export function InputField({ label, value, onChange, suffix, min = 0, step = 0.01, error }: InputFieldProps) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1.5">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          step={step}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}
