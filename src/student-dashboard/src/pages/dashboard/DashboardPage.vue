<template>
<DashboardShell>
<template #sidebar>
      <aside class="builder-sidebar" aria-label="Панель конструктора">
        <!-- Логотип и название – на самом верху -->
        <div class="brand-block-sidebar">
          <div class="brand-mark">ТИУ</div>
          <div>
            <p class="brand-caption">Student Analytics</p>
            <h1>Дашборд показателей вуза</h1>
          </div>
        </div>        <!-- Блок пользователя (выход) -->        <div class="user-info-panel panel">
          <div class="user-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
          <div class="user-details">
            <strong>{{ userStore.user?.name || 'Пользователь' }}</strong>
            <span class="role-badge" :class="{ admin: userStore.isAdmin }">
              {{ userStore.isAdmin ? 'Администратор' : 'Студент' }}
            </span>
          </div>
          <button class="logout-btn" @click="logout">
            <i class="bi bi-box-arrow-right"></i> Выйти
          </button>
        </div>        <!-- Шаблоны и конструктор (только для администратора) -->        <template v-if="userStore.isAdmin">
          <TemplateSelector
            :templates="templates"
            :active-template-id="builderConfig.templateId"
            @select-template="selectTemplate"
          />
        </template>        <!-- Кнопки работы с данными (под шаблонами) -->        <div class="data-buttons-group">
          <DataUploader @uploaded="reloadDataset" />
          <button class="edit-data-button" @click="openDataManager">
            <i class="bi bi-pencil-square"></i> Изменить данные
          </button>
          <button v-if="customStore.isUsingCustom" class="reset-data-button" @click="resetBuiltinDataset">
            <i class="bi bi-arrow-counterclockwise"></i> Сбросить к встроенным данным
          </button>
        </div>        <!-- Фильтры: легаси-панель для встроенного датасета, либо адаптивная панель -->
        <!-- под загруженный универсальный датасет показателей -->
<FiltersSidebar
v-if="!isGenericTemplate"
:filters="draftFilters"
:options="viewModel.filterOptions"
:summary="sidebarSummary"
@apply="applyFilters"
@reset="resetFilters"
@update-filter="updateDraftFilter"
/>
<CategoryFiltersSidebar
v-else
:category-label="categoryFilterOptions.categoryLabel"
:entities="categoryFilterOptions.entities"
:periods="categoryFilterOptions.periods"
:records-count="categoryFilterOptions.entities.length ? categoryRecordsCount : 0"
:filters="genericFilters"
@update-filters="updateGenericFilters"
/>
        <!-- Инспектор фреймов (только для администратора) – после фильтров -->        <template v-if="userStore.isAdmin">
          <FrameInspector
            :frame="builderViewModel.activeFrame"
            :options="builderViewModel.inspectorOptions"
            @patch-frame="patchActiveFrame"
          />
        </template>        <!-- Панель администратора (заглушка, в самом низу) -->        <div v-if="userStore.isAdmin" class="admin-button-wrapper">
          <button class="admin-button" @click="openAdminPanel">
            <i class="bi bi-shield-lock"></i> Панель администратора
          </button>
        </div>
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
:disabled="isGenericTemplate ? !categoryDetailRows.length : viewModel.empty"
@excel="handleExcelExport"
@pdf="exportDashboardToPdf(canvasElement)"
/>
</template>
</DashboardCanvas>
<DetailsTable v-if="!isGenericTemplate" :rows="viewModel.detailRows" :active-filter-label="activeFilterLabel" />
<CategoryDetailsTable
v-else
:rows="categoryDetailRows"
:category-label="categoryFilterOptions.categoryLabel"
:filter-label="genericFilterLabel"
/>
    <!-- Модальное окно управления данными -->
