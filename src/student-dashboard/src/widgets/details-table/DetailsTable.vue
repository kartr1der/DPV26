<template>
  <section class="panel details-panel">
    <div class="details-header">
      <div>
        <span class="eyebrow">Детальные данные</span>
        <h2>Динамика по институтам</h2>
      </div>
      <div class="table-summary">
        <span>{{ rows.length }} строк</span>
        <span>{{ activeFilterLabel }}</span>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Институт</th>
            <th>Семестр</th>
            <th>Средний балл</th>
            <th>Студентов</th>
            <th>Динамика</th>
            <th>Оценка</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length">
            <td colspan="6" class="empty-cell">Нет данных под выбранные фильтры</td>
          </tr>
          <tr v-for="item in rows" :key="`${item.facultyId}-${item.semester}`">
            <td>
              <div class="faculty-cell">
                <span>{{ item.shortName }}</span>
                <strong class="line-clamp-2" :title="item.facultyName">{{ item.compactName }}</strong>
                <small class="line-clamp-2">{{ item.facultyName }}</small>
              </div>
            </td>
            <td>{{ item.semester }} семестр</td>
            <td>
              <span class="score-pill" :class="item.scoreTone">
                {{ item.averageScore.toFixed(2) }}
              </span>
            </td>
            <td>{{ item.studentsCount }}</td>
            <td>
              <span class="trend-pill" :class="item.trendTone">
                <i :class="item.trendIcon"></i>
                {{ item.trendLabel }}
              </span>
            </td>
            <td>{{ item.scoreLabel }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DetailsTable',
  props: {
    rows: {
      type: Array,
      required: true,
    },
    activeFilterLabel: {
      type: String,
      required: true,
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
  min-width: 780px;
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

.faculty-cell {
  display: grid;
  grid-template-columns: 44px minmax(120px, 220px);
  column-gap: 10px;
  align-items: center;
}

.faculty-cell span {
  grid-row: span 2;
  display: grid;
  place-items: center;
  width: 44px;
  height: 34px;
  border-radius: var(--radius-md);
  background: #edf4ff;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 900;
}

.faculty-cell strong {
  font-size: 13px;
  line-height: 1.2;
}

.faculty-cell small {
  color: #7a8798;
  font-size: 11px;
  line-height: 1.2;
}

.score-pill,
.trend-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  padding: 6px 9px;
  font-size: 12px;
  font-weight: 800;
}

.score-pill.excellent,
.trend-pill.positive {
  background: #dff6e8;
  color: #16784b;
}

.score-pill.good {
  background: #e4f8f7;
  color: #16777c;
}

.score-pill.average {
  background: #fff3cf;
  color: #9a6900;
}

.score-pill.risk,
.trend-pill.negative {
  background: #fde8e4;
  color: #a34337;
}

.trend-pill.neutral {
  background: var(--color-surface-muted);
  color: var(--color-muted);
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
