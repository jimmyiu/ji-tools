export function fmt(n: number) {
  return n.toLocaleString('zh-HK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtRate(n: number) {
  return n.toFixed(4)
}
