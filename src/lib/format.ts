import { format, parseISO } from 'date-fns'

export function fmt(n: number) {
  return n.toLocaleString('zh-HK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtRate(n: number) {
  return n.toFixed(4)
}

// Nominal phase rates: always at least one decimal so integers align
// with values like 2.8. Values with hundredths keep their precision.
export function fmtPhaseRate(value: string | number): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return n.toLocaleString('zh-HK', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })
}

export function fmtDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'dd-MMM')
}
