<template>
  <DashboardShell>
    <template #sidebar>
      <FiltersSidebar
        :filters="draftFilters"
        :options="viewModel.filterOptions"
        :summary="sidebarSummary"
        @apply="applyFilters"
        @reset="resetFilters"
        @update-filter="updateDraftFilter"
      />
    </template>

    <header class="topbar">
      <div>
        <p class="topbar-date">{{ formattedDate }}</p>
        <h2>Аналитика по факультетам и семестрам</h2>
      </div>
      <ExportActions
        :disabled="viewModel.empty"
        @excel="exportDashboardToExcel(viewModel.detailRows)"
        @pdf="exportDashboardToPdf(viewModel)"
      />
    </header>

    <KpiGrid :items="kpiItems" />
    <ChartsGrid :charts="viewModel.charts" />
    <HeatmapWidget :rows="viewModel.heatmapRows" :semesters="viewModel.filterOptions.semesters" />
    <DetailsTable :rows="viewModel.detailRows" :active-filter-label="activeFilterLabel" />
  </DashboardShell>
</template>

<script>
import { computed } from 'vue'
import { getDashboardDataset } from '../../entities/dashboard/data/getDashboardDataset.js'
import { useDashboardFilters } from '../../features/dashboard-filters/model/useDashboardFilters.js'
import {
  exportDashboardToExcel,
  exportDashboardToPdf,
} from '../../features/export/model/exportDashboard.js'
import ChartsGrid from '../../widgets/charts-grid/ChartsGrid.vue'
import DashboardShell from '../../widgets/dashboard-shell/DashboardShell.vue'
import DetailsTable from '../../widgets/details-table/DetailsTable.vue'
import ExportActions from '../../widgets/export-actions/ExportActions.vue'
import FiltersSidebar from '../../widgets/filters-sidebar/FiltersSidebar.vue'
import HeatmapWidget from '../../widgets/heatmap/HeatmapWidget.vue'
import KpiGrid from '../../widgets/kpi-grid/KpiGrid.vue'
import {
  buildDashboardViewModel,
  createDefaultDashboardFilters,
} from './model/dashboardViewModel.js'

const dataset = getDashboardDataset()
const defaultFilters = createDefaultDashboardFilters(dataset)

export default {
  name: 'DashboardPage',
  components: {
    ChartsGrid,
    DashboardShell,
    DetailsTable,
    ExportActions,
    FiltersSidebar,
    HeatmapWidget,
    KpiGrid,
  },
  setup() {
    const { draftFilters, appliedFilters, applyFilters, resetFilters } =
      useDashboardFilters(defaultFilters)
    const updateDraftFilter = (key, value) => {
      draftFilters[key] = value
    }

    const viewModel = computed(() => buildDashboardViewModel(dataset, appliedFilters))
    const kpiItems = computed(() => Object.values(viewModel.value.kpis))
    const formattedDate = computed(() =>
      new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    )
    const sidebarSummary = computed(() => ({
      rows: viewModel.value.detailRows.length,
      students: viewModel.value.kpis.students.value,
      averageScore: viewModel.value.kpis.averageScore.value,
    }))
    const activeFilterLabel = computed(() => {
      const semester =
        appliedFilters.semester === 'all' ? 'все семестры' : `${appliedFilters.semester} семестр`
      const year = appliedFilters.year === 'all' ? 'все годы' : appliedFilters.year

      return `${semester}, ${year}`
    })

    return {
      activeFilterLabel,
      applyFilters,
      draftFilters,
      exportDashboardToExcel,
      exportDashboardToPdf,
      formattedDate,
      kpiItems,
      resetFilters,
      sidebarSummary,
      updateDraftFilter,
      viewModel,
    }
  },
}
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.topbar-date {
  margin: 0;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

h2 {
  margin: 2px 0 0;
  color: var(--color-text);
  font-size: 25px;
  font-weight: 800;
  letter-spacing: 0;
}

@media (max-width: 820px) {
  .topbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
