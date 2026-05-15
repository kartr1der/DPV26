import { reactive } from 'vue'
import {
  cloneDashboardFilters,
  normalizeDashboardFilters,
} from '../../../pages/dashboard/model/dashboardViewModel.js'

export function useDashboardFilters(defaultFilters) {
  const draftFilters = reactive(cloneDashboardFilters(defaultFilters))
  const appliedFilters = reactive(cloneDashboardFilters(defaultFilters))

  function applyFilters() {
    Object.assign(appliedFilters, normalizeDashboardFilters(draftFilters))
    Object.assign(draftFilters, cloneDashboardFilters(appliedFilters))
  }

  function resetFilters() {
    Object.assign(draftFilters, cloneDashboardFilters(defaultFilters))
    Object.assign(appliedFilters, cloneDashboardFilters(defaultFilters))
  }

  return {
    draftFilters,
    appliedFilters,
    applyFilters,
    resetFilters,
  }
}
