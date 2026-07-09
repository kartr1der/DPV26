import { defineStore } from 'pinia'
import { defaultCategoryLabel, normalizeMetricRecord } from '@/entities/metric/model.js'

const STORAGE_KEY = 'genericMetricsData'

export const useGenericMetricsStore = defineStore('genericMetrics', {
  state: () => ({
    records: [],
    lastLoaded: null,
  }),
  getters: {
    hasData: (state) => state.records.length > 0,
    categories: (state) => {
      const map = new Map()
      state.records.forEach((record) => {
        if (!map.has(record.category)) {
          map.set(record.category, record.categoryLabel || defaultCategoryLabel(record.category))
        }
      })
      return [...map.entries()].map(([value, label]) => ({ value, label }))
    },
    metricsByCategory: (state) => {
      const map = new Map()
      state.records.forEach((record) => {
        const key = `${record.category}:${record.metric}`
        if (!map.has(key)) {
          map.set(key, {
            category: record.category,
            categoryLabel: record.categoryLabel,
            metric: record.metric,
            label: record.metricLabel || record.metric,
            unit: record.unit,
          })
        }
      })
      return [...map.values()]
    },
    entities: (state) =>
      [...new Set(state.records.map((record) => record.entity))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'ru')),
    periods: (state) => [...new Set(state.records.map((record) => record.period))].filter(Boolean).sort(),
  },
  actions: {
    loadFromLocalStorage() {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return false

      try {
        const data = JSON.parse(saved)
        this.records = data.records || []
        this.lastLoaded = data.lastLoaded || null
        return true
      } catch (error) {
        console.error('Failed to load generic metrics dataset', error)
        return false
      }
    },
    saveToLocalStorage() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ records: this.records, lastLoaded: this.lastLoaded }),
      )
    },
    setRecords(rows) {
      this.records = rows.map((row, index) => normalizeMetricRecord(row, row.id ?? index + 1))
      this.lastLoaded = new Date().toISOString()
      this.saveToLocalStorage()
    },
    appendRecords(rows) {
      const startId = Math.max(0, ...this.records.map((record) => record.id)) + 1
      const appended = rows.map((row, index) => normalizeMetricRecord(row, startId + index))
      this.records = [...this.records, ...appended]
      this.lastLoaded = new Date().toISOString()
      this.saveToLocalStorage()
    },
    addRecord(row) {
      const newId = Math.max(0, ...this.records.map((record) => record.id)) + 1
      this.records.push(normalizeMetricRecord({ ...row, id: newId }, newId))
      this.saveToLocalStorage()
    },
    updateRecord(id, patch) {
      const index = this.records.findIndex((record) => record.id === id)
      if (index !== -1) {
        this.records[index] = normalizeMetricRecord({ ...this.records[index], ...patch }, id)
        this.saveToLocalStorage()
      }
    },
    deleteRecord(id) {
      this.records = this.records.filter((record) => record.id !== id)
      this.saveToLocalStorage()
    },
    clearAll() {
      this.records = []
      this.lastLoaded = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
