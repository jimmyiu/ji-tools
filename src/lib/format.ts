import { format, parseISO } from 'date-fns'

export function fmt(n: number) {
  return n.toLocaleString('zh-HK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtRate(n: number) {
  return n.toFixed(4)
}

export function fmtDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'dd-MMM')
}
