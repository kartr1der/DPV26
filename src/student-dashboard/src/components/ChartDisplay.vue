<template>
  <div class="chart-container card shadow-sm">
    <div
      class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
    >
      <h5 class="mb-0">
        <i class="bi bi-bar-chart-fill"></i>
        {{ chartTitle }}
      </h5>
      <span class="badge bg-light text-dark"
        >{{ chartData.labels.length }} {{ getItemsCountText() }}</span
      >
    </div>
    <div class="card-body">
      <div :style="{ height: settings.chartHeight + 'px' }">
        <BarChart v-if="chartType === 'bar'" :data="chartData" :options="chartOptions" />
        <LineChart v-if="chartType === 'line'" :data="chartData" :options="chartOptions" />
        <RadarChart v-if="chartType === 'radar'" :data="chartData" :options="chartOptions" />
      </div>
    </div>
    <div class="card-footer bg-light">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Среднее:</span>
          <span class="stat-value">{{ average.toFixed(2) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Максимум:</span>
          <span class="stat-value text-success">{{ maxScore }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Минимум:</span>
          <span class="stat-value text-danger">{{ minScore }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Студентов:</span>
          <span class="stat-value">{{ totalStudents }}</span>
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
  Legend,
} from 'chart.js'
import colors from '@/assets/colors'

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
  Legend,
)

export default {
  name: 'ChartDisplay',
  components: { BarChart, LineChart, RadarChart },
  props: {
    performance: {
      type: Array,
      required: true,
    },
    faculties: {
      type: Array,
      required: true,
    },
    chartType: {
      type: String,
      default: 'bar',
    },
    settings: {
      type: Object,
      default: () => ({
        fontSize: 14,
        chartHeight: 400,
        color: colors.primary,
      }),
    },
  },
  computed: {
    chartData() {
      const labels = this.performance.map((p) => {
        const faculty = this.faculties.find((f) => f.faculty_id === p.faculty_id)
        return faculty ? faculty.faculty : `Факультет ${p.faculty_id}`
      })

      const scores = this.performance.map((p) => p.average_score)
      const students = this.performance.map((p) => p.students_count)

      return {
        labels: labels,
        datasets: [
          {
            label: 'Средний балл',
            backgroundColor: this.settings.color + '88',
            borderColor: this.settings.color,
            borderWidth: 2,
            data: scores,
            fill: this.chartType === 'radar',
          },
          {
            label: 'Количество студентов',
            backgroundColor: colors.secondary + '66',
            borderColor: colors.secondary,
            borderWidth: 2,
            type: 'bar',
            data: students,
            fill: false,
          },
        ],
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              font: {
                size: this.settings.fontSize,
              },
              color: colors.dark,
            },
          },
          tooltip: {
            backgroundColor: colors.dark,
            titleFont: {
              size: this.settings.fontSize + 2,
            },
            bodyFont: {
              size: this.settings.fontSize,
            },
          },
          title: {
            display: true,
            text: this.chartTitle,
            font: {
              size: this.settings.fontSize + 4,
              weight: 'bold',
            },
            color: colors.dark,
          },
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: this.settings.fontSize - 2,
              },
              color: colors.dark,
            },
            grid: {
              color: 'rgba(0,0,0,0.1)',
            },
          },
          y: {
            ticks: {
              font: {
                size: this.settings.fontSize - 2,
              },
              color: colors.dark,
            },
            grid: {
              color: 'rgba(0,0,0,0.1)',
            },
            beginAtZero: false,
            min: 3.5,
            max: 5.0,
          },
        },
      }
    },
    chartTitle() {
      return 'Успеваемость по факультетам (2024 год)'
    },
    average() {
      const scores = this.performance.map((p) => p.average_score)
      return scores.reduce((a, b) => a + b, 0) / scores.length
    },
    maxScore() {
      return Math.max(...this.performance.map((p) => p.average_score))
    },
    minScore() {
      return Math.min(...this.performance.map((p) => p.average_score))
    },
    totalStudents() {
      return this.performance.reduce((sum, p) => sum + p.students_count, 0)
    },
  },
  methods: {
    getItemsCountText() {
      const count = this.chartData.labels.length
      if (count === 1) return 'факультет'
      if (count >= 2 && count <= 4) return 'факультета'
      return 'факультетов'
    },
  },
}
</script>

<style scoped>
.chart-container {
  border-radius: 8px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  text-align: center;
}
.stat-item {
  padding: 10px;
}
.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
}
.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}
</style>
