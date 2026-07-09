import { formatInteger, formatPercent } from '../../../shared/formatters/numberFormat.js'

const palette = ['#1f7aec', '#31b7bc', '#6f62d2', '#f2b447', '#ef6f6c', '#2a9d68', '#52667a', '#9b6aef']

export const GENERIC_METRIC_PREFIX = 'generic:'

export function isGenericMetric(metricValue) {
  return typeof metricValue === 'string' && metricValue.startsWith(GENERIC_METRIC_PREFIX)
}

export function buildGenericMetricValue(category, metric) {
  return `${GENERIC_METRIC_PREFIX}${category}:${metric}`
}

export function parseGenericMetricKey(metricValue) {
  const [, category, metric] = metricValue.split(':')
  return { category, metric }
}

export function buildGenericMetricOptions(records) {
  const map = new Map()

  records.forEach((record) => {
    const value = buildGenericMetricValue(record.category, record.metric)
    if (!map.has(value)) {
      map.set(value, {
        value,
        label: `${record.categoryLabel || record.category} — ${record.metricLabel || record.metric}`,
        unit: record.unit,
      })
    }
  })

  return [...map.values()]
}

export function getGenericMetricMeta(records, metricValue) {
  const { category, metric } = parseGenericMetricKey(metricValue)
  const match = records.find((record) => record.category === category && record.metric === metric)

  return {
    category,
    metric,
    label: match?.metricLabel || metric,
    categoryLabel: match?.categoryLabel || category,
    unit: match?.unit || '',
  }
}

export function getCategoryRecords(records, category, genericFilters = {}) {
  return records
    .filter((record) => record.category === category)
    .filter((record) => !genericFilters.entities?.length || genericFilters.entities.includes(record.entity))
    .filter((record) => !genericFilters.periods?.length || genericFilters.periods.includes(record.period))
    .slice()
    .sort(
      (a, b) =>
        a.entity.localeCompare(b.entity, 'ru') ||
        a.metricLabel.localeCompare(b.metricLabel, 'ru') ||
        a.period.localeCompare(b.period, 'ru'),
    )
}

export function getCategoryFilterOptions(records, category) {
  const rows = records.filter((record) => record.category === category)

  return {
    categoryLabel: rows[0]?.categoryLabel || category,
    entities: [...new Set(rows.map((row) => row.entity))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'ru')),
    periods: [...new Set(rows.map((row) => row.period))].filter(Boolean).sort(),
  }
}

function filterGenericRecords(records, category, metric, genericFilters = {}) {
  let rows = records.filter((record) => record.category === category && record.metric === metric)

  if (genericFilters.entities?.length) {
    rows = rows.filter((row) => genericFilters.entities.includes(row.entity))
  }

  if (genericFilters.periods?.length) {
    rows = rows.filter((row) => genericFilters.periods.includes(row.period))
  }

  return rows
}

function sortedPeriods(rows) {
  return [...new Set(rows.map((row) => row.period))].sort()
}

function sortedEntities(rows) {
  return [...new Set(rows.map((row) => row.entity))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'ru'))
}

function latestValueForEntity(rows, entity, periods) {
  for (let index = periods.length - 1; index >= 0; index -= 1) {
    const match = rows.find((row) => row.entity === entity && row.period === periods[index])
    if (match) return match.value
  }
  return 0
}

export function buildGenericKpi(records, frameConfig, genericFilters = {}) {
  const { category, metric } = parseGenericMetricKey(frameConfig.metric)
  const meta = getGenericMetricMeta(records, frameConfig.metric)
  const rows = filterGenericRecords(records, category, metric, genericFilters)
  const periods = sortedPeriods(rows)
  const latestPeriod = periods[periods.length - 1]
  const previousPeriod = periods[periods.length - 2]
  const latestRows = latestPeriod ? rows.filter((row) => row.period === latestPeriod) : []
  const previousRows = previousPeriod ? rows.filter((row) => row.period === previousPeriod) : []
  const total = latestRows.reduce((sum, row) => sum + row.value, 0)
  const previousTotal = previousRows.reduce((sum, row) => sum + row.value, 0)
  const delta = previousTotal ? ((total - previousTotal) / previousTotal) * 100 : 0

  return {
    title: meta.label,
    value: `${formatInteger(total)}${meta.unit ? ` ${meta.unit}` : ''}`,
    delta: previousPeriod ? formatPercent(delta) : latestPeriod || 'нет данных',
    deltaTone: !previousPeriod ? 'neutral' : delta > 0.5 ? 'positive' : delta < -0.5 ? 'negative' : 'neutral',
    icon: 'bi bi-graph-up-arrow',
    tone: 'blue',
  }
}

