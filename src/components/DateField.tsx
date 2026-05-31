import { useId } from 'react'

interface DateFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  const id = useId()
  return (
    <div
      className="rounded-lg border p-3 transition-all cursor-text group
        bg-input/30 border-border
        hover:bg-input/40
        has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/40 has-[input:focus-visible]:ring-offset-0"
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
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full bg-transparent text-base font-semibold text-foreground outline-none border-0 p-0 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:transition-opacity focus:[&::-webkit-calendar-picker-indicator]:opacity-100"
      />
    </div>
  )
}
