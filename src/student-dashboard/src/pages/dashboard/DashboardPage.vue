<template>
  <DashboardShell>
    <template #sidebar>
      <aside class="builder-sidebar" aria-label="Панель конструктора">
        <TemplateSelector
          :templates="templates"
          :active-template-id="builderConfig.templateId"
          @select-template="selectTemplate"
        />
        <FiltersSidebar
          :filters="draftFilters"
          :options="viewModel.filterOptions"
          :summary="sidebarSummary"
          @apply="applyFilters"
          @reset="resetFilters"
          @update-filter="updateDraftFilter"
        />
        <FrameInspector
          :frame="builderViewModel.activeFrame"
          :options="builderViewModel.inspectorOptions"
          @patch-frame="patchActiveFrame"
        />
      </aside>
    </template>

    <DashboardCanvas
      ref="dashboardCanvas"
      :template="builderViewModel.template"
      :frames="builderViewModel.frames"
      :options="builderViewModel.inspectorOptions"
      :active-frame-id="builderConfig.activeFrameId"
      @select-frame="selectFrame"
      @patch-frame="patchFrame"
    >
      <template #actions>
        <ExportActions
          :disabled="viewModel.empty"
          @excel="exportDashboardToExcel(viewModel.detailRows)"
          @pdf="exportDashboardToPdf(canvasElement)"
        />
      </template>
    </DashboardCanvas>
    <DetailsTable :rows="viewModel.detailRows" :active-filter-label="activeFilterLabel" />
  </DashboardShell>
</template>

<script>
import { computed, reactive, ref } from 'vue'
import { getDashboardDataset } from '../../entities/dashboard/data/getDashboardDataset.js'
import { useDashboardFilters } from '../../features/dashboard-filters/model/useDashboardFilters.js'
import {
  exportDashboardToExcel,
  exportDashboardToPdf,
} from '../../features/export/model/exportDashboard.js'
import DashboardCanvas from '../../widgets/dashboard-canvas/DashboardCanvas.vue'
import DashboardShell from '../../widgets/dashboard-shell/DashboardShell.vue'
import DetailsTable from '../../widgets/details-table/DetailsTable.vue'
import ExportActions from '../../widgets/export-actions/ExportActions.vue'
import FiltersSidebar from '../../widgets/filters-sidebar/FiltersSidebar.vue'
import FrameInspector from '../../widgets/frame-inspector/FrameInspector.vue'
import TemplateSelector from '../../widgets/template-selector/TemplateSelector.vue'
import {
  buildDashboardBuilderViewModel,
  createBuilderConfigForTemplate,
  createDefaultBuilderConfig,
  updateFrameConfig,
} from './model/dashboardBuilderModel.js'
import { dashboardTemplates } from './model/dashboardTemplates.js'
import {
  buildDashboardViewModel,
  createDefaultDashboardFilters,
} from './model/dashboardViewModel.js'

const dataset = getDashboardDataset()
const defaultFilters = createDefaultDashboardFilters(dataset)

export default {
  name: 'DashboardPage',
  components: {
    DashboardCanvas,
    DashboardShell,
    DetailsTable,
    ExportActions,
    FiltersSidebar,
    FrameInspector,
    TemplateSelector,
  },
  setup() {
    const { draftFilters, appliedFilters, applyFilters, resetFilters } =
      useDashboardFilters(defaultFilters)
    const builderConfig = reactive(createDefaultBuilderConfig())
    const dashboardCanvas = ref(null)
    const updateDraftFilter = (key, value) => {
      draftFilters[key] = value
    }

    const viewModel = computed(() => buildDashboardViewModel(dataset, appliedFilters))
    const builderViewModel = computed(() =>
      buildDashboardBuilderViewModel(dataset, appliedFilters, builderConfig),
    )
    const canvasElement = computed(() => dashboardCanvas.value?.$el || null)
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
    const selectTemplate = (templateId) => {
      Object.assign(builderConfig, createBuilderConfigForTemplate(templateId, builderConfig))
    }
    const selectFrame = (frameId) => {
      builderConfig.activeFrameId = frameId
    }
    const patchFrame = ({ frameId, patch }) => {
      builderConfig.activeFrameId = frameId
      Object.assign(builderConfig, updateFrameConfig(builderConfig, frameId, patch))
    }
    const patchActiveFrame = (patch) => {
      Object.assign(
        builderConfig,
        updateFrameConfig(builderConfig, builderConfig.activeFrameId, patch),
      )
    }

    return {
      activeFilterLabel,
      applyFilters,
      builderConfig,
      builderViewModel,
      canvasElement,
      dashboardCanvas,
      draftFilters,
      exportDashboardToExcel,
      exportDashboardToPdf,
      patchFrame,
      patchActiveFrame,
      resetFilters,
      selectFrame,
      selectTemplate,
      sidebarSummary,
      templates: dashboardTemplates,
      updateDraftFilter,
      viewModel,
    }
  },
}
</script>

<style scoped>
.builder-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 18px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
}

@media (max-width: 820px) {
  .builder-sidebar {
    position: static;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }
}
</style>
