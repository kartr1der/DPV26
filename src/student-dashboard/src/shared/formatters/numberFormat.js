export function formatDecimal(value, digits = 2) {
  return Number(value || 0).toFixed(digits)
}

export function formatInteger(value) {
  return Number(value || 0).toLocaleString('ru-RU')
}

export function formatPercent(value) {
  if (Math.abs(value) <= 0.05) return '0.0%'
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}
