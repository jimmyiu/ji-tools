interface ReadonlyDateFieldProps {
  label: string
  value: string
}

export function ReadonlyDateField({ label, value }: ReadonlyDateFieldProps) {
  return (
    <div className="rounded-lg border p-3 bg-input/30 border-border">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-base font-semibold text-muted-foreground">{value}</p>
    </div>
  )
}
