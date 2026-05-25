import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildDashboardViewModel,
  createDefaultDashboardFilters,
} from './dashboardViewModel.js'

const dataset = {
  faculties: [
    {
      facultyId: 1,
      faculty: 'Информатика и вычислительная техника',
      year: 2024,
      createdAt: '2026-01-31 15:01:58.368962',
    },
    {
      facultyId: 2,
      faculty: 'Нефтегазовое дело',
      year: 2024,
      createdAt: '2026-01-31 15:01:58.368962',
    },
  ],
  performance: [
    {
      id: 1,
      facultyId: 1,
      averageScore: 4.2,
      studentsCount: 100,
      semester: 1,
      year: 2024,
      createdAt: '2026-01-31 15:03:18.728774',
    },
    {
      id: 2,
      facultyId: 1,
      averageScore: 4.4,
      studentsCount: 100,
      semester: 2,
      year: 2024,
      createdAt: '2026-01-31 15:03:18.728774',
    },
    {
      id: 3,
      facultyId: 2,
      averageScore: 3.9,
      studentsCount: 80,
      semester: 1,
      year: 2024,
      createdAt: '2026-01-31 15:03:18.728774',
    },
  ],
  users: [],
}

describe('buildDashboardViewModel', () => {
  it('joins faculties, calculates KPI values, and generates compact faculty labels', () => {
    const filters = createDefaultDashboardFilters(dataset)
    const viewModel = buildDashboardViewModel(dataset, filters)

    assert.equal(viewModel.kpis.averageScore.value, '4.17')
    assert.equal(viewModel.kpis.students.value, '280')
    assert.equal(viewModel.kpis.bestFaculty.value, 'ИВТ')
    assert.equal(viewModel.detailRows[0].shortName, 'ИВТ')
    assert.ok(Math.abs(viewModel.detailRows[0].trend - 4.761904761904762) < 0.00000000001)
  })

  it('filters by applied query, semester, score range, and trend', () => {
    const filters = {
      ...createDefaultDashboardFilters(dataset),
      query: 'ивт',
      semester: 2,
      scoreMin: 4.3,
      scoreMax: 4.5,
      trend: 'positive',
    }

    const viewModel = buildDashboardViewModel(dataset, filters)

    assert.equal(viewModel.detailRows.length, 1)
    assert.equal(viewModel.detailRows[0].facultyName, 'Информатика и вычислительная техника')
    assert.equal(viewModel.detailRows[0].semester, 2)
  })

  it('treats empty facultyIds as all faculties and filters by multiple faculty ids', () => {
    const allFilters = {
      ...createDefaultDashboardFilters(dataset),
      facultyIds: [],
    }
    const selectedFilters = {
      ...createDefaultDashboardFilters(dataset),
      facultyIds: [1],
    }

    const allViewModel = buildDashboardViewModel(dataset, allFilters)
    const selectedViewModel = buildDashboardViewModel(dataset, selectedFilters)

    assert.equal(allViewModel.detailRows.length, 3)
    assert.equal(selectedViewModel.detailRows.length, 2)
    assert.ok(selectedViewModel.detailRows.every((row) => row.facultyId === 1))
  })
})