export function buildGenericChartData(records, frameConfig, genericFilters = {}) {
  const { category, metric } = parseGenericMetricKey(frameConfig.metric)
  const meta = getGenericMetricMeta(records, frameConfig.metric)
  const rows = filterGenericRecords(records, category, metric, genericFilters)
  const periods = sortedPeriods(rows)
  const entities = sortedEntities(rows)

  if (frameConfig.widgetType === 'line') {
    return {
      labels: periods,
      datasets: entities.slice(0, 6).map((entity, index) => ({
        label: entity,
        data: periods.map((period) => rows.find((row) => row.entity === entity && row.period === period)?.value ?? null),
        borderColor: palette[index % palette.length],
        backgroundColor: `${palette[index % palette.length]}22`,
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      })),
    }
  }

  if (frameConfig.widgetType === 'doughnut') {
    const values = entities.map((entity) => latestValueForEntity(rows, entity, periods))
    return {
      labels: entities,
      datasets: [
        {
          label: meta.label,
          data: values,
          valueLabels: values.map((value) => formatInteger(value)),
          backgroundColor: palette,
          borderColor: '#ffffff',
          borderWidth: 3,
        },
      ],
    }
  }

  if (frameConfig.widgetType === 'scatter') {
    return {
      datasets: entities.map((entity, index) => ({
        label: entity,
        data: [{ x: index + 1, y: latestValueForEntity(rows, entity, periods) }],
        backgroundColor: palette[index % palette.length],
        pointRadius: 7,
        pointHoverRadius: 9,
      })),
    }
  }

  if (frameConfig.widgetType === 'radar') {
    const values = entities.map((entity) => latestValueForEntity(rows, entity, periods))
    const max = Math.max(1, ...values)
    return {
      labels: entities,
      datasets: [
        {
          label: meta.label,
          data: values.map((value) => Math.round((value / max) * 100)),
          borderColor: '#1f7aec',
          backgroundColor: '#1f7aec33',
          pointBackgroundColor: '#1f7aec',
        },
      ],
    }
  }

  // bar — по умолчанию
  return {
    labels: entities.map(wrapChartLabel),
    datasets: [
      {
        label: meta.label,
        data: entities.map((entity) => latestValueForEntity(rows, entity, periods)),
        backgroundColor: '#1f7aec',
        borderRadius: 6,
      },
    ],
  }
}

export function buildGenericHeatmap(records, frameConfig, genericFilters = {}) {
  const { category, metric } = parseGenericMetricKey(frameConfig.metric)
  const rows = filterGenericRecords(records, category, metric, genericFilters)
  const periods = sortedPeriods(rows)
  const entities = sortedEntities(rows)
  const values = rows.map((row) => row.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  return {
    semesters: periods,
    rows: entities.map((entity) => ({
      id: entity,
      shortName: entity,
      cells: periods.map((period) => {
        const match = rows.find((row) => row.entity === entity && row.period === period)
        return {
          semester: period,
          value: match ? formatHeatmapValue(match.value) : '',
          color: match ? heatColor(match.value, min, max) : '#eef2f6',
        }
      }),
    })),
  }
}

export function buildGenericTableRows(records, frameConfig, genericFilters = {}) {
  const { category, metric } = parseGenericMetricKey(frameConfig.metric)
  return filterGenericRecords(records, category, metric, genericFilters)
    .slice()
    .sort((a, b) => a.entity.localeCompare(b.entity, 'ru') || a.period.localeCompare(b.period))
}

function formatHeatmapValue(value) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2)
}

function heatColor(value, min, max) {
  if (max === min) return '#7bd88f'
  const ratio = (value - min) / (max - min)
  if (ratio >= 0.75) return '#2a9d68'
  if (ratio >= 0.5) return '#7bd88f'
  if (ratio >= 0.25) return '#f2d36b'
  return '#ef8a70'
}

function wrapChartLabel(label) {
  const words = label.split(' ')
  if (words.length <= 2) return label

  const lines = []
  let line = ''

  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word
    if (nextLine.length > 18 && lines.length < 2) {
      lines.push(line)
      line = word
      return
    }

    line = nextLine
  })

  if (line) lines.push(line)
  return lines.slice(0, 3)
}
