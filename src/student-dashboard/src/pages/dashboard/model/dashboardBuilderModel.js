import { cloneDashboardFilters, buildDashboardViewModel } from './dashboardViewModel.js'
import { dashboardTemplates } from './dashboardTemplates.js'
import {
  buildGenericChartData,
  buildGenericHeatmap,
  buildGenericKpi,
  buildGenericMetricOptions,
  buildGenericTableRows,
  getGenericMetricMeta,
  isGenericMetric,
} from './genericMetricsModel.js'

const chartPalette = ['#1f7aec', '#31b7bc', '#6f62d2', '#f2b447', '#ef6f6c', '#2a9d68', '#52667a', '#9b6aef']

export const widgetTypes = [
  { value: 'empty', label: 'Пустой фрейм' },
  { value: 'kpi', label: 'KPI' },
  { value: 'bar', label: 'Столбчатая диаграмма' },
  { value: 'line', label: 'Линейная диаграмма' },
  { value: 'doughnut', label: 'Круговая диаграмма' },
  { value: 'scatter', label: 'Точечная диаграмма' },
  { value: 'radar', label: 'Радар' },
  { value: 'heatmap', label: 'Тепловая карта' },
  { value: 'table', label: 'Таблица' },
]

export const metricOptions = [
  { value: 'summary', label: 'Сводка' },
  { value: 'averageScore', label: 'Средний балл' },
  { value: 'students', label: 'Количество студентов' },
  { value: 'trend', label: 'Динамика' },
]

// Динамический список показателей: встроенные + всё, что обнаружено в загруженном
// пользователем универсальном (tidy-data) датасете. Используется в живом приложении;
// статический metricOptions выше сохранён для обратной совместимости и тестов.
export function buildMetricOptions(genericRecords = []) {
  return [...metricOptions, ...buildGenericMetricOptions(genericRecords)]
}

export const groupByOptions = [
  { value: 'faculty', label: 'По институтам' },
  { value: 'semester', label: 'По семестрам' },
]

export function createDefaultBuilderConfig() {
  const template = dashboardTemplates[0]

  return {
    templateId: template.id,
    activeFrameId: template.frames[0].id,
    frames: cloneFrames(template.frames),
  }
}

export function createBuilderConfigForTemplate(templateId, previousConfig) {
  const template = getTemplate(templateId)
  const previousFrames = new Map((previousConfig?.frames || []).map((frame) => [frame.id, frame]))
  const frames = template.frames.map((frame) => ({
    ...frame,
    ...previousFrames.get(frame.id),
    size: frame.size,
  }))

  return {
    templateId: template.id,
    activeFrameId: frames[0]?.id || null,
    frames,
  }
}

export function buildDashboardBuilderViewModel(dataset, filters, builderConfig, genericRecords = [], genericFilters = {}) {
  const template = getTemplate(builderConfig.templateId)
  const frames = builderConfig.frames.map((frame) => ({
    ...frame,
    viewModel: buildFrameViewModel(dataset, filters, frame, genericRecords, genericFilters),
  }))
  const activeFrame = frames.find((frame) => frame.id === builderConfig.activeFrameId) || frames[0]

  return {
    template,
    frames,
    activeFrame,
    inspectorOptions: {
      widgetTypes,
      metricOptions: buildMetricOptions(genericRecords),
      groupByOptions,
      faculties: buildDashboardViewModel(dataset, filters).filterOptions.faculties,
    },
  }
}

