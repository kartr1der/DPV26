import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildGenericChartData,
  buildGenericHeatmap,
  buildGenericKpi,
  buildGenericMetricOptions,
  buildGenericTableRows,
  buildGenericMetricValue,
  getCategoryFilterOptions,
  getGenericMetricMeta,
  isGenericMetric,
  parseGenericMetricKey,
} from './genericMetricsModel.js'
import { normalizeMetricRecord, isTidyHeaderRow, isValidMetricRecord } from '../../../entities/metric/model.js'
import { buildFrameViewModel, buildDashboardBuilderViewModel, createBuilderConfigForTemplate } from './dashboardBuilderModel.js'

const rawRows = [
  { category: 'science', category_label: 'Научная деятельность', metric: 'publications', metric_label: 'Публикации', entity: 'ИВТ', period: '2024', value: '80', unit: 'шт' },
  { category: 'science', category_label: 'Научная деятельность', metric: 'publications', metric_label: 'Публикации', entity: 'ИВТ', period: '2025', value: '112', unit: 'шт' },
  { category: 'science', category_label: 'Научная деятельность', metric: 'publications', metric_label: 'Публикации', entity: 'НГД', period: '2025', value: '54', unit: 'шт' },
  { category: 'finance', category_label: 'Финансово-экономические показатели', metric: 'budget_funding', metric_label: 'Бюджетное финансирование', entity: 'ИВТ', period: '2025', value: '90000000', unit: 'руб.' },
]

const records = rawRows.map((row, index) => normalizeMetricRecord(row, index + 1))

describe('entities/metric/model', () => {
  it('detects tidy header rows regardless of column order', () => {
    assert.ok(isTidyHeaderRow(['category', 'metric', 'entity', 'period', 'value']))
    assert.ok(isTidyHeaderRow(['value', 'period', 'entity', 'metric', 'category', 'unit']))
    assert.ok(!isTidyHeaderRow(['faculty_id', 'faculty', 'year']))
  })

  it('normalizes a raw csv row into a metric record', () => {
    const record = normalizeMetricRecord(rawRows[0], 1)
    assert.equal(record.category, 'science')
    assert.equal(record.metric, 'publications')
    assert.equal(record.entity, 'ИВТ')
    assert.equal(record.period, '2024')
    assert.equal(record.value, 80)
    assert.ok(isValidMetricRecord(record))
  })
})

describe('genericMetricsModel', () => {
  it('builds metric options grouped by category/metric, deduplicated', () => {
    const options = buildGenericMetricOptions(records)
    assert.equal(options.length, 2)
    assert.ok(options.every((option) => isGenericMetric(option.value)))
  })

  it('parses and rebuilds generic metric keys symmetrically', () => {
    const value = buildGenericMetricValue('science', 'publications')
    assert.equal(value, 'generic:science:publications')
    assert.deepEqual(parseGenericMetricKey(value), { category: 'science', metric: 'publications' })
  })

  it('builds a kpi tile with period-over-period delta', () => {
    const frameConfig = { metric: 'generic:science:publications' }
    const kpi = buildGenericKpi(records, frameConfig)

    assert.equal(kpi.title, 'Публикации')
    // 2025: ИВТ 112 + НГД 54 = 166
    assert.match(kpi.value, /166/)
  })

  it('builds bar chart data using the latest period per entity', () => {
    const frameConfig = { metric: 'generic:science:publications', widgetType: 'bar' }
    const chartData = buildGenericChartData(records, frameConfig)

    assert.equal(chartData.datasets[0].data.length, 2) // ИВТ, НГД
    assert.ok(chartData.datasets[0].data.includes(112))
    assert.ok(chartData.datasets[0].data.includes(54))
  })

  it('builds heatmap rows colored by relative value', () => {
    const frameConfig = { metric: 'generic:science:publications' }
    const heatmap = buildGenericHeatmap(records, frameConfig)

    assert.deepEqual(heatmap.semesters, ['2024', '2025'])
    assert.equal(heatmap.rows.length, 2)
  })

  it('builds raw table rows for a metric', () => {
    const frameConfig = { metric: 'generic:finance:budget_funding' }
    const rows = buildGenericTableRows(records, frameConfig)

    assert.equal(rows.length, 1)
    assert.equal(rows[0].entity, 'ИВТ')
  })

  it('resolves metric metadata (label/unit)', () => {
    const meta = getGenericMetricMeta(records, 'generic:finance:budget_funding')
    assert.equal(meta.label, 'Бюджетное финансирование')
    assert.equal(meta.unit, 'руб.')
  })

  it('applies entity/period filters to generic builders', () => {
    const frameConfig = { metric: 'generic:science:publications', widgetType: 'bar' }

    const filteredKpi = buildGenericKpi(records, frameConfig, { entities: ['ИВТ'] })
    assert.match(filteredKpi.value, /112/) // только ИВТ за 2025, без НГД

    const filteredChart = buildGenericChartData(records, frameConfig, { entities: ['ИВТ'] })
    assert.deepEqual(filteredChart.labels, ['ИВТ'])

    const filteredByPeriod = buildGenericTableRows(records, frameConfig, { periods: ['2024'] })
    assert.equal(filteredByPeriod.length, 1)
    assert.equal(filteredByPeriod[0].period, '2024')
  })

  it('builds filter options for a given category (entities/periods)', () => {
    const options = getCategoryFilterOptions(records, 'science')
    assert.deepEqual(options.entities, ['ИВТ', 'НГД'])
    assert.deepEqual(options.periods, ['2024', '2025'])
    assert.equal(options.categoryLabel, 'Научная деятельность')
  })
})

