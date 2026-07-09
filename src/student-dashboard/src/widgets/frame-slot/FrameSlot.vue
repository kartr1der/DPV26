<template>
  <article class="frame-slot" :class="[frame.size, { active }]" @click="$emit('select', frame.id)">
    <div class="frame-toolbar">
      <div>
        <h3>{{ frame.title }}</h3>
      </div>
      <div class="frame-controls" data-html2canvas-ignore="true" @click.stop>
        <label>
          <span>Диаграмма</span>
          <select :value="frame.widgetType" @change="patchFrame('widgetType', $event.target.value)">
            <option v-for="type in options.widgetTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </label>
        <label>
          <span>Данные</span>
          <select :value="frame.metric" @change="patchFrame('metric', $event.target.value)">
            <option v-for="metric in options.metricOptions" :key="metric.value" :value="metric.value">
              {{ metric.label }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <div class="frame-body">
      <div v-if="frame.viewModel.kind === 'empty'" class="empty-frame">
        <i class="bi bi-plus-lg"></i>
        <strong>Поле для добавления маленького фрейма</strong>
        <p>{{ frame.viewModel.message }}</p>
      </div>

      <div v-else-if="frame.viewModel.kind === 'kpi'" class="mini-kpi-grid">
        <div v-for="kpi in frame.viewModel.kpis" :key="kpi.title" class="mini-kpi">
          <span class="line-clamp-2">{{ kpi.title }}</span>
          <strong class="line-clamp-2">{{ kpi.value }}</strong>
          <small :class="kpi.deltaTone">{{ kpi.delta }}</small>
        </div>
      </div>

      <div v-else-if="frame.viewModel.kind === 'heatmap'" class="mini-heatmap">
        <div class="mini-heatmap-row head" :style="heatmapGridStyle">
          <span>Институт</span>
          <span v-for="semester in frame.viewModel.semesters" :key="semester"
            >{{ formatColumnLabel(semester) }}</span
          >
        </div>
        <div
          v-for="row in frame.viewModel.rows"
          :key="row.id"
          class="mini-heatmap-row"
          :style="heatmapGridStyle"
        >
          <span>{{ row.shortName }}</span>
          <span
            v-for="cell in row.cells"
            :key="cell.semester"
            class="heat-cell"
            :style="{ backgroundColor: cell.color }"
          >
            {{ cell.value || '—' }}
          </span>
        </div>
      </div>

      <div v-else-if="frame.viewModel.kind === 'table'" class="mini-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Институт</th>
              <th>Семестр</th>
              <th>Балл</th>
              <th>Студентов</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in frame.viewModel.rows.slice(0, 8)"
              :key="`${row.facultyId}-${row.semester}`"
            >
              <td>{{ row.shortName }}</td>
              <td>{{ row.semester }}</td>
              <td>{{ row.averageScore.toFixed(2) }}</td>
              <td>{{ row.studentsCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="frame.viewModel.kind === 'generic-table'" class="mini-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Объект</th>
              <th>Период</th>
              <th>Значение</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in frame.viewModel.rows.slice(0, 8)" :key="`${row.entity}-${row.period}`">
              <td>{{ row.entity }}</td>
              <td>{{ row.period }}</td>
              <td>{{ row.value }}{{ row.unit ? ` ${row.unit}` : '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="frame-chart">
        <BarChart
          v-if="frame.viewModel.chartType === 'bar'"
          :data="frame.viewModel.chartData"
          :options="cartesianOptions(frame.viewModel.axisMode, frame.viewModel.dualAxis)"
        />
        <LineChart
          v-if="frame.viewModel.chartType === 'line'"
          :data="frame.viewModel.chartData"
          :options="cartesianOptions(frame.viewModel.axisMode, false)"
        />
        <DoughnutChart
          v-if="frame.viewModel.chartType === 'doughnut'"
          :data="frame.viewModel.chartData"
          :options="doughnutOptions"
        />
        <ScatterChart
          v-if="frame.viewModel.chartType === 'scatter'"
          :data="frame.viewModel.chartData"
          :options="scatterOptionsForMetric(frame.viewModel.metricName, frame.viewModel.metricLabel)"
        />
        <RadarChart
          v-if="frame.viewModel.chartType === 'radar'"
          :data="frame.viewModel.chartData"
          :options="radarOptions"
        />
      </div>
    </div>
  </article>
</template>

<script>
import {
  Bar as BarChart,
  Doughnut as DoughnutChart,
  Line as LineChart,
  Radar as RadarChart,
  Scatter as ScatterChart,
} from 'vue-chartjs'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js'
import {
  cartesianOptions,
  doughnutOptions,
  radarOptions,
  scatterOptionsForMetric,
} from '../../shared/chart/chartOptions.js'

const doughnutSectorLabelsPlugin = {
  id: 'doughnutSectorLabels',
  afterDatasetsDraw(chart, _args, options) {
    if (!options.enabled || chart.config.type !== 'doughnut') return

    const dataset = chart.data.datasets[0]
    const meta = chart.getDatasetMeta(0)
    if (!dataset || !meta?.data?.length) return

    const total = dataset.data.reduce((sum, value) => sum + Number(value || 0), 0)
    if (!total) return

    const { ctx } = chart
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 11px sans-serif'
    ctx.shadowColor = 'rgba(17, 24, 39, 0.35)'
    ctx.shadowBlur = 4

    meta.data.forEach((arc, index) => {
      const value = Number(dataset.data[index] || 0)
      if (value / total < 0.055) return

      const position = arc.tooltipPosition()
      const label = dataset.valueLabels?.[index] || value.toString()
      ctx.fillText(label, position.x, position.y)
    })

    ctx.restore()
  },
}

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
  doughnutSectorLabelsPlugin,
)

export default {
  name: 'FrameSlot',
  components: {
    BarChart,
    DoughnutChart,
    LineChart,
    RadarChart,
    ScatterChart,
  },
  props: {
    frame: {
      type: Object,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      required: true,
    },
  },
  emits: ['select', 'patch-frame'],
  data() {
    return {
      doughnutOptions,
      radarOptions,
    }
  },
  computed: {
    heatmapGridStyle() {
      const count = this.frame.viewModel.semesters?.length || 1
      return {
        gridTemplateColumns: `minmax(72px, 1fr) repeat(${count}, minmax(52px, 64px))`,
      }
    },
  },
  methods: {
    cartesianOptions,
    scatterOptionsForMetric,
    formatColumnLabel(value) {
      return typeof value === 'number' ? `Сем. ${value}` : value
    },
    patchFrame(key, value) {
      this.$emit('select', this.frame.id)
      this.$emit('patch-frame', {
        frameId: this.frame.id,
        patch: {
          [key]: value,
        },
      })
    },
  },
}
</script>

<style scoped>
.frame-slot {
  min-width: 0;
  min-height: 260px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  border: 2px solid #dbe6f2;
  border-radius: var(--radius-md);
  padding: 12px;
  background: #fff;
  box-shadow: var(--shadow-panel);
  overflow: hidden;
  cursor: pointer;
}

.frame-slot.active {
  border-color: var(--color-accent);
  box-shadow: 0 10px 28px rgba(31, 122, 236, 0.16);
}

.span-3 {
  grid-column: span 3;
}

.span-4 {
  grid-column: span 4;
}

.span-6 {
  grid-column: span 6;
}

.span-8 {
  grid-column: span 8;
}

.span-12 {
  grid-column: span 12;
}

.tall {
  min-height: 330px;
}

.hero {
  min-height: 430px;
}

.frame-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: 8px;
  margin-bottom: 10px;
}

.frame-toolbar > div {
  min-width: 0;
}

.frame-toolbar span {
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.frame-toolbar h3 {
  margin: 2px 0 0;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.frame-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(96px, 1fr));
  gap: 8px;
  max-width: 420px;
  cursor: auto;
}

.frame-controls label {
  display: grid;
  gap: 4px;
}

.frame-controls span {
  color: var(--color-muted);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.frame-controls select {
  min-width: 0;
  width: 100%;
  height: 32px;
  border: 1px solid #ccd8e5;
  border-radius: var(--radius-md);
  padding: 0 8px;
  background: #fff;
  color: var(--color-text);
  font-size: 12px;
  font-weight: 700;
}

.frame-body {
  min-height: 0;
}

.frame-chart {
  height: 100%;
  min-height: 220px;
}

.hero .frame-chart {
  min-height: 360px;
}

.empty-frame {
  min-height: 180px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  border: 2px dashed #cbd9e8;
  border-radius: var(--radius-md);
  color: var(--color-muted);
  text-align: center;
}

.empty-frame i {
  color: var(--color-accent);
  font-size: 54px;
}

.empty-frame strong {
  color: var(--color-text);
}

.empty-frame p {
  max-width: 420px;
  margin: 0;
  font-size: 13px;
}

.mini-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  align-content: center;
  align-items: stretch;
  gap: 10px;
  height: 100%;
  min-height: 84px;
}

.mini-kpi {
  min-height: 84px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: var(--radius-md);
  padding: 14px;
  background: #f6f9fd;
  overflow-wrap: anywhere;
}

.mini-kpi span,
.mini-kpi small {
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 800;
}

.mini-kpi strong {
  margin: 5px 0;
  font-size: 24px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.mini-heatmap {
  display: grid;
  gap: 5px;
  overflow: auto;
}

.mini-heatmap-row {
  display: grid;
  gap: 5px;
}

.mini-heatmap-row span {
  min-height: 32px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  padding: 4px 6px;
  background: #f6f9fd;
  font-size: 11px;
  font-weight: 800;
}

.mini-heatmap-row.head span {
  color: #526174;
  background: var(--color-surface-muted);
}

.mini-table-wrap {
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 420px;
}

th,
td {
  padding: 9px 8px;
  border-bottom: 1px solid #edf1f6;
  font-size: 12px;
  text-align: left;
}

th {
  color: #526174;
  font-weight: 900;
  text-transform: uppercase;
}

.positive {
  color: var(--color-success);
}

.negative {
  color: var(--color-danger);
}

.neutral {
  color: var(--color-muted);
}

@media (max-width: 1180px) {
  .span-3,
  .span-4,
  .span-6,
  .span-8,
  .span-12 {
    grid-column: span 12;
  }
}

@media (max-width: 720px) {
  .frame-toolbar,
  .frame-controls {
    grid-template-columns: 1fr;
  }
}
</style>
