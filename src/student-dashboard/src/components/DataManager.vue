<template>
  <div class="data-manager">
    <div class="manager-header">
      <div class="header-title">
        <span class="eyebrow">Универсальный датасет</span>
        <h3>Показатели</h3>
      </div>
      <button class="close-btn" @click="$emit('close')" title="Закрыть">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <div class="manager-toolbar">
      <div class="toolbar-stats">
        <div class="stat-chip" v-for="chip in categoryChips" :key="chip.category">
          <span class="dot" :style="{ background: chip.color }"></span>
          {{ chip.label }} · {{ chip.count }}
        </div>
        <div v-if="!categoryChips.length" class="stat-chip muted">Нет загруженных показателей</div>
      </div>
      <div class="toolbar-actions">
        <button class="add-btn" @click="addNewMetric">
          <i class="bi bi-plus-lg"></i> Добавить показатель
        </button>
        <button class="template-btn" @click="downloadTemplate">
          <i class="bi bi-download"></i> Скачать шаблон CSV
        </button>
      </div>
    </div>

    <div class="table-container">
      <table v-if="genericStore.records.length" class="editable-table">
        <thead>
          <tr>
            <th class="col-category">Категория</th>
            <th class="col-metric">Показатель</th>
            <th>Объект</th>
            <th>Период</th>
            <th>Значение</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sortedRecords" :key="item.id" :style="rowAccentStyle(item.category)">
            <td class="col-category">
              <input
                class="cell-main"
                type="text"
                v-model="item.categoryLabel"
                @blur="saveMetric(item)"
                placeholder="Подпись категории"
              />
              <input
                class="cell-sub"
                type="text"
                v-model="item.category"
                @blur="saveMetric(item)"
                placeholder="код категории"
              />
            </td>
            <td class="col-metric">
              <input
                class="cell-main"
                type="text"
                v-model="item.metricLabel"
                @blur="saveMetric(item)"
                placeholder="Подпись показателя"
              />
              <input
                class="cell-sub"
                type="text"
                v-model="item.metric"
                @blur="saveMetric(item)"
                placeholder="код показателя"
              />
            </td>
            <td><input type="text" v-model="item.entity" @blur="saveMetric(item)" /></td>
            <td><input type="text" v-model="item.period" @blur="saveMetric(item)" /></td>
            <td class="col-value">
              <input
                class="value-input"
                type="number"
                step="0.01"
                v-model="item.value"
                @blur="saveMetric(item)"
              />
              <input class="unit-input" type="text" v-model="item.unit" @blur="saveMetric(item)" placeholder="ед." />
            </td>
            <td class="col-actions">
              <button class="delete-btn" @click="deleteMetric(item.id)" title="Удалить">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <i class="bi bi-bar-chart-line"></i>
        <strong>Пока нет ни одного показателя</strong>
        <p>
          Добавьте запись вручную кнопкой выше или загрузите файл в универсальном формате через
          «Загрузить данные» в боковой панели — показатели сразу появятся здесь и в конструкторе дашборда.
        </p>
        <button class="template-btn" @click="downloadTemplate">
          <i class="bi bi-download"></i> Скачать шаблон CSV
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useGenericMetricsStore } from '@/stores/genericMetrics'
import { defaultCategoryLabel } from '@/entities/metric/model.js'

const CATEGORY_COLORS = {
  education: '#1f7aec',
  science: '#6f62d2',
  finance: '#b9831b',
  international: '#1f8e93',
}
const FALLBACK_COLOR = '#6d7b8d'

