export const dashboardTemplates = [
  {
    id: 'overview',
    name: 'Обзорный',
    description: 'KPI сверху, большой график и аналитические фреймы ниже.',
    columns: 12,
    frames: [
      createFrame('overview-kpi', 'Ключевые показатели', 'kpi', 'span-12', 'summary'),
      createFrame('overview-main', 'Средний балл и численность', 'bar', 'span-6 tall', 'averageScore'),
      createFrame('overview-share', 'Доля студентов', 'doughnut', 'span-3 tall', 'students'),
      createFrame('overview-trend', 'Динамика среднего балла', 'line', 'span-3 tall', 'averageScore'),
      createFrame('overview-scatter', 'Балл к численности', 'scatter', 'span-3', 'averageScore'),
      createFrame('overview-radar', 'Профиль факультетов', 'radar', 'span-3', 'averageScore'),
      createFrame('overview-add', 'Добавить фрейм', 'empty', 'span-6', 'summary'),
      createFrame('overview-heatmap', 'Тепловая карта', 'heatmap', 'span-12', 'averageScore'),
    ],
  },
  {
    id: 'comparison',
    name: 'Сравнение',
    description: 'Равномерная сетка для сравнения нескольких факультетов.',
    columns: 12,
    frames: [
      createFrame('comparison-kpi', 'Сводка сравнения', 'kpi', 'span-12', 'summary'),
      createFrame('comparison-bar', 'Средний балл', 'bar', 'span-4 tall', 'averageScore'),
      createFrame('comparison-line', 'Динамика', 'line', 'span-4 tall', 'averageScore'),
      createFrame('comparison-scatter', 'Балл и численность', 'scatter', 'span-4 tall', 'students'),
      createFrame('comparison-radar', 'Профиль', 'radar', 'span-6', 'averageScore'),
      createFrame('comparison-table', 'Данные сравнения', 'table', 'span-6', 'summary'),
    ],
  },
  {
    id: 'presentation',
    name: 'Презентационный',
    description: 'Крупный главный фрейм и компактные supporting-фреймы справа.',
    columns: 12,
    frames: [
      createFrame('presentation-main', 'Главный график', 'bar', 'span-8 hero', 'averageScore'),
      createFrame('presentation-kpi', 'KPI', 'kpi', 'span-4', 'summary'),
      createFrame('presentation-share', 'Доля студентов', 'doughnut', 'span-4', 'students'),
      createFrame('presentation-radar', 'Профиль', 'radar', 'span-4', 'averageScore'),
      createFrame('presentation-heatmap', 'Тепловая карта', 'heatmap', 'span-8', 'averageScore'),
      createFrame('presentation-table', 'Детали', 'table', 'span-12', 'summary'),
    ],
  },
]

function createFrame(id, title, widgetType, size, metric) {
  return {
    id,
    title,
    widgetType,
    size,
    metric,
    groupBy: 'faculty',
    facultyIds: [],
  }
}
