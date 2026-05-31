interface ReadonlyDateFieldProps {
  label: string
  value: string
}

export function ReadonlyDateField({ label, value }: ReadonlyDateFieldProps) {
  return (
    <div className="rounded-lg border p-3 border-border/50">
      <p className="text-[10px] text-muted-foreground/50">{label}</p>
      <p className="mt-0.5 text-base font-semibold text-muted-foreground/50">{value}</p>
    </div>
  )
}