export default {
  name: 'DataManager',
  emits: ['close', 'data-updated'],
  setup() {
    const genericStore = useGenericMetricsStore()
    return { genericStore }
  },
  computed: {
    sortedRecords() {
      return [...this.genericStore.records].sort((a, b) => {
        return (
          a.category.localeCompare(b.category, 'ru') ||
          a.metric.localeCompare(b.metric, 'ru') ||
          a.entity.localeCompare(b.entity, 'ru') ||
          a.period.localeCompare(b.period, 'ru')
        )
      })
    },
    categoryChips() {
      return this.genericStore.categories.map((category) => ({
        category: category.value,
        label: category.label,
        color: CATEGORY_COLORS[category.value] || FALLBACK_COLOR,
        count: this.genericStore.records.filter((record) => record.category === category.value).length,
      }))
    },
  },
  methods: {
    categoryColor(category) {
      return CATEGORY_COLORS[category] || FALLBACK_COLOR
    },
    rowAccentStyle(category) {
      return { '--row-accent': this.categoryColor(category) }
    },
    saveMetric(record) {
      this.genericStore.updateRecord(record.id, record)
      this.$emit('data-updated')
    },
    deleteMetric(id) {
      if (confirm('Удалить показатель?')) {
        this.genericStore.deleteRecord(id)
        this.$emit('data-updated')
      }
    },
    addNewMetric() {
      this.genericStore.addRecord({
        category: 'science',
        categoryLabel: defaultCategoryLabel('science'),
        metric: 'new_metric',
        metricLabel: 'Новый показатель',
        entity: 'ИВТ',
        period: String(new Date().getFullYear()),
        value: 0,
        unit: '',
      })
      this.$emit('data-updated')
    },
    downloadTemplate() {
      const header = 'category;category_label;metric;metric_label;entity;period;value;unit'
      const rows = [
        'science;Научная деятельность;publications;Публикации;ИВТ;2025;112;шт',
        'science;Научная деятельность;h_index_avg;Индекс Хирша (средний);ИВТ;2025;6.4;',
        'finance;Финансово-экономические показатели;budget_funding;Бюджетное финансирование;НГД;2025;84500000;руб.',
        'international;Международная деятельность;foreign_students;Иностранные студенты;ЭиУ;2025;37;чел.',
      ]
      const csv = [header, ...rows].join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'metrics_template.csv'
      link.click()
      URL.revokeObjectURL(url)
    },
  },
}
</script>

<style scoped>
.data-manager {
  position: fixed;
  top: 6%;
  left: 12%;
  width: 76%;
  height: 88%;
  background: var(--color-surface);
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border);
}

.header-title h3 {
  margin: 2px 0 0;
  font-size: 21px;
  font-weight: 900;
  color: var(--color-text);
}

.close-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: var(--color-surface-muted);
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  color: var(--color-muted);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.close-btn:hover {
  background: #fde8e4;
  color: var(--color-danger);
}

.manager-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 22px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-muted);
}

.toolbar-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--color-border);
  font-size: 12px;
  font-weight: 800;
  color: var(--color-text);
}

.stat-chip.muted {
  color: var(--color-muted);
  font-weight: 600;
}

.stat-chip .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 9px 14px;
  font-weight: 800;
  font-size: 13px;
  box-shadow: 0 8px 18px rgba(31, 122, 236, 0.22);
}

.template-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 9px 14px;
  font-weight: 700;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
}

.template-btn:hover {
  background: var(--color-surface-muted);
}

.table-container {
  flex: 1;
  overflow: auto;
  padding: 18px 22px 22px;
}

.editable-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
}

.editable-table thead th {
  position: sticky;
  top: 0;
  background: var(--color-surface);
  z-index: 1;
  text-align: left;
  padding: 0 12px 8px;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--color-muted);
}

.editable-table tbody tr {
  background: #fff;
  box-shadow: 0 1px 0 var(--color-border), 0 0 0 1px var(--color-border);
  border-radius: var(--radius-md);
}

.editable-table tbody tr td {
  padding: 10px 12px;
  vertical-align: middle;
  position: relative;
}

.editable-table tbody tr td:first-child {
  border-left: 4px solid var(--row-accent, var(--color-accent));
  border-top-left-radius: var(--radius-md);
  border-bottom-left-radius: var(--radius-md);
}

.editable-table tbody tr td:last-child {
  border-top-right-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}

.editable-table input {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 5px 7px;
  background: transparent;
  font-size: 13px;
  color: var(--color-text);
  transition: background 0.15s, border-color 0.15s;
}

.editable-table input:hover {
  background: var(--color-surface-muted);
}

.editable-table input:focus {
  outline: none;
  background: #fff;
  border-color: var(--color-accent);
}

.col-category,
.col-metric {
  min-width: 190px;
}

.cell-main {
  font-weight: 700;
}

.cell-sub {
  margin-top: 2px;
  font-size: 11px;
  color: var(--color-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.col-value {
  display: flex;
  gap: 6px;
  min-width: 130px;
}

.value-input {
  flex: 2;
  text-align: right;
  font-weight: 800;
}

.unit-input {
  flex: 1;
  color: var(--color-muted);
}

.col-actions {
  width: 44px;
  text-align: center;
}

.delete-btn {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--color-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.delete-btn:hover {
  background: #fde8e4;
  color: var(--color-danger);
}

.empty-state {
  height: 100%;
  display: grid;
  place-items: center;
  justify-items: center;
  gap: 10px;
  text-align: center;
  padding: 40px 20px;
  color: var(--color-muted);
}

.empty-state i {
  font-size: 46px;
  color: var(--color-accent);
}

.empty-state strong {
  color: var(--color-text);
  font-size: 16px;
}

.empty-state p {
  max-width: 420px;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .data-manager {
    top: 2%;
    left: 3%;
    width: 94%;
    height: 96%;
  }
}
</style>
