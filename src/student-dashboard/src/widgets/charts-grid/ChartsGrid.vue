<template>
  <section class="chart-grid" aria-label="Графики">
    <article class="panel widget wide">
      <WidgetHeader
        icon="bi bi-bar-chart-fill"
        title="Средний балл и численность"
        subtitle="Столбчатый график по факультетам"
      />
      <div class="chart-box">
        <BarChart :data="charts.bar" :options="cartesianOptions('score')" />
      </div>
    </article>

    <article class="panel widget">
      <WidgetHeader icon="bi bi-pie-chart-fill" title="Доля студентов" subtitle="Круговая структура" />
      <div class="chart-box compact-chart">
        <DoughnutChart :data="charts.doughnut" :options="doughnutOptions" />
      </div>
    </article>

    <article class="panel widget">
      <WidgetHeader icon="bi bi-activity" title="Динамика среднего балла" subtitle="Линейный график" />
      <div class="chart-box compact-chart">
        <LineChart :data="charts.line" :options="cartesianOptions('semester')" />
      </div>
    </article>

    <article class="panel widget">
      <WidgetHeader icon="bi bi-bullseye" title="Балл к численности" subtitle="Точечная диаграмма" />
      <div class="chart-box compact-chart">
        <ScatterChart :data="charts.scatter" :options="scatterOptions" />
      </div>
    </article>

    <article class="panel widget">
      <WidgetHeader icon="bi bi-radar" title="Профиль факультетов" subtitle="Радар по метрикам" />
      <div class="chart-box compact-chart">
        <RadarChart :data="charts.radar" :options="radarOptions" />
      </div>
    </article>
  </section>
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
  scatterOptions,
} from '../../shared/chart/chartOptions.js'
import WidgetHeader from '../../shared/ui/WidgetHeader.vue'

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
)

export default {
  name: 'ChartsGrid',
  components: {
    BarChart,
    DoughnutChart,
    LineChart,
    RadarChart,
    ScatterChart,
    WidgetHeader,
  },
  props: {
    charts: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      doughnutOptions,
      radarOptions,
      scatterOptions,
    }
  },
  methods: {
    cartesianOptions,
  },
}
</script>

<style scoped>
.chart-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.widget {
  min-width: 0;
  padding: 15px;
}

.widget.wide {
  grid-column: span 2;
}

.chart-box {
  height: 310px;
}

.compact-chart {
  height: 250px;
}

@media (max-width: 1180px) {
  .chart-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .widget.wide {
    grid-column: span 2;
  }
}

@media (max-width: 820px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }

  .widget.wide {
    grid-column: span 1;
  }
}
</style>
