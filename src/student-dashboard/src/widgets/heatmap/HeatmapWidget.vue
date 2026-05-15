<template>
  <article class="panel heatmap-widget">
    <WidgetHeader
      icon="bi bi-grid-3x3-gap-fill"
      title="Тепловая карта"
      subtitle="Интенсивность среднего балла по семестрам"
    />

    <div v-if="rows.length" class="heatmap">
      <div class="heatmap-row heatmap-head" :style="gridStyle">
        <span>Факультет</span>
        <span v-for="semester in semesters" :key="semester">Сем. {{ semester }}</span>
      </div>
      <div v-for="faculty in rows" :key="faculty.id" class="heatmap-row" :style="gridStyle">
        <span class="heatmap-name" :title="faculty.name">
          <strong>{{ faculty.shortName }}</strong>
          <small class="line-clamp-2">{{ faculty.compactName }}</small>
        </span>
        <span
          v-for="cell in faculty.cells"
          :key="`${faculty.id}-${cell.semester}`"
          class="heatmap-cell"
          :style="{ backgroundColor: cell.color }"
        >
          {{ cell.value || '—' }}
        </span>
      </div>
    </div>

    <p v-else class="empty-state">Нет данных для тепловой карты</p>
  </article>
</template>

<script>
import WidgetHeader from '../../shared/ui/WidgetHeader.vue'

export default {
  name: 'HeatmapWidget',
  components: {
    WidgetHeader,
  },
  props: {
    rows: {
      type: Array,
      required: true,
    },
    semesters: {
      type: Array,
      required: true,
    },
  },
  computed: {
    gridStyle() {
      return {
        gridTemplateColumns: `minmax(170px, 1fr) repeat(${this.semesters.length}, minmax(76px, 90px))`,
      }
    },
  },
}
</script>

<style scoped>
.heatmap-widget {
  padding: 15px;
  margin-top: 12px;
}

.heatmap {
  display: grid;
  gap: 6px;
  overflow-x: auto;
}

.heatmap-row {
  display: grid;
  gap: 6px;
  align-items: stretch;
}

.heatmap-head span {
  background: var(--color-surface-muted);
  color: #526174;
  font-size: 12px;
  font-weight: 800;
}

.heatmap-row span {
  display: grid;
  align-items: center;
  min-height: 48px;
  border-radius: var(--radius-md);
  padding: 7px 9px;
}

.heatmap-name {
  min-width: 0;
  background: #f8fafc;
}

.heatmap-name strong {
  color: var(--color-text);
  font-size: 12px;
}

.heatmap-name small {
  color: #526174;
  font-size: 11px;
  line-height: 1.2;
}

.heatmap-cell {
  justify-items: center;
  color: var(--color-text);
  font-weight: 900;
}

.empty-state {
  margin: 0;
  color: var(--color-muted);
  font-size: 13px;
}
</style>
