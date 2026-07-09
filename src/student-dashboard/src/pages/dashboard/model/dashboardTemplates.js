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
      createFrame('overview-radar', 'Профиль институтов', 'radar', 'span-3', 'averageScore'),
      createFrame('overview-add', 'Добавить фрейм', 'empty', 'span-6', 'summary'),
      createFrame('overview-heatmap', 'Тепловая карта', 'heatmap', 'span-12', 'averageScore'),
    ],
  },
  {
    id: 'comparison',
    name: 'Сравнение',
    description: 'Равномерная сетка для сравнения нескольких институтов.',
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
  {
    id: 'education',
    name: 'Образовательная деятельность',
    description: 'Выпускники и отчисления — автоматически активируется при загрузке датасета категории «education».',
    columns: 12,
    frames: [
      createFrame('education-kpi-graduates', 'Выпускники', 'kpi', 'span-3', 'generic:education:graduates'),
      createFrame('education-kpi-dropout', 'Отчисления', 'kpi', 'span-3', 'generic:education:dropout'),
      createFrame('education-bar', 'Выпускники по институтам', 'bar', 'span-6 tall', 'generic:education:graduates'),
      createFrame('education-line', 'Динамика отчислений', 'line', 'span-6 tall', 'generic:education:dropout'),
      createFrame('education-doughnut', 'Доля выпускников', 'doughnut', 'span-4', 'generic:education:graduates'),
      createFrame('education-radar', 'Профиль отчислений', 'radar', 'span-4', 'generic:education:dropout'),
      createFrame('education-heatmap', 'Выпускники по годам', 'heatmap', 'span-4', 'generic:education:graduates'),
      createFrame('education-table', 'Детализация', 'table', 'span-12', 'generic:education:dropout'),
    ],
  },
  {
    id: 'science',
    name: 'Научная деятельность',
    description: 'Публикации, цитирования, гранты, индекс Хирша — автоматически активируется при загрузке датасета категории «science».',
    columns: 12,
    frames: [
      createFrame('science-kpi-publications', 'Публикации', 'kpi', 'span-3', 'generic:science:publications'),
      createFrame('science-kpi-citations', 'Цитирования', 'kpi', 'span-3', 'generic:science:citations'),
      createFrame('science-kpi-grants', 'Объём грантов', 'kpi', 'span-3', 'generic:science:grants'),
      createFrame('science-kpi-hindex', 'Индекс Хирша', 'kpi', 'span-3', 'generic:science:h_index_avg'),
      createFrame('science-bar', 'Публикации по институтам', 'bar', 'span-6 tall', 'generic:science:publications'),
      createFrame('science-line', 'Динамика грантов', 'line', 'span-6 tall', 'generic:science:grants'),
      createFrame('science-doughnut', 'Доля цитирований', 'doughnut', 'span-4', 'generic:science:citations'),
      createFrame('science-radar', 'Профиль по индексу Хирша', 'radar', 'span-4', 'generic:science:h_index_avg'),
      createFrame('science-heatmap', 'Гранты по годам', 'heatmap', 'span-4', 'generic:science:grants'),
      createFrame('science-table', 'Детализация публикаций', 'table', 'span-12', 'generic:science:publications'),
    ],
  },
  {
    id: 'finance',
    name: 'Финансово-экономические показатели',
    description: 'Бюджет и доходы от платных услуг — автоматически активируется при загрузке датасета категории «finance».',
    columns: 12,
    frames: [
      createFrame('finance-kpi-budget', 'Бюджетное финансирование', 'kpi', 'span-3', 'generic:finance:budget_funding'),
      createFrame('finance-kpi-income', 'Доходы от платных услуг', 'kpi', 'span-3', 'generic:finance:paid_services_income'),
      createFrame('finance-bar', 'Финансирование по институтам', 'bar', 'span-6 tall', 'generic:finance:budget_funding'),
      createFrame('finance-line', 'Динамика доходов', 'line', 'span-6 tall', 'generic:finance:paid_services_income'),
      createFrame('finance-doughnut', 'Доля доходов от услуг', 'doughnut', 'span-4', 'generic:finance:paid_services_income'),
      createFrame('finance-radar', 'Профиль финансирования', 'radar', 'span-4', 'generic:finance:budget_funding'),
      createFrame('finance-heatmap', 'Финансирование по годам', 'heatmap', 'span-4', 'generic:finance:budget_funding'),
      createFrame('finance-table', 'Детализация', 'table', 'span-12', 'generic:finance:paid_services_income'),
    ],
  },
  {
    id: 'international',
    name: 'Международная деятельность',
    description: 'Иностранные студенты и академическая мобильность — автоматически активируется при загрузке датасета категории «international».',
    columns: 12,
    frames: [
      createFrame('intl-kpi-foreign', 'Иностранные студенты', 'kpi', 'span-3', 'generic:international:foreign_students'),
      createFrame('intl-kpi-mobility', 'Академическая мобильность', 'kpi', 'span-3', 'generic:international:mobility'),
      createFrame('intl-bar', 'Иностранные студенты по институтам', 'bar', 'span-6 tall', 'generic:international:foreign_students'),
      createFrame('intl-line', 'Динамика мобильности', 'line', 'span-6 tall', 'generic:international:mobility'),
      createFrame('intl-doughnut', 'Доля иностранных студентов', 'doughnut', 'span-4', 'generic:international:foreign_students'),
      createFrame('intl-radar', 'Профиль мобильности', 'radar', 'span-4', 'generic:international:mobility'),
      createFrame('intl-heatmap', 'Мобильность по годам', 'heatmap', 'span-4', 'generic:international:mobility'),
      createFrame('intl-table', 'Детализация', 'table', 'span-12', 'generic:international:foreign_students'),
    ],
  },
]

// Категория показателей из загруженного датасета -> id шаблона, который нужно
// активировать автоматически (см. DataUploader.vue + DashboardPage.vue).
export const categoryTemplateMap = {
  education: 'education',
  science: 'science',
  finance: 'finance',
  international: 'international',
}

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
