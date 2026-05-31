import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SelectFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}

export function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div
      className="rounded-lg border p-3 transition-all cursor-text group
        bg-input/30 border-border
        hover:bg-input/40
        has-[button:focus-visible]:border-ring has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-ring/40 has-[button:focus-visible]:ring-offset-0"
    >
      <p className="block text-[10px] text-muted-foreground">
        {label}
      </p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-label={label}
          className="mt-0.5 w-full border-none bg-transparent shadow-none p-0 text-base font-semibold text-foreground hover:bg-transparent focus-visible:ring-0 focus-visible:border-0 data-placeholder:text-muted-foreground [&_svg:not([class*='size-'])]:size-5 [&_svg]:text-muted-foreground/50 [&_svg]:ml-auto [&_svg]:transition-colors data-[state=open]:[&_svg]:text-muted-foreground">
          <SelectValue placeholder="請選擇..." />
        </SelectTrigger>
        <SelectContent className="rounded-lg bg-card border border-border shadow-lg">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
