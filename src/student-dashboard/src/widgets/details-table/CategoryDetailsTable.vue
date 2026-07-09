<template>
  <section class="panel details-panel">
    <div class="details-header">
      <div>
        <span class="eyebrow">Детальные данные</span>
        <h2>{{ categoryLabel }}</h2>
      </div>
      <div class="table-summary">
        <span>{{ rows.length }} строк</span>
        <span>{{ filterLabel }}</span>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Объект</th>
            <th>Показатель</th>
            <th>Период</th>
            <th>Значение</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length">
            <td colspan="4" class="empty-cell">Нет данных под выбранные фильтры</td>
          </tr>
          <tr v-for="item in rows" :key="`${item.id}`">
            <td>
              <strong class="line-clamp-2">{{ item.entity }}</strong>
            </td>
            <td>
              <div class="metric-cell">
                <span>{{ item.metricLabel }}</span>
                <small>{{ item.categoryLabel }}</small>
              </div>
            </td>
            <td>{{ item.period }}</td>
            <td>
              <span class="value-pill">{{ formatValue(item.value) }}{{ item.unit ? ` ${item.unit}` : '' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CategoryDetailsTable',
  props: {
    rows: {
      type: Array,
      required: true,
    },
    categoryLabel: {
      type: String,
      default: 'Показатели',
    },
    filterLabel: {
      type: String,
      default: 'все объекты и периоды',
    },
  },
  methods: {
    formatValue(value) {
      const number = Number(value)
      if (!Number.isFinite(number)) return value
      return Number.isInteger(number) ? number.toLocaleString('ru-RU') : number.toFixed(2)
    },
  },
}
</script>

<style scoped>
.details-panel {
  margin-top: 12px;
  padding: 16px;
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

h2 {
  margin: 2px 0 0;
  color: var(--color-text);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
}

.table-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.table-summary span {
  border-radius: 999px;
  padding: 6px 10px;
  background: var(--color-surface-muted);
  color: #526174;
  font-size: 12px;
  font-weight: 800;
}

.table-wrap {
  overflow-x: auto;
  margin-top: 12px;
}

table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 10px;
  border-bottom: 1px solid #edf1f6;
  text-align: left;
  vertical-align: middle;
}

th {
  color: #526174;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

td {
  color: #2b3747;
  font-size: 13px;
}

.metric-cell {
  display: grid;
  gap: 2px;
}

.metric-cell span {
  font-weight: 700;
  color: var(--color-text);
}

.metric-cell small {
  color: #7a8798;
  font-size: 11px;
}

.value-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 10px;
  background: #edf4ff;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 800;
}

.empty-cell {
  color: var(--color-muted);
  text-align: center;
}

@media (max-width: 820px) {
  .details-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
