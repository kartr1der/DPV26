import {
  getFacultyCompactName,
  getFacultyShortName,
} from '../../../entities/faculty/model.js'
import {
  formatDecimal,
  formatInteger,
  formatPercent,
} from '../../../shared/formatters/numberFormat.js'

const palette = ['#1f7aec', '#31b7bc', '#6f62d2', '#f2b447', '#ef6f6c', '#2a9d68', '#52667a', '#9b6aef']

export function createDefaultDashboardFilters(dataset) {
  const scores = dataset.performance.map((item) => item.averageScore)
  const students = dataset.performance.map((item) => item.studentsCount)

  return {
    faculty: 'all',
    query: '',
    year: 'all',
    semester: 'all',
    scoreMin: Math.min(...scores),
    scoreMax: Math.max(...scores),
    studentsMin: Math.min(...students),
    studentsMax: Math.max(...students),
    trend: 'all',
    sort: 'scoreDesc',
  }
}

export function buildDashboardViewModel(dataset, filters) {
  const filterOptions = buildFilterOptions(dataset)
  const enrichedRows = enrichPerformanceRows(dataset)
  const filteredRows = filterRows(enrichedRows, filters)
  const sortedRows = sortRows(filteredRows, filters.sort)
  const facultySummaries = buildFacultySummaries(filteredRows)
  const detailRows = sortedRows.map(toDetailRow)

  return {
    kpis: buildKpis(filteredRows, facultySummaries, dataset.faculties.length),
    charts: buildChartModels(facultySummaries, filteredRows, filterOptions.semesters),
    heatmapRows: buildHeatmapRows(filteredRows, dataset.faculties, filterOptions.semesters),
    detailRows,
    filterOptions,
    appliedRows: sortedRows,
    facultySummaries,
    empty: !filteredRows.length,
  }
}

export function cloneDashboardFilters(filters) {
  return JSON.parse(JSON.stringify(filters))
}

export function normalizeDashboardFilters(filters) {
  const [scoreMin, scoreMax] = normalizeRange(filters.scoreMin, filters.scoreMax)
  const [studentsMin, studentsMax] = normalizeRange(filters.studentsMin, filters.studentsMax)

  return {
    ...cloneDashboardFilters(filters),
    scoreMin,
    scoreMax,
    studentsMin,
    studentsMax,
  }
}

export function getScoreTone(score) {
  if (score >= 4.2) return 'excellent'
  if (score >= 4.05) return 'good'
  if (score >= 3.9) return 'average'
  return 'risk'
}

export function getScoreLabel(score) {
  if (score >= 4.2) return 'Высокий уровень'
  if (score >= 4.05) return 'Стабильно'
  if (score >= 3.9) return 'Требует внимания'
  return 'Зона риска'
}

export function getTrendTone(trend) {
  if (trend > 0.05) return 'positive'
  if (trend < -0.05) return 'negative'
  return 'neutral'
}

export function getTrendIcon(trend) {
  if (trend > 0.05) return 'bi bi-arrow-up-right'
  if (trend < -0.05) return 'bi bi-arrow-down-right'
  return 'bi bi-dash-lg'
}

export function getHeatColor(score) {
  if (score >= 4.2) return '#2a9d68'
  if (score >= 4.05) return '#7bd88f'
  if (score >= 3.95) return '#f2d36b'
  return '#ef8a70'
}

function buildFilterOptions(dataset) {
  return {
    faculties: dataset.faculties.map((faculty) => ({
      id: faculty.facultyId,
      name: faculty.faculty,
      shortName: getFacultyShortName(faculty.faculty),
    })),
    years: [...new Set(dataset.performance.map((item) => item.year))].sort((a, b) => b - a),
    semesters: [...new Set(dataset.performance.map((item) => item.semester))].sort((a, b) => a - b),
  }
}

function enrichPerformanceRows(dataset) {
  const facultyById = new Map(dataset.faculties.map((faculty) => [faculty.facultyId, faculty]))

  return dataset.performance.map((item) => {
    const faculty = facultyById.get(item.facultyId)
    const facultyName = faculty?.faculty || `Факультет ${item.facultyId}`
    const previous = dataset.performance.find(
      (entry) =>
        entry.facultyId === item.facultyId &&
        entry.year === item.year &&
        entry.semester === item.semester - 1,
    )

    return {
      ...item,
      facultyName,
      compactName: getFacultyCompactName(facultyName),
      shortName: getFacultyShortName(facultyName),
      trend: previous ? ((item.averageScore - previous.averageScore) / previous.averageScore) * 100 : 0,
    }
  })
}