export function buildFrameViewModel(dataset, filters, frameConfig, genericRecords = [], genericFilters = {}) {
  if (frameConfig.widgetType === 'empty') {
    return {
      kind: 'empty',
      title: frameConfig.title,
      message: 'Выберите диаграмму и данные для визуализации',
    }
  }

  if (isGenericMetric(frameConfig.metric)) {
    return buildGenericFrameViewModel(genericRecords, frameConfig, genericFilters)
  }

  const frameFilters = buildFrameFilters(filters, frameConfig)
  const dashboardViewModel = buildDashboardViewModel(dataset, frameFilters)

  if (frameConfig.widgetType === 'kpi') {
    return {
      kind: 'kpi',
      title: frameConfig.title,
      kpis: Object.values(dashboardViewModel.kpis),
    }
  }

  if (frameConfig.widgetType === 'heatmap') {
    const metricName = frameConfig.metric === 'summary' ? 'averageScore' : frameConfig.metric

    return {
      kind: 'heatmap',
      title: frameConfig.title,
      rows: buildMetricHeatmapRows(dashboardViewModel, metricName),
      semesters: dashboardViewModel.filterOptions.semesters,
    }
  }

  if (frameConfig.widgetType === 'table') {
    return {
      kind: 'table',
      title: frameConfig.title,
      rows: dashboardViewModel.detailRows,
    }
  }

  return {
    kind: 'chart',
    title: frameConfig.title,
    chartType: frameConfig.widgetType,
    chartData: getChartData(dashboardViewModel, frameConfig),
    axisMode: getAxisMode(frameConfig),
    dualAxis: frameConfig.widgetType === 'bar' && frameConfig.metric === 'summary',
    metricName: normalizeMetric(frameConfig),
  }
}

function buildGenericFrameViewModel(genericRecords, frameConfig, genericFilters = {}) {
  if (frameConfig.widgetType === 'kpi') {
    return {
      kind: 'kpi',
      title: frameConfig.title,
      kpis: [buildGenericKpi(genericRecords, frameConfig, genericFilters)],
    }
  }

  if (frameConfig.widgetType === 'heatmap') {
    const heatmap = buildGenericHeatmap(genericRecords, frameConfig, genericFilters)
    return {
      kind: 'heatmap',
      title: frameConfig.title,
      rows: heatmap.rows,
      semesters: heatmap.semesters,
    }
  }

  if (frameConfig.widgetType === 'table') {
    return {
      kind: 'generic-table',
      title: frameConfig.title,
      rows: buildGenericTableRows(genericRecords, frameConfig, genericFilters),
    }
  }

  const meta = getGenericMetricMeta(genericRecords, frameConfig.metric)

  return {
    kind: 'chart',
    title: frameConfig.title,
    chartType: frameConfig.widgetType,
    chartData: buildGenericChartData(genericRecords, frameConfig, genericFilters),
    axisMode: 'count',
    dualAxis: false,
    metricName: frameConfig.metric,
    metricLabel: meta.label,
  }
}

export function updateFrameConfig(builderConfig, frameId, patch) {
  return {
    ...builderConfig,
    frames: builderConfig.frames.map((frame) =>
      frame.id === frameId
        ? {
            ...frame,
            ...patch,
          }
        : frame,
    ),
  }
}

function buildFrameFilters(filters, frameConfig) {
  const frameFilters = cloneDashboardFilters(filters)

  if (frameConfig.facultyIds?.length) {
    frameFilters.facultyIds = [...frameConfig.facultyIds]
    frameFilters.faculty = 'all'
  }

  return frameFilters
}

function getChartData(dashboardViewModel, frameConfig) {
  if (frameConfig.widgetType === 'bar') {
    return buildBarData(dashboardViewModel, frameConfig)
  }

  if (frameConfig.widgetType === 'line') {
    return buildLineData(dashboardViewModel, frameConfig)
  }

  if (frameConfig.widgetType === 'doughnut') {
    return buildDoughnutData(dashboardViewModel, frameConfig)
  }

  if (frameConfig.widgetType === 'scatter') {
    return buildScatterData(dashboardViewModel, frameConfig)
  }

  if (frameConfig.widgetType === 'radar') {
    return buildRadarData(dashboardViewModel, frameConfig)
  }

  return dashboardViewModel.charts[frameConfig.widgetType] || dashboardViewModel.charts.bar
}