<DataManager
v-if="showDataManager"
@close="showDataManager = false"
@data-updated="reloadDataset"
/>
</DashboardShell>
</template>
<script>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboardDataset } from '../../entities/dashboard/data/getDashboardDataset.js'
import { useDashboardFilters } from '../../features/dashboard-filters/model/useDashboardFilters.js'
import {
  exportCategoryToExcel,
  exportDashboardToExcel,
  exportDashboardToPdf,
} from '../../features/export/model/exportDashboard.js'
import DashboardCanvas from '../../widgets/dashboard-canvas/DashboardCanvas.vue'
import DashboardShell from '../../widgets/dashboard-shell/DashboardShell.vue'
import DetailsTable from '../../widgets/details-table/DetailsTable.vue'
import CategoryDetailsTable from '../../widgets/details-table/CategoryDetailsTable.vue'
import ExportActions from '../../widgets/export-actions/ExportActions.vue'
import FiltersSidebar from '../../widgets/filters-sidebar/FiltersSidebar.vue'
import CategoryFiltersSidebar from '../../widgets/category-filters/CategoryFiltersSidebar.vue'
import FrameInspector from '../../widgets/frame-inspector/FrameInspector.vue'
import TemplateSelector from '../../widgets/template-selector/TemplateSelector.vue'
import DataUploader from '../../components/DataUploader.vue'
import DataManager from '../../components/DataManager.vue'
import {
  buildDashboardBuilderViewModel,
  createBuilderConfigForTemplate,
  createDefaultBuilderConfig,
  updateFrameConfig,
} from './model/dashboardBuilderModel.js'
import { dashboardTemplates, categoryTemplateMap } from './model/dashboardTemplates.js'
import { getCategoryFilterOptions, getCategoryRecords } from './model/genericMetricsModel.js'
import {
  buildDashboardViewModel,
  createDefaultDashboardFilters,
} from './model/dashboardViewModel.js'
import { useUserStore } from '@/stores/user'
import { useCustomDataStore } from '@/stores/customData'
import { useGenericMetricsStore } from '@/stores/genericMetrics'

function getEffectiveDataset() {
  const customStore = useCustomDataStore()
  if (customStore.isUsingCustom && customStore.hasCustomData) {
    return {
      faculties: customStore.faculties.map(f => ({
        facultyId: f.facultyId,
        faculty: f.faculty,
        year: f.year,
        createdAt: new Date().toISOString(),
      })),
      performance: customStore.performance.map(p => ({
        id: p.id,
        facultyId: p.facultyId,
        averageScore: p.averageScore,
        studentsCount: p.studentsCount,
        semester: p.semester,
        year: p.year,
        createdAt: new Date().toISOString(),
      })),
      users: customStore.users.map(u => ({
        studentId: u.studentId,
        name: u.name,
        email: u.email,
        facultyId: u.facultyId,
        createdAt: new Date().toISOString(),
      })),
    }
  }
  return getDashboardDataset()
}