function filterRows(rows, filters) {
  const normalizedFilters = normalizeDashboardFilters(filters)
  const query = normalizedFilters.query.trim().toLowerCase()

  return rows.filter((row) => {
    const matchesFaculty =
      normalizedFilters.faculty === 'all' || row.facultyId === Number(normalizedFilters.faculty)
    const matchesYear =
      normalizedFilters.year === 'all' || row.year === Number(normalizedFilters.year)
    const matchesSemester =
      normalizedFilters.semester === 'all' || row.semester === Number(normalizedFilters.semester)
    const matchesScore =
      row.averageScore >= normalizedFilters.scoreMin && row.averageScore <= normalizedFilters.scoreMax
    const matchesStudents =
      row.studentsCount >= normalizedFilters.studentsMin &&
      row.studentsCount <= normalizedFilters.studentsMax
    const matchesQuery =
      !query ||
      row.facultyName.toLowerCase().includes(query) ||
      row.shortName.toLowerCase().includes(query)
    const matchesTrend =
      normalizedFilters.trend === 'all' ||
      (normalizedFilters.trend === 'positive' && row.trend > 0.05) ||
      (normalizedFilters.trend === 'negative' && row.trend < -0.05) ||
      (normalizedFilters.trend === 'stable' && Math.abs(row.trend) <= 0.05)

    return (
      matchesFaculty &&
      matchesYear &&
      matchesSemester &&
      matchesScore &&
      matchesStudents &&
      matchesQuery &&
      matchesTrend
    )
  })
}

function sortRows(rows, sort) {
  const sorters = {
    scoreDesc: (a, b) => b.averageScore - a.averageScore,
    scoreAsc: (a, b) => a.averageScore - b.averageScore,
    studentsDesc: (a, b) => b.studentsCount - a.studentsCount,
    trendDesc: (a, b) => b.trend - a.trend,
    facultyAsc: (a, b) => a.facultyName.localeCompare(b.facultyName, 'ru'),
  }

  return [...rows].sort(sorters[sort] || sorters.scoreDesc)
}

