<template>
  <div class="dashboard">
    <!-- Шапка сайта -->
    <header class="header">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-md-2">
            <div class="logo">
              <div class="logo-icon" :style="{ backgroundColor: settings.logoColor }">ТИУ</div>
              <div class="logo-text">Аналитика</div>
            </div>
          </div>
          <div class="col-md-6">
          </div>
          <div class="col-md-4 text-end">
            <div class="header-controls d-flex align-items-center justify-content-end gap-2">
              <!-- КНОПКИ ЭКСПОРТА -->
              <button class="btn btn-light btn-sm" @click="exportToCSV" title="Экспорт CSV">
                <i class="bi bi-file-earmark-spreadsheet"></i> CSV
              </button>
              <button class="btn btn-light btn-sm" @click="exportToExcel" title="Экспорт Excel">
                <i class="bi bi-file-earmark-excel"></i> Excel
              </button>
              <button class="btn btn-light btn-sm" @click="exportToPDF" title="Экспорт PDF">
                <i class="bi bi-file-earmark-pdf"></i> PDF
              </button>
              <div class="info-badge">
                <i class="bi bi-calendar"></i>
                {{ new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' }) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- МОДАЛЬНОЕ ОКНО НАСТРОЕК -->
    <div v-if="showSettings" class="settings-modal" @click.self="showSettings = false">
      <div class="settings-modal-content">
        <div class="settings-header">
          <h5><i class="bi bi-palette"></i> Настройки интерфейса</h5>
          <button class="btn-close" @click="showSettings = false"></button>
        </div>
        
        <div class="settings-body">
          <!-- Цветовая схема -->
          <div class="setting-group">
            <h6>Цветовая схема</h6>
            
            <div class="setting-item">
              <label>Основной цвет (шапка):</label>
              <div class="color-picker">
                <input 
                  type="color" 
                  v-model="settings.primaryColor"
                  @change="saveSettings"
                >
                <span>{{ settings.primaryColor }}</span>
              </div>
            </div>

            <div class="setting-item">
              <label>Акцентный цвет (градиент):</label>
              <div class="color-picker">
                <input 
                  type="color" 
                  v-model="settings.accentColor"
                  @change="saveSettings"
                >
                <span>{{ settings.accentColor }}</span>
              </div>
            </div>

            <div class="setting-item">
              <label>Цвет логотипа:</label>
              <div class="color-picker">
                <input 
                  type="color" 
                  v-model="settings.logoColor"
                  @change="saveSettings"
                >
                <span>{{ settings.logoColor }}</span>
              </div>
            </div>

            <div class="setting-item">
              <label>Цвет KPI карточек (рамки):</label>
              <div class="color-picker">
                <input 
                  type="color" 
                  v-model="settings.kpiBorderColor"
                  @change="saveSettings"
                >
                <span>{{ settings.kpiBorderColor }}</span>
              </div>
            </div>
          </div>

          <!-- Типографика -->
          <div class="setting-group">
            <h6>Типографика</h6>
            
            <div class="setting-item">
              <label>Размер шрифта заголовков:</label>
              <input 
                type="range" 
                min="14" 
                max="28" 
                v-model="settings.headingFontSize"
                @change="saveSettings"
              >
              <span>{{ settings.headingFontSize }}px</span>
            </div>

            <div class="setting-item">
              <label>Размер шрифта текста:</label>
              <input 
                type="range" 
                min="12" 
                max="18" 
                v-model="settings.bodyFontSize"
                @change="saveSettings"
              >
              <span>{{ settings.bodyFontSize }}px</span>
            </div>
          </div>

          <!-- Дополнительные настройки -->
          <div class="setting-group">
            <h6>Отображение</h6>
            
            <div class="setting-item">
              <label>
                <input 
                  type="checkbox" 
                  v-model="settings.showGrid"
                  @change="saveSettings"
                >
                Показывать сетку на графиках
              </label>
            </div>

            <div class="setting-item">
              <label>
                <input 
                  type="checkbox" 
                  v-model="settings.animations"
                  @change="saveSettings"
                >
                Анимация элементов
              </label>
            </div>
          </div>
        </div>

        <div class="settings-footer">
          <button class="btn btn-secondary me-2" @click="resetSettings">
            <i class="bi bi-arrow-counterclockwise"></i> Сбросить
          </button>
          <button class="btn btn-primary" @click="showSettings = false">
            <i class="bi bi-check-lg"></i> Закрыть
          </button>
        </div>
      </div>
    </div>

    <div class="container-fluid py-4" :style="{ fontSize: settings.bodyFontSize + 'px' }">
      <div class="row">
        <!-- ЛЕВАЯ ПАНЕЛЬ: Фильтры -->
        <div class="col-md-3">
          <div class="filter-panel card shadow-sm mb-4">
            <div class="card-header d-flex justify-content-between align-items-center text-white" 
                 :style="{ backgroundColor: settings.primaryColor }">
              <h5 class="mb-0" :style="{ fontSize: settings.headingFontSize - 2 + 'px' }">
                <i class="bi bi-funnel"></i> Фильтры
              </h5>
              <!-- КНОПКА НАСТРОЕК -->
              <button class="btn btn-link text-white p-0" @click="showSettings = true" title="Настройки">
                <i class="bi bi-gear-fill" style="font-size: 1.2rem;"></i>
              </button>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label fw-bold">Факультет:</label>
                <select v-model="selectedFaculty" class="form-select">
                  <option value="all">Все факультеты</option>
                  <option 
                    v-for="faculty in faculties" 
                    :key="faculty.faculty_id"
                    :value="faculty.faculty_id"
                  >
                    {{ faculty.faculty }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Семестр:</label>
                <div class="btn-group w-100">
                  <button 
                    class="btn btn-sm" 
                    :class="selectedSemester === 'all' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="selectedSemester = 'all'"
                  >
                    Все
                  </button>
                  <button 
                    v-for="sem in availableSemesters"
                    :key="sem"
                    class="btn btn-sm"
                    :class="selectedSemester === sem ? 'btn-primary' : 'btn-outline-primary'"
                    @click="selectedSemester = sem"
                  >
                    {{ sem }} семестр
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Тип диаграммы:</label>
                <select v-model="chartType" class="form-select">
                  <option value="bar">Столбчатая</option>
                  <option value="line">Линейная</option>
                  <option value="radar">Радар</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Статистика -->
          <div class="stats-panel card shadow-sm">
            <div class="card-header text-white" :style="{ backgroundColor: settings.accentColor }">
              <h6 class="mb-0"><i class="bi bi-info-circle"></i> Статистика</h6>
            </div>
            <div class="card-body">
              <ul class="stats-list">
                <li><strong>Всего факультетов:</strong> {{ faculties.length }}</li>
                <li><strong>Всего студентов:</strong> {{ totalStudents }}</li>
                <li><strong>Средний балл:</strong> {{ averageScore.toFixed(2) }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- ПРАВАЯ ЧАСТЬ: Дашборд -->
        <div class="col-md-9">
          <!-- КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ -->
          <div class="row mb-4">
            <div class="col-md-4 mb-3">
              <div class="kpi-card card shadow-sm h-100" 
                   :style="{ borderLeft: `4px solid ${settings.kpiBorderColor}` }">
                <div class="card-body text-center d-flex flex-column justify-content-center">
                  <h6 class="text-muted mb-2">Средний балл</h6>
                  <h2 class="mb-2" :style="{ color: settings.kpiBorderColor, fontSize: settings.headingFontSize + 10 + 'px' }">
                    {{ averageScore.toFixed(2) }}
                  </h2>
                  <small :class="scoreTrend !== null ? (scoreTrend >= 0 ? 'text-success' : 'text-danger') : 'text-muted'">
                    <i v-if="scoreTrend !== null" :class="scoreTrend >= 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                    <span v-if="scoreTrend !== null">{{ Math.abs(scoreTrend) }}% к прошлому семестру</span>
                    <span v-else>—</span>
                  </small>
                </div>
              </div>
            </div>
            
            <div class="col-md-4 mb-3">
              <div class="kpi-card card shadow-sm h-100 border-success">
                <div class="card-body text-center d-flex flex-column justify-content-center">
                  <h6 class="text-muted mb-2">Всего студентов</h6>
                  <h2 class="text-success mb-2" :style="{ fontSize: settings.headingFontSize + 10 + 'px' }">
                    {{ totalStudents }}
                  </h2>
                  <small class="text-muted">на всех факультетах</small>
                </div>
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <div class="kpi-card card shadow-sm h-100 border-warning">
                <div class="card-body text-center d-flex flex-column justify-content-center">
                  <h6 class="text-muted mb-2">Лучший факультет</h6>
                  <h5 class="text-warning mb-2">{{ bestFaculty }}</h5>
                  <small class="text-muted">{{ bestFacultyScore }} балл</small>
                </div>
              </div>
            </div>
          </div>

          <!-- ГРАФИКИ ПО СЕМЕСТРАМ -->
          <div class="row mb-4" v-if="selectedSemester === 'all'">
            <div class="col-12">
              <div class="card shadow-sm">
                <div class="card-header text-white" :style="{ backgroundColor: settings.primaryColor }">
                  <h5 class="mb-0" :style="{ fontSize: settings.headingFontSize + 'px' }">
                    <i class="bi bi-bar-chart-fill"></i> 
                    Успеваемость по семестрам (2024 год)
                  </h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div 
                      v-for="semester in availableSemesters" 
                      :key="semester"
                      :class="`col-md-${12 / availableSemesters.length} mb-4`"
                    >
                      <h6 class="text-center mb-3">{{ semester }} семестр</h6>
                      <div style="height: 300px;">
                        <BarChart 
                          v-if="chartType === 'bar'" 
                          :data="getSemesterData(semester)" 
                          :options="getChartOptions()" 
                        />
                        <LineChart 
                          v-if="chartType === 'line'" 
                          :data="getSemesterData(semester)" 
                          :options="getChartOptions()" 
                        />
                        <RadarChart 
                          v-if="chartType === 'radar'" 
                          :data="getRadarData(semester)" 
                          :options="getRadarOptions()" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- График для конкретного выбранного семестра -->
          <div class="row mb-4" v-if="selectedSemester !== 'all'">
            <div class="col-12">
              <div class="card shadow-sm">
                <div class="card-header text-white" :style="{ backgroundColor: settings.primaryColor }">
                  <h5 class="mb-0" :style="{ fontSize: settings.headingFontSize + 'px' }">
                    <i class="bi bi-bar-chart-fill"></i> 
                    Успеваемость ({{ selectedSemester }} семестр, 2024 год)
                  </h5>
                </div>
                <div class="card-body">
                  <div style="height: 400px;">
                    <BarChart 
                      v-if="chartType === 'bar'" 
                      :data="getSemesterData(selectedSemester)" 
                      :options="getChartOptions()" 
                    />
                    <LineChart 
                      v-if="chartType === 'line'" 
                      :data="getSemesterData(selectedSemester)" 
                      :options="getChartOptions()" 
                    />
                    <RadarChart 
                      v-if="chartType === 'radar'" 
                      :data="getRadarData(selectedSemester)" 
                      :options="getRadarOptions()" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ДЕТАЛЬНАЯ ИНФОРМАЦИЯ -->
          <div class="row">
            <div class="col-12">
              <div class="card shadow-sm">
                <div class="card-header text-white" :style="{ backgroundColor: '#6c757d' }">
                  <h5 class="mb-0" :style="{ fontSize: settings.headingFontSize + 'px' }">
                    <i class="bi bi-table"></i> 
                    Детальная информация по факультетам
                  </h5>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-striped table-hover">
                      <thead class="table-primary">
                        <tr>
                          <th>Факультет</th>
                          <th>Семестр</th>
                          <th>Средний балл</th>
                          <th>Студентов</th>
                          <th>Динамика</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in detailedData" :key="index">
                          <td class="faculty-name">{{ item.facultyName }}</td>
                          <td>{{ item.semester }}</td>
                          <td>
                            <span class="badge" :class="getScoreBadge(item.averageScore)">
                              {{ item.averageScore.toFixed(2) }}
                            </span>
                          </td>
                          <td>{{ item.studentsCount }}</td>
                          <td>
                            <span v-if="item.trend > 0" class="text-success">
                              <i class="bi bi-arrow-up"></i> {{ item.trend.toFixed(1) }}%
                            </span>
                            <span v-else-if="item.trend < 0" class="text-danger">
                              <i class="bi bi-arrow-down"></i> {{ Math.abs(item.trend).toFixed(1) }}%
                            </span>
                            <span v-else class="text-muted">—</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Bar as BarChart, Line as LineChart, Radar as RadarChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import sampleData from '@/assets/sample_data.json'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'DashboardV',
  components: { BarChart, LineChart, RadarChart },
  data() {
    return {
      faculties: sampleData.faculties,
      users: sampleData.users,
      performance: sampleData.performance,
      selectedFaculty: 'all',
      selectedSemester: 'all',
      chartType: 'bar',
      showSettings: false,
      
      // НАСТРОЙКИ ИНТЕРФЕЙСА
      settings: {
        primaryColor: localStorage.getItem('dashboard_primaryColor') || '#003366',
        accentColor: localStorage.getItem('dashboard_accentColor') || '#0066CC',
        logoColor: localStorage.getItem('dashboard_logoColor') || '#00BCD4',
        kpiBorderColor: localStorage.getItem('dashboard_kpiBorderColor') || '#003366',
        headingFontSize: parseInt(localStorage.getItem('dashboard_headingFontSize')) || 18,
        bodyFontSize: parseInt(localStorage.getItem('dashboard_bodyFontSize')) || 14,
        showGrid: localStorage.getItem('dashboard_showGrid') !== 'false',
        animations: localStorage.getItem('dashboard_animations') !== 'false'
      }
    }
  },
  computed: {
    availableSemesters() {
      const semesters = [...new Set(this.performance.map(p => p.semester))]
      return semesters.sort((a, b) => a - b)
    },

    filteredPerformance() {
      let result = [...this.performance]
      
      if (this.selectedFaculty !== 'all') {
        result = result.filter(p => p.faculty_id === parseInt(this.selectedFaculty))
      }
      
      if (this.selectedSemester !== 'all') {
        result = result.filter(p => p.semester === this.selectedSemester)
      }
      
      return result
    },

    averageScore() {
      const scores = this.filteredPerformance.map(p => p.average_score)
      return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    },

    totalStudents() {
      return this.filteredPerformance.reduce((sum, p) => sum + p.students_count, 0)
    },

    bestFaculty() {
      if (this.filteredPerformance.length === 0) return '—'
      const best = this.filteredPerformance.reduce((max, p) => 
        p.average_score > max.average_score ? p : max
      )
      const faculty = this.faculties.find(f => f.faculty_id === best.faculty_id)
      return faculty ? faculty.faculty.split(' ')[0] : '—'
    },

    bestFacultyScore() {
      if (this.filteredPerformance.length === 0) return 0
      const best = this.filteredPerformance.reduce((max, p) => 
        p.average_score > max.average_score ? p : max
      )
      return best.average_score.toFixed(2)
    },

    scoreTrend() {
      // Если выбран "Все" — сравниваем 1 и 2 семестр
      if (this.selectedSemester === 'all') {
        const sem1 = this.filteredPerformance.filter(p => p.semester === 1)
        const sem2 = this.filteredPerformance.filter(p => p.semester === 2)
        
        if (sem1.length === 0 || sem2.length === 0) return 0
        
        const avg1 = sem1.reduce((sum, p) => sum + p.average_score, 0) / sem1.length
        const avg2 = sem2.reduce((sum, p) => sum + p.average_score, 0) / sem2.length
        
        return ((avg2 - avg1) / avg1 * 100).toFixed(1)
      }
      
      // Если выбран 1 семестр — не с чем сравнивать
      if (this.selectedSemester === 1) {
        return null
      }
      
      // Если выбран 2 семестр — сравниваем с 1 семестром
      if (this.selectedSemester === 2) {
        // Получаем данные с учетом выбранного факультета, но ВСЕХ семестров
        let baseData = [...this.performance]
        
        if (this.selectedFaculty !== 'all') {
          baseData = baseData.filter(p => p.faculty_id === parseInt(this.selectedFaculty))
        }
        
        const sem1 = baseData.filter(p => p.semester === 1)
        const sem2 = baseData.filter(p => p.semester === 2)
        
        if (sem1.length === 0 || sem2.length === 0) return 0
        
        const avg1 = sem1.reduce((sum, p) => sum + p.average_score, 0) / sem1.length
        const avg2 = sem2.reduce((sum, p) => sum + p.average_score, 0) / sem2.length
        
        return ((avg2 - avg1) / avg1 * 100).toFixed(1)
      }
      
      return 0
    },

    detailedData() {
      return this.filteredPerformance.map(p => {
        const faculty = this.faculties.find(f => f.faculty_id === p.faculty_id)
        const prevSemester = this.performance.find(prev => 
          prev.faculty_id === p.faculty_id && 
          prev.semester !== p.semester &&
          prev.year === p.year
        )
        
        const trend = prevSemester 
          ? ((p.average_score - prevSemester.average_score) / prevSemester.average_score * 100)
          : 0
        
        return {
          facultyName: faculty ? faculty.faculty : `Факультет ${p.faculty_id}`,
          semester: p.semester,
          averageScore: p.average_score,
          studentsCount: p.students_count,
          trend: trend
        }
      })
    }
  },
  methods: {
    saveSettings() {
      localStorage.setItem('dashboard_primaryColor', this.settings.primaryColor)
      localStorage.setItem('dashboard_accentColor', this.settings.accentColor)
      localStorage.setItem('dashboard_logoColor', this.settings.logoColor)
      localStorage.setItem('dashboard_kpiBorderColor', this.settings.kpiBorderColor)
      localStorage.setItem('dashboard_headingFontSize', this.settings.headingFontSize)
      localStorage.setItem('dashboard_bodyFontSize', this.settings.bodyFontSize)
      localStorage.setItem('dashboard_showGrid', this.settings.showGrid)
      localStorage.setItem('dashboard_animations', this.settings.animations)
    },

    resetSettings() {
      if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
        localStorage.clear()
        this.settings = {
          primaryColor: '#003366',
          accentColor: '#0066CC',
          logoColor: '#00BCD4',
          kpiBorderColor: '#003366',
          headingFontSize: 18,
          bodyFontSize: 14,
          showGrid: true,
          animations: true
        }
      }
    },

    // ЭКСПОРТ В CSV
    exportToCSV() {
      const data = this.detailedData
      const headers = ['Факультет', 'Семестр', 'Средний балл', 'Студентов', 'Динамика (%)']
      
      const csvContent = [
        headers.join(';'),
        ...data.map(row => [
          row.facultyName,
          row.semester,
          row.averageScore.toFixed(2),
          row.studentsCount,
          row.trend.toFixed(1)
        ].join(';'))
      ].join('\n')
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `успеваемость_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    // ЭКСПОРТ В EXCEL
    exportToExcel() {
      const data = this.detailedData
      const worksheetData = [
        ['Факультет', 'Семестр', 'Средний балл', 'Студентов', 'Динамика (%)'],
        ...data.map(row => [
          row.facultyName,
          row.semester,
          row.averageScore.toFixed(2),
          row.studentsCount,
          row.trend.toFixed(1)
        ])
      ]
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Успеваемость')
      
      XLSX.writeFile(workbook, `успеваемость_${new Date().toISOString().split('T')[0]}.xlsx`)
    },

    // ЭКСПОРТ В PDF (с поддержкой кириллицы)
async exportToPDF() {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })
  
  try {
    // Загружаем шрифт Roboto с поддержкой кириллицы
    const font = await this.loadFont()
    if (font) {
      doc.addFileToVFS('Roboto-Regular.ttf', font)
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
      doc.setFont('Roboto')
    }
  } catch (error) {
    console.error('Ошибка загрузки шрифта:', error)
    // Если шрифт не загрузился, используем стандартный
    doc.setFont('helvetica')
  }
  
  // Заголовок
  doc.setFontSize(16)
  doc.text('Otchet po uspevaemosti studentov TIU', 14, 20)
  
  doc.setFontSize(11)
  doc.text(`Data formirovaniya: ${new Date().toLocaleDateString('ru-RU')}`, 14, 30)
  
  // KPI
  doc.setFontSize(13)
  doc.text('Klyuchevye pokazateli:', 14, 42)
  doc.setFontSize(10)
  doc.text(`Sredniy ball: ${this.averageScore.toFixed(2)}`, 14, 50)
  doc.text(`Vsego studentov: ${this.totalStudents}`, 70, 50)
  doc.text(`Luchshiy fakultet: ${this.bestFaculty} (${this.bestFacultyScore} ball)`, 130, 50)
  
  // Таблица - используем транслитерацию для названий
  const tableData = this.detailedData.map(row => [
    this.transliterate(row.facultyName), // Транслитерация названий
    row.semester.toString(),
    row.averageScore.toFixed(2),
    row.studentsCount.toString(),
    row.trend.toFixed(1) + '%'
  ])
  
  autoTable(doc, {
    startY: 55,
    head: [['Fakultet', 'Semestr', 'Ball', 'Studentov', 'Dinamika']],
    body: tableData,
    styles: { 
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      valign: 'middle',
      font: 'helvetica' // Используем шрифт с поддержкой латиницы
    },
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 30, halign: 'center' }
    },
    margin: { top: 55, left: 14, right: 14 }
  })
  
  doc.save(`uspevaemost_${new Date().toISOString().split('T')[0]}.pdf`)
},

// Метод для загрузки шрифта
async loadFont() {
  try {
    // Используем шрифт Roboto из CDN
    const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf')
    const blob = await response.blob()
    return await this.blobToBase64(blob)
  } catch (error) {
    console.error('Не удалось загрузить шрифт:', error)
    return null
  }
},

// Конвертация blob в base64
blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
},

// Транслитерация русских букв в латиницу
transliterate(text) {
  const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  }
  
  return text.split('').map(char => translitMap[char] || char).join('')
},

    getSemesterData(semester) {
      const filtered = this.filteredPerformance.filter(p => p.semester === semester)
      return this.createChartData(filtered, `${semester} семестр`)
    },

    getRadarData(semester) {
      const filtered = this.filteredPerformance.filter(p => p.semester === semester)
      
      const labels = filtered.map(p => {
        const faculty = this.faculties.find(f => f.faculty_id === p.faculty_id)
        return faculty ? faculty.faculty : `Факультет ${p.faculty_id}`
      })
      
      const scores = filtered.map(p => p.average_score * 20)
      const students = filtered.map(p => p.students_count)
      
      return {
        labels: labels,
        datasets: [
          {
            label: 'Средний балл (×20)',
            data: scores,
            borderColor: this.settings.primaryColor,
            backgroundColor: this.settings.primaryColor + '33',
            borderWidth: 2,
            pointBackgroundColor: this.settings.primaryColor,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: this.settings.primaryColor
          },
          {
            label: 'Количество студентов',
            data: students,
            borderColor: this.settings.accentColor,
            backgroundColor: this.settings.accentColor + '33',
            borderWidth: 2,
            pointBackgroundColor: this.settings.accentColor,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: this.settings.accentColor
          }
        ]
      }
    },

    createChartData(performanceData) {
      const labels = performanceData.map(p => {
        const faculty = this.faculties.find(f => f.faculty_id === p.faculty_id)
        return faculty ? faculty.faculty : `Факультет ${p.faculty_id}`
      })
      
      const scores = performanceData.map(p => p.average_score)
      const students = performanceData.map(p => p.students_count)
      
      return {
        labels: labels,
        datasets: [
          {
            label: 'Средний балл',
            backgroundColor: this.settings.primaryColor + '88',
            borderColor: this.settings.primaryColor,
            borderWidth: 2,
            data: scores,
            fill: true
          },
          {
            label: 'Количество студентов',
            backgroundColor: this.settings.accentColor + '66',
            borderColor: this.settings.accentColor,
            borderWidth: 2,
            data: students,
            type: 'bar',
            yAxisID: 'y1'
          }
        ]
      }
    },

    getChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: Math.max(10, this.settings.bodyFontSize - 2) },
              color: '#333'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 12 },
            bodyFont: { size: 11 },
            padding: 8,
            displayColors: true,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(2);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              font: { size: Math.max(9, this.settings.bodyFontSize - 4) },
              maxRotation: 45,
              minRotation: 45,
              // ПЕРЕНОС ДЛИННЫХ НАЗВАНИЙ
              callback: function(value) {
                const label = this.getLabelForValue(value);
                if (label.length > 20) {
                  const words = label.split(' ');
                  if (words.length > 2) {
                    const mid = Math.ceil(words.length / 2);
                    const firstLine = words.slice(0, mid).join(' ');
                    const secondLine = words.slice(mid).join(' ');
                    return [firstLine, secondLine];
                  }
                }
                return label;
              }
            },
            grid: { 
              color: this.settings.showGrid ? 'rgba(0,0,0,0.1)' : 'transparent'
            }
          },
          y: {
            beginAtZero: false,
            min: 3.5,
            max: 5.0,
            ticks: { 
              font: { size: Math.max(9, this.settings.bodyFontSize - 4) },
              callback: (value) => value.toFixed(1)
            },
            grid: { 
              color: this.settings.showGrid ? 'rgba(0,0,0,0.1)' : 'transparent'
            }
          }
        }
      }
    },

    getRadarOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: Math.max(10, this.settings.bodyFontSize - 2) },
              color: '#333'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 12 },
            bodyFont: { size: 11 },
            padding: 8,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.r !== null) {
                  label += context.parsed.r.toFixed(2);
                }
                return label;
              }
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 120,
            ticks: {
              stepSize: 20,
              font: { size: Math.max(9, this.settings.bodyFontSize - 4) },
              backdropColor: 'transparent'
            },
            grid: {
              color: this.settings.showGrid ? 'rgba(0,0,0,0.1)' : 'transparent'
            },
            pointLabels: {
              font: { size: Math.max(9, this.settings.bodyFontSize - 4) },
              callback: function(label) {
                if (label && label.length > 15) {
                  const words = label.split(' ');
                  if (words.length > 2) {
                    const mid = Math.ceil(words.length / 2);
                    const firstLine = words.slice(0, mid).join(' ');
                    const secondLine = words.slice(mid).join(' ');
                    return [firstLine, secondLine];
                  }
                }
                return label;
              }
            }
          }
        }
      }
    },

    getScoreBadge(score) {
      if (score >= 4.2) return 'bg-success'
      if (score >= 4.0) return 'bg-primary'
      if (score >= 3.8) return 'bg-warning text-dark'
      return 'bg-danger'
    }
  }
}
</script>

<style scoped>
.dashboard {
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Шапка */
.header {
  background: linear-gradient(135deg, v-bind('settings.primaryColor') 0%, v-bind('settings.accentColor') 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  color: white;
  font-size: 2rem;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
}

.header-controls {
  gap: 10px;
}

.info-badge {
  background-color: rgba(255,255,255,0.2);
  padding: 10px 20px;
  border-radius: 20px;
  display: inline-block;
}

/* МОДАЛЬНОЕ ОКНО НАСТРОЕК */
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.settings-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.settings-header h5 {
  margin: 0;
  color: #333;
}

.settings-body {
  padding: 20px;
}

.setting-group {
  margin-bottom: 25px;
}

.setting-group h6 {
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.setting-item {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-item label {
  font-weight: 500;
  color: #555;
  margin: 0;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-picker input[type="color"] {
  width: 50px;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
}

.color-picker span {
  font-family: monospace;
  color: #666;
}

.setting-item input[type="range"] {
  width: 150px;
}

.setting-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.settings-footer {
  padding: 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Панели */
.filter-panel, .stats-panel {
  border-radius: 8px;
}

.stats-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stats-list li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.stats-list li:last-child {
  border-bottom: none;
}

.stats-list strong {
  color: #003366;
}

/* KPI Cards */
.kpi-card {
  transition: transform 0.3s;
  min-height: 150px;
}

.kpi-card:hover {
  transform: translateY(-5px);
}

/* Таблица */
.table th {
  font-weight: 600;
  white-space: nowrap;
}

.badge {
  padding: 6px 12px;
  font-size: 0.9rem;
}

/* КОМПАКТНЫЕ НАЗВАНИЯ ФАКУЛЬТЕТОВ */
.faculty-name {
  max-width: 250px;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.3;
  display: table-cell;
  vertical-align: middle;
}
.chart-compact-label {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: 1.2;
}
</style>