export default {
  name: 'DashboardPage',
  components: {
    DashboardCanvas,
    DashboardShell,
    DetailsTable,
    CategoryDetailsTable,
    ExportActions,
    FiltersSidebar,
    CategoryFiltersSidebar,
    FrameInspector,
    TemplateSelector,
    DataUploader,
    DataManager,
  },
  setup() {
    const userStore = useUserStore()
    const customStore = useCustomDataStore()
    const genericStore = useGenericMetricsStore()
    const router = useRouter()

    customStore.loadFromLocalStorage()
    genericStore.loadFromLocalStorage()

    const currentDataset = ref(getEffectiveDataset())

    const defaultFilters = createDefaultDashboardFilters(currentDataset.value)
    const { draftFilters, appliedFilters, applyFilters, resetFilters } =
      useDashboardFilters(defaultFilters)
    const builderConfig = reactive(createDefaultBuilderConfig())
    const genericFilters = reactive({ entities: [], periods: [] })
    const dashboardCanvas = ref(null)
    const showDataManager = ref(false)

    const updateDraftFilter = (key, value) => {
      draftFilters[key] = value
    }
    const updateGenericFilters = (patch) => {
      Object.assign(genericFilters, patch)
    }

    const isGenericTemplate = computed(() =>
      Object.values(categoryTemplateMap).includes(builderConfig.templateId),
    )
    const categoryFilterOptions = computed(() =>
      getCategoryFilterOptions(genericStore.records, builderConfig.templateId),
    )
    const categoryRecordsCount = computed(
      () => genericStore.records.filter((record) => record.category === builderConfig.templateId).length,
    )
    const categoryDetailRows = computed(() =>
      getCategoryRecords(genericStore.records, builderConfig.templateId, genericFilters),
    )
    const genericFilterLabel = computed(() => {
      const entitiesLabel = genericFilters.entities.length
        ? `${genericFilters.entities.length} объект(ов)`
        : 'все объекты'
      const periodsLabel = genericFilters.periods.length
        ? genericFilters.periods.join(', ')
        : 'все периоды'
      return `${entitiesLabel}, ${periodsLabel}`
    })

    const viewModel = computed(() => buildDashboardViewModel(currentDataset.value, appliedFilters))
    const builderViewModel = computed(() =>
      buildDashboardBuilderViewModel(
        currentDataset.value,
        appliedFilters,
        builderConfig,
        genericStore.records,
        genericFilters,
      ),
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
      genericFilters.entities = []
      genericFilters.periods = []
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

    const logout = () => {
      userStore.logout()
      router.push('/login')
    }

    const openDataManager = () => {
      showDataManager.value = true
    }

    const openAdminPanel = () => {
      alert('Панель администратора в разработке. Здесь будет управление пользователями и системными настройками.')
    }

    const resetBuiltinDataset = () => {
      if (confirm('Сбросить загруженный датасет успеваемости и вернуться к встроенным данным?')) {
        customStore.resetToBuiltin()
      }
    }

    const handleExcelExport = () => {
      if (isGenericTemplate.value) {
        exportCategoryToExcel(categoryFilterOptions.value.categoryLabel, categoryDetailRows.value)
      } else {
        exportDashboardToExcel(viewModel.value.detailRows)
      }
    }

    const reloadDataset = (uploadInfo) => {
      currentDataset.value = getEffectiveDataset()
      const newDefaultFilters = createDefaultDashboardFilters(currentDataset.value)
      Object.assign(draftFilters, newDefaultFilters)
      Object.assign(appliedFilters, newDefaultFilters)
      applyFilters()

      const categories = uploadInfo?.categories || []
      if (categories.length === 1) {
        const templateId = categoryTemplateMap[categories[0]]
        if (templateId && templateId !== builderConfig.templateId) {
          selectTemplate(templateId)
        }
      }
    }

    watch(() => customStore.isUsingCustom, () => {
      reloadDataset()
    })

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
      userStore,
      logout,
      openDataManager,
      openAdminPanel,
      showDataManager,
      reloadDataset,
      genericFilters,
      updateGenericFilters,
      isGenericTemplate,
      categoryFilterOptions,
      categoryRecordsCount,
      customStore,
      resetBuiltinDataset,
      categoryDetailRows,
      genericFilterLabel,
      handleExcelExport,
    }
  },
}
</script><style scoped>
.builder-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 18px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
}

.brand-block-sidebar {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: var(--radius-md);
  background: #172f65;
  color: #fff;
  font-weight: 800;
}
.brand-caption {
  margin: 0;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}
.brand-block-sidebar h1 {
  margin: 2px 0 0;
  color: var(--color-text);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
}

.user-info-panel {
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.user-avatar i {
  font-size: 32px;
  color: var(--color-accent);
}
.user-details {
  flex: 1;
}
.user-details strong {
  display: block;
  font-size: 14px;
}
.role-badge {
  font-size: 10px;
  background: #eef4fb;
  padding: 2px 8px;
  border-radius: 20px;
  color: #1f7aec;
}
.role-badge.admin {
  background: #fde8e4;
  color: #a34337;
}
.logout-btn {
  background: none;
  border: none;
  color: #6d7b8d;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.2s;
}
.logout-btn:hover {
  color: var(--color-danger);
}

.data-buttons-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}
.edit-data-button {
  width: 100%;
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}
.edit-data-button:hover {
  background: var(--color-surface);
}

.reset-data-button {
  width: 100%;
  background: transparent;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px;
  font-weight: 700;
  font-size: 12px;
  color: var(--color-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: color 0.2s, border-color 0.2s;
}
.reset-data-button:hover {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.admin-button-wrapper {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}
.admin-button {
  width: 100%;
  background: var(--color-surface-muted);
  border: none;
  border-radius: var(--radius-md);
  padding: 10px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}
.admin-button:hover {
  background: #e2e8f0;
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