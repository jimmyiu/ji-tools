import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DateFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  const id = useId()
  return (
    <div className="flex flex-col h-full">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
      />
    </div>
  )
}
