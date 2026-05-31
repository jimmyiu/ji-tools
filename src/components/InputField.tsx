import { useId } from 'react'
import { cn } from '@/lib/utils'

interface InputFieldProps {
  label: string
  value: string | number
  onChange: (v: string) => void
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  min?: number
  step?: number
  error?: string
}

export function InputField({ label, value, onChange, prefix, suffix, min = 0, step = 0.01, error }: InputFieldProps) {
  const id = useId()
  return (
    <div>
      <div
        className={cn(
          "rounded-lg border p-3 transition-all cursor-text group",
          "bg-input/30 border-border",
          "hover:bg-input/40",
          "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/40 has-[input:focus-visible]:ring-offset-0",
          "data-[error]:border-destructive data-[error]:bg-destructive/10 data-[error]:ring-2 data-[error]:ring-destructive/40"
        )}
        data-error={error ? "" : undefined}
      >
        <label
          htmlFor={id}
          className="block text-[10px] text-muted-foreground group-data-[error]:text-destructive"
        >
          {label}
        </label>
        <div className="flex items-center gap-1 mt-0.5">
          {prefix && (
            <span className="text-base font-semibold text-muted-foreground shrink-0">{prefix}</span>
          )}
          <input
            id={id}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={min}
            step={step}
            className="w-full bg-transparent text-base font-semibold text-foreground outline-none border-0 p-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {suffix && (
            <span className="text-base font-semibold text-muted-foreground shrink-0">{suffix}</span>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