describe('dashboardBuilderModel + generic metrics integration', () => {
  it('routes generic metric frames to generic-table/kpi/chart kinds', () => {
    const dataset = { faculties: [], performance: [], users: [] }
    const filters = { faculty: 'all', facultyIds: [], query: '', year: 'all', semester: 'all', scoreMin: 0, scoreMax: 5, studentsMin: 0, studentsMax: 999, trend: 'all', sort: 'scoreDesc' }

    const kpiFrame = buildFrameViewModel(dataset, filters, { id: 'k', title: 'KPI', widgetType: 'kpi', metric: 'generic:science:publications', groupBy: 'faculty', facultyIds: [] }, records)
    assert.equal(kpiFrame.kind, 'kpi')
    assert.equal(kpiFrame.kpis.length, 1)

    const tableFrame = buildFrameViewModel(dataset, filters, { id: 't', title: 'Таблица', widgetType: 'table', metric: 'generic:finance:budget_funding', groupBy: 'faculty', facultyIds: [] }, records)
    assert.equal(tableFrame.kind, 'generic-table')
    assert.equal(tableFrame.rows.length, 1)

    const chartFrame = buildFrameViewModel(dataset, filters, { id: 'c', title: 'Bar', widgetType: 'bar', metric: 'generic:science:publications', groupBy: 'faculty', facultyIds: [] }, records)
    assert.equal(chartFrame.kind, 'chart')
    assert.ok(chartFrame.chartData.datasets.length > 0)
  })

  it('still works without generic records passed (backward compatibility)', () => {
    const dataset = {
      faculties: [{ facultyId: 1, faculty: 'ИВТ', year: 2024, createdAt: '' }],
      performance: [{ id: 1, facultyId: 1, averageScore: 4.2, studentsCount: 100, semester: 1, year: 2024, createdAt: '' }],
      users: [],
    }
    const filters = { faculty: 'all', facultyIds: [], query: '', year: 'all', semester: 'all', scoreMin: 0, scoreMax: 5, studentsMin: 0, studentsMax: 999, trend: 'all', sort: 'scoreDesc' }

    const frame = buildFrameViewModel(dataset, filters, { id: 'legacy', title: 'Legacy', widgetType: 'bar', metric: 'averageScore', groupBy: 'faculty', facultyIds: [] })
    assert.equal(frame.kind, 'chart')
  })

  it('builds the "science" template end-to-end with a matching uploaded dataset', () => {
    const scienceRows = [
      { category: 'science', category_label: 'Научная деятельность', metric: 'publications', metric_label: 'Публикации', entity: 'ИВТ', period: '2025', value: '112', unit: 'шт' },
      { category: 'science', category_label: 'Научная деятельность', metric: 'citations', metric_label: 'Цитирования', entity: 'ИВТ', period: '2025', value: '640', unit: 'шт' },
      { category: 'science', category_label: 'Научная деятельность', metric: 'grants', metric_label: 'Объём грантов', entity: 'ИВТ', period: '2025', value: '5200000', unit: 'руб.' },
      { category: 'science', category_label: 'Научная деятельность', metric: 'h_index_avg', metric_label: 'Индекс Хирша (средний)', entity: 'ИВТ', period: '2025', value: '6.4', unit: '' },
    ].map((row, index) => normalizeMetricRecord(row, index + 1))

    const dataset = { faculties: [], performance: [], users: [] }
    const filters = { faculty: 'all', facultyIds: [], query: '', year: 'all', semester: 'all', scoreMin: 0, scoreMax: 5, studentsMin: 0, studentsMax: 999, trend: 'all', sort: 'scoreDesc' }
    const config = createBuilderConfigForTemplate('science')

    const builderViewModel = buildDashboardBuilderViewModel(dataset, filters, config, scienceRows)

    assert.equal(builderViewModel.template.id, 'science')
    builderViewModel.frames.forEach((frame) => {
      assert.notEqual(frame.viewModel.kind, 'empty', frame.id)
      if (frame.viewModel.kind === 'chart') {
        assert.ok(frame.viewModel.chartData.datasets.length > 0, frame.id)
      }
    })
  })
})
