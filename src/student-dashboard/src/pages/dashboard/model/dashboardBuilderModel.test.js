import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildDashboardBuilderViewModel,
  buildFrameViewModel,
  createDefaultBuilderConfig,
  metricOptions,
  widgetTypes,
} from './dashboardBuilderModel.js'
import { dashboardTemplates } from './dashboardTemplates.js'
import { createDefaultDashboardFilters } from './dashboardViewModel.js'

const dataset = {
  faculties: [
    { facultyId: 1, faculty: 'Информатика и вычислительная техника', year: 2024, createdAt: '' },
    { facultyId: 2, faculty: 'Нефтегазовое дело', year: 2024, createdAt: '' },
    { facultyId: 3, faculty: 'Экономика и управление', year: 2024, createdAt: '' },
  ],
  performance: [
    { id: 1, facultyId: 1, averageScore: 4.2, studentsCount: 100, semester: 1, year: 2024, createdAt: '' },
    { id: 2, facultyId: 1, averageScore: 4.4, studentsCount: 100, semester: 2, year: 2024, createdAt: '' },
    { id: 3, facultyId: 2, averageScore: 3.9, studentsCount: 80, semester: 1, year: 2024, createdAt: '' },
    { id: 4, facultyId: 3, averageScore: 4.1, studentsCount: 90, semester: 1, year: 2024, createdAt: '' },
  ],
  users: [],
}

describe('dashboard builder model', () => {
  it('creates three templates with fixed frame slots', () => {
    assert.equal(dashboardTemplates.length, 3)
    assert.deepEqual(
      dashboardTemplates.map((template) => template.id),
      ['overview', 'comparison', 'presentation'],
    )
    assert.ok(dashboardTemplates.every((template) => template.frames.length >= 4))
  })

  it('creates default builder config from the overview template', () => {
    const config = createDefaultBuilderConfig()

    assert.equal(config.templateId, 'overview')
    assert.equal(config.activeFrameId, dashboardTemplates[0].frames[0].id)
    assert.equal(config.frames.length, dashboardTemplates[0].frames.length)
  })

  it('builds frame view model with local faculty selection', () => {
    const filters = createDefaultDashboardFilters(dataset)
    const frame = {
      id: 'test-frame',
      title: 'Сравнение ИВТ',
      widgetType: 'bar',
      metric: 'averageScore',
      groupBy: 'faculty',
      facultyIds: [1],
    }

    const frameViewModel = buildFrameViewModel(dataset, filters, frame)

    assert.equal(frameViewModel.kind, 'chart')
    assert.deepEqual(frameViewModel.chartData.labels, [
      ['Информатика и', 'вычислительная', 'техника'],
    ])
  })

  it('uses selected metric for line chart data', () => {
    const filters = createDefaultDashboardFilters(dataset)
    const frame = {
      id: 'line-frame',
      title: 'Динамика студентов',
      widgetType: 'line',
      metric: 'students',
      groupBy: 'semester',
      facultyIds: [],
    }

    const frameViewModel = buildFrameViewModel(dataset, filters, frame)

    assert.equal(frameViewModel.chartData.datasets[0].label, 'ИВТ')
    assert.deepEqual(frameViewModel.chartData.datasets[0].data, [100, 100])
  })

  it('uses selected metric for doughnut chart data', () => {
    const filters = createDefaultDashboardFilters(dataset)
    const frame = {
      id: 'doughnut-frame',
      title: 'Доля по баллам',
      widgetType: 'doughnut',
      metric: 'averageScore',
      groupBy: 'faculty',
      facultyIds: [],
    }

    const frameViewModel = buildFrameViewModel(dataset, filters, frame)

    assert.equal(frameViewModel.chartData.datasets[0].label, 'Средний балл')
    assert.deepEqual(frameViewModel.chartData.datasets[0].data, [4.3, 4.1, 3.9])
    assert.deepEqual(frameViewModel.chartData.datasets[0].valueLabels, ['4.30', '4.10', '3.90'])
  })

  it('builds renderable data for every widget and metric combination', () => {
    const filters = createDefaultDashboardFilters(dataset)

    widgetTypes.forEach((widgetType) => {
      metricOptions.forEach((metric) => {
        const frameViewModel = buildFrameViewModel(dataset, filters, {
          id: `${widgetType.value}-${metric.value}`,
          title: `${widgetType.label}: ${metric.label}`,
          widgetType: widgetType.value,
          metric: metric.value,
          groupBy: 'faculty',
          facultyIds: [],
        })

        assertRenderableFrame(frameViewModel, `${widgetType.value}/${metric.value}`)
      })
    })
  })

  it('builds dashboard builder view model for selected template', () => {
    const filters = createDefaultDashboardFilters(dataset)
    const config = createDefaultBuilderConfig()
    const builderViewModel = buildDashboardBuilderViewModel(dataset, filters, config)

    assert.equal(builderViewModel.template.id, 'overview')
    assert.equal(builderViewModel.frames.length, config.frames.length)
    assert.ok(builderViewModel.inspectorOptions.widgetTypes.some((item) => item.value === 'doughnut'))
  })
})

function assertRenderableFrame(frameViewModel, name) {
  if (frameViewModel.kind === 'empty') {
    assert.ok(frameViewModel.message, name)
    return
  }

  if (frameViewModel.kind === 'kpi') {
    assert.ok(frameViewModel.kpis.length > 0, name)
    return
  }

  if (frameViewModel.kind === 'heatmap') {
    assert.ok(frameViewModel.rows.length > 0, name)
    assert.ok(frameViewModel.rows.some((row) => row.cells.some((cell) => cell.value)), name)
    return
  }

  if (frameViewModel.kind === 'table') {
    assert.ok(frameViewModel.rows.length > 0, name)
    return
  }

  assert.equal(frameViewModel.kind, 'chart', name)
  assert.ok(frameViewModel.chartData.datasets.length > 0, name)
  assert.ok(
    frameViewModel.chartData.datasets.every((datasetItem) =>
      datasetItem.data.some((value) => hasRenderableValue(value)),
    ),
    name,
  )
}

function hasRenderableValue(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'object') {
    return Object.values(value).some((item) => typeof item === 'number' && Number.isFinite(item))
  }

  return false
}
