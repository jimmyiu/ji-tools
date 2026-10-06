import { useId } from 'react'
import { FLASH_FADE_MS } from '@/lib/feedback'
import { cn } from '@/lib/utils'

interface DateFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  min?: string
  flash?: boolean
}

export function DateField({ label, value, onChange, min, flash }: DateFieldProps) {
  const id = useId()
  return (
    <div
      data-flash={flash ? '' : undefined}
      style={flash ? undefined : { transitionDuration: `${FLASH_FADE_MS}ms` }}
      className={cn(
        'rounded-lg border p-3 cursor-text group',
        'bg-input/30 border-border',
        'has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/40 has-[input:focus-visible]:ring-offset-0',
        flash
          ? 'border-flash bg-flash/25 ring-2 ring-flash/50'
          : 'transition-colors hover:bg-input/40'
      )}
    >
      <label
        htmlFor={id}
        className="block text-[10px] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full bg-transparent text-base font-semibold text-foreground outline-none border-0 p-0 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:transition-opacity focus:[&::-webkit-calendar-picker-indicator]:opacity-100"
      />
    </div>
  )
}