function buildBarData(dashboardViewModel, frameConfig) {
  if (frameConfig.metric === 'summary') {
    return dashboardViewModel.charts.bar
  }

  if (frameConfig.groupBy === 'semester') {
    return buildSemesterBarData(dashboardViewModel, frameConfig.metric)
  }

  const metric = getMetricDescriptor(frameConfig.metric)

  return {
    labels: dashboardViewModel.facultySummaries.map((faculty) => wrapChartLabel(faculty.compactName)),
    datasets: [
      {
        label: metric.label,
        data: dashboardViewModel.facultySummaries.map((faculty) => getFacultyMetricValue(faculty, frameConfig.metric)),
        backgroundColor: metric.color,
        borderRadius: 6,
      },
    ],
  }
}

function buildSemesterBarData(dashboardViewModel, metricName) {
  const semesters = dashboardViewModel.filterOptions.semesters
  const metric = getMetricDescriptor(metricName)

  return {
    labels: semesters.map((semester) => `${semester} семестр`),
    datasets: [
      {
        label: metric.label,
        data: semesters.map((semester) => getSemesterMetricValue(dashboardViewModel.appliedRows, semester, metricName)),
        backgroundColor: metric.color,
        borderRadius: 6,
      },
    ],
  }
}

function buildLineData(dashboardViewModel, frameConfig) {
  const metricName = frameConfig.metric === 'summary' ? 'averageScore' : frameConfig.metric
  const semesters = dashboardViewModel.filterOptions.semesters

  return {
    labels: semesters.map((semester) => `${semester} семестр`),
    datasets: dashboardViewModel.facultySummaries.slice(0, 5).map((faculty, index) => ({
      label: faculty.shortName,
      data: semesters.map((semester) => {
        const rows = dashboardViewModel.appliedRows.filter(
          (row) => row.facultyId === faculty.id && row.semester === semester,
        )
        return getRowsMetricValue(rows, metricName)
      }),
      borderColor: chartPalette[index % chartPalette.length],
      backgroundColor: `${chartPalette[index % chartPalette.length]}22`,
      tension: 0.35,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  }
}

function buildDoughnutData(dashboardViewModel, frameConfig) {
  const metricName = frameConfig.metric === 'summary' ? 'students' : frameConfig.metric
  const metric = getMetricDescriptor(metricName)

  return {
    labels: dashboardViewModel.facultySummaries.map((faculty) => faculty.shortName),
    datasets: [
      {
        label: metric.label,
        data: dashboardViewModel.facultySummaries.map((faculty) => getDoughnutMetricValue(faculty, metricName)),
        valueLabels: dashboardViewModel.facultySummaries.map((faculty) =>
          formatDoughnutValue(getFacultyMetricValue(faculty, metricName), metricName),
        ),
        backgroundColor: chartPalette,
        borderColor: '#ffffff',
        borderWidth: 3,
      },
    ],
  }
}

function buildScatterData(dashboardViewModel, frameConfig) {
  const metricName = frameConfig.metric === 'summary' ? 'averageScore' : frameConfig.metric
  const useStudentsAsY = metricName === 'students'

  return {
    datasets: dashboardViewModel.facultySummaries.map((faculty, index) => ({
      label: faculty.shortName,
      data: [
        {
          x: useStudentsAsY ? faculty.averageScore : faculty.students,
          y: getFacultyMetricValue(faculty, metricName),
        },
      ],
      backgroundColor: chartPalette[index % chartPalette.length],
      pointRadius: 7,
      pointHoverRadius: 9,
    })),
  }
}

function buildRadarData(dashboardViewModel, frameConfig) {
  if (frameConfig.metric === 'summary') {
    return dashboardViewModel.charts.radar
  }

  const metric = getMetricDescriptor(frameConfig.metric)

  return {
    labels: dashboardViewModel.facultySummaries.map((faculty) => faculty.shortName),
    datasets: [
      {
        label: metric.label,
        data: dashboardViewModel.facultySummaries.map((faculty) =>
          normalizeRadarValue(getFacultyMetricValue(faculty, frameConfig.metric), frameConfig.metric),
        ),
        borderColor: metric.color,
        backgroundColor: `${metric.color}33`,
        pointBackgroundColor: metric.color,
      },
    ],
  }
}

function getMetricDescriptor(metricName) {
  const descriptors = {
    averageScore: { label: 'Средний балл', color: '#1f7aec' },
    students: { label: 'Студентов', color: '#31b7bc' },
    trend: { label: 'Динамика, %', color: '#f2b447' },
  }

  return descriptors[metricName] || descriptors.averageScore
}

function normalizeMetric(frameConfig) {
  if (frameConfig.metric === 'summary') {
    return frameConfig.widgetType === 'doughnut' ? 'students' : 'averageScore'
  }

  return frameConfig.metric
}

function getAxisMode(frameConfig) {
  const metricName = normalizeMetric(frameConfig)
  if (metricName === 'students') return 'count'
  if (metricName === 'trend') return 'trend'
  return 'score'
}

function getFacultyMetricValue(faculty, metricName) {
  if (metricName === 'students') return faculty.students
  if (metricName === 'trend') return roundMetric(faculty.trend)
  return roundMetric(faculty.averageScore)
}

function getDoughnutMetricValue(faculty, metricName) {
  if (metricName === 'trend') return Math.max(1, roundMetric(50 + faculty.trend * 12))
  return getFacultyMetricValue(faculty, metricName)
}

function formatDoughnutValue(value, metricName) {
  if (metricName === 'students') return value.toString()
  if (metricName === 'trend') return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  return value.toFixed(2)
}

function getSemesterMetricValue(rows, semester, metricName) {
  return getRowsMetricValue(
    rows.filter((row) => row.semester === semester),
    metricName,
  )
}

function getRowsMetricValue(rows, metricName) {
  if (!rows.length) return null
  if (metricName === 'students') return rows.reduce((sum, row) => sum + row.studentsCount, 0)
  if (metricName === 'trend') return roundMetric(average(rows.map((row) => row.trend)))
  return roundMetric(average(rows.map((row) => row.averageScore)))
}

function normalizeRadarValue(value, metricName) {
  if (value === null) return 0
  if (metricName === 'averageScore') return roundMetric(value * 20)
  if (metricName === 'trend') return roundMetric(Math.max(0, 50 + value * 12))
  return value
}

function buildMetricHeatmapRows(dashboardViewModel, metricName) {
  return dashboardViewModel.heatmapRows.map((faculty) => ({
    ...faculty,
    cells: faculty.cells.map((cell) => {
      const rows = dashboardViewModel.appliedRows.filter(
        (row) => row.facultyId === faculty.id && row.semester === cell.semester,
      )
      const value = getRowsMetricValue(rows, metricName)

      return {
        semester: cell.semester,
        value: formatHeatmapValue(value, metricName),
        color: getMetricHeatColor(value, metricName),
      }
    }),
  }))
}

function formatHeatmapValue(value, metricName) {
  if (value === null) return ''
  if (metricName === 'students') return value.toString()
  if (metricName === 'trend') return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  return value.toFixed(2)
}

function getMetricHeatColor(value, metricName) {
  if (value === null) return '#eef2f6'
  if (metricName === 'students') {
    if (value >= 180) return '#2a9d68'
    if (value >= 140) return '#7bd88f'
    if (value >= 100) return '#f2d36b'
    return '#ef8a70'
  }

  if (metricName === 'trend') {
    if (value > 1.5) return '#2a9d68'
    if (value > 0.2) return '#7bd88f'
    if (value >= -0.2) return '#f2d36b'
    return '#ef8a70'
  }

  if (value >= 4.2) return '#2a9d68'
  if (value >= 4.05) return '#7bd88f'
  if (value >= 3.95) return '#f2d36b'
  return '#ef8a70'
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function roundMetric(value) {
  return Math.round(value * 100) / 100
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

function getTemplate(templateId) {
  return dashboardTemplates.find((template) => template.id === templateId) || dashboardTemplates[0]
}

function cloneFrames(frames) {
  return JSON.parse(JSON.stringify(frames))
}
