const CATEGORY_LABELS = {
  education: 'Образовательная деятельность',
  science: 'Научная деятельность',
  finance: 'Финансово-экономические показатели',
  international: 'Международная деятельность',
}

export function defaultCategoryLabel(category) {
  return CATEGORY_LABELS[category] || category || 'Без категории'
}

export function normalizeMetricRecord(row, idOverride) {
  const category = String(row.category ?? '').trim()

  return {
    id: idOverride ?? (Number(row.id) || 0),
    category,
    categoryLabel: String(row.category_label ?? row.categoryLabel ?? defaultCategoryLabel(category)).trim(),
    metric: String(row.metric ?? '').trim(),
    metricLabel: String(row.metric_label ?? row.metricLabel ?? row.metric ?? '').trim(),
    entity: String(row.entity ?? '').trim(),
    period: String(row.period ?? '').trim(),
    value: Number(row.value),
    unit: String(row.unit ?? '').trim(),
  }
}

export function isValidMetricRecord(record) {
  return (
    Boolean(record.category) &&
    Boolean(record.metric) &&
    Boolean(record.entity) &&
    Boolean(record.period) &&
    Number.isFinite(record.value)
  )
}

export const TIDY_REQUIRED_COLUMNS = ['category', 'metric', 'entity', 'period', 'value']

export function isTidyHeaderRow(headers) {
  if (!Array.isArray(headers)) return false
  const normalized = headers.map((header) => header.trim().toLowerCase())
  return TIDY_REQUIRED_COLUMNS.every((column) => normalized.includes(column))
}