function buildFacultySummaries(rows) {
  const groups = new Map()

  rows.forEach((row) => {
    if (!groups.has(row.facultyId)) {
      groups.set(row.facultyId, {
        id: row.facultyId,
        name: row.facultyName,
        compactName: row.compactName,
        shortName: row.shortName,
        scores: [],
        students: 0,
        trend: 0,
      })
    }

    const group = groups.get(row.facultyId)
    group.scores.push(row.averageScore)
    group.students += row.studentsCount
    group.trend += row.trend
  })

  return [...groups.values()]
    .map((group) => ({
      ...group,
      averageScore: average(group.scores),
      trend: group.scores.length ? group.trend / group.scores.length : 0,
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
}

function buildKpis(rows, facultySummaries, totalFaculties) {
  const scores = rows.map((row) => row.averageScore)
  const totalStudents = rows.reduce((sum, row) => sum + row.studentsCount, 0)
  const averageTrend = rows.length ? rows.reduce((sum, row) => sum + row.trend, 0) / rows.length : 0
  const bestFaculty = facultySummaries[0]

  return {
    averageScore: {
      title: 'Средний балл',
      value: formatDecimal(average(scores)),
      delta: formatPercent(averageTrend),
      deltaTone: getTrendTone(averageTrend),
      icon: 'bi bi-mortarboard-fill',
      tone: 'blue',
    },
    students: {
      title: 'Студентов в срезе',
      value: formatInteger(totalStudents),
      delta: `${rows.length} записей`,
      deltaTone: 'neutral',
      icon: 'bi bi-people-fill',
      tone: 'cyan',
    },
    bestFaculty: {
      title: 'Лучший факультет',
      value: bestFaculty?.shortName || '—',
      delta: bestFaculty ? `${formatDecimal(bestFaculty.averageScore)} балла` : 'нет данных',
      deltaTone: 'positive',
      icon: 'bi bi-trophy-fill',
      tone: 'violet',
    },
    faculties: {
      title: 'Факультетов',
      value: facultySummaries.length.toString(),
      delta: `из ${totalFaculties} доступных`,
      deltaTone: 'neutral',
      icon: 'bi bi-building-fill',
      tone: 'amber',
    },
  }
}

function buildChartModels(facultySummaries, rows, semesters) {
  return {
    bar: {
      labels: facultySummaries.map((faculty) => wrapChartLabel(faculty.compactName)),
      datasets: [
        {
          label: 'Средний балл',
          data: facultySummaries.map((faculty) => faculty.averageScore),
          backgroundColor: '#1f7aec',
          borderRadius: 6,
          yAxisID: 'y',
        },
        {
          label: 'Студентов',
          data: facultySummaries.map((faculty) => faculty.students),
          backgroundColor: '#31b7bc',
          borderRadius: 6,
          yAxisID: 'y1',
        },
      ],
    },
    doughnut: {
      labels: facultySummaries.map((faculty) => faculty.shortName),
      datasets: [
        {
          label: 'Студентов',
          data: facultySummaries.map((faculty) => faculty.students),
          backgroundColor: palette,
          borderColor: '#ffffff',
          borderWidth: 3,
        },
      ],
    },
    line: {
      labels: semesters.map((semester) => `${semester} семестр`),
      datasets: facultySummaries.slice(0, 5).map((faculty, index) => ({
        label: faculty.shortName,
        data: semesters.map((semester) => {
          const match = rows.find((row) => row.facultyId === faculty.id && row.semester === semester)
          return match?.averageScore || null
        }),
        borderColor: palette[index % palette.length],
        backgroundColor: `${palette[index % palette.length]}22`,
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      })),
    },
    scatter: {
      datasets: facultySummaries.map((faculty, index) => ({
        label: faculty.shortName,
        data: [{ x: faculty.students, y: faculty.averageScore }],
        backgroundColor: palette[index % palette.length],
        pointRadius: 7,
        pointHoverRadius: 9,
      })),
    },
    radar: {
      labels: facultySummaries.map((faculty) => faculty.shortName),
      datasets: [
        {
          label: 'Балл, %',
          data: facultySummaries.map((faculty) => faculty.averageScore * 20),
          borderColor: '#1f7aec',
          backgroundColor: '#1f7aec33',
          pointBackgroundColor: '#1f7aec',
        },
        {
          label: 'Динамика, %',
          data: facultySummaries.map((faculty) => Math.max(0, 50 + faculty.trend * 12)),
          borderColor: '#f2b447',
          backgroundColor: '#f2b44733',
          pointBackgroundColor: '#f2b447',
        },
      ],
    },
  }
}

function buildHeatmapRows(rows, faculties, semesters) {
  return faculties
    .filter((faculty) => rows.some((row) => row.facultyId === faculty.facultyId))
    .map((faculty) => ({
      id: faculty.facultyId,
      name: faculty.faculty,
      compactName: getFacultyCompactName(faculty.faculty),
      shortName: getFacultyShortName(faculty.faculty),
      cells: semesters.map((semester) => {
        const match = rows.find((row) => row.facultyId === faculty.facultyId && row.semester === semester)

        return {
          semester,
          value: match ? formatDecimal(match.averageScore) : '',
          color: match ? getHeatColor(match.averageScore) : '#eef2f6',
        }
      }),
    }))
}

function toDetailRow(row) {
  return {
    facultyId: row.facultyId,
    facultyName: row.facultyName,
    compactName: row.compactName,
    shortName: row.shortName,
    semester: row.semester,
    averageScore: row.averageScore,
    studentsCount: row.studentsCount,
    trend: row.trend,
    trendLabel: formatPercent(row.trend),
    trendTone: getTrendTone(row.trend),
    trendIcon: getTrendIcon(row.trend),
    scoreTone: getScoreTone(row.averageScore),
    scoreLabel: getScoreLabel(row.averageScore),
  }
}

function normalizeRange(min, max) {
  const left = Number(min)
  const right = Number(max)
  return left > right ? [right, left] : [left, right]
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
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
