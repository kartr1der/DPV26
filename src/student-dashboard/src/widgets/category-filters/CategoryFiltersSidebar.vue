<template>
  <aside class="filter-sidebar" aria-label="Панель фильтров показателей">
    <section class="panel filter-card">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Фильтры</span>
          <h2>{{ categoryLabel }}</h2>
        </div>
        <button class="icon-button" type="button" title="Сбросить фильтры" @click="reset">
          <i class="bi bi-arrow-counterclockwise"></i>
        </button>
      </div>

      <p class="hint-text">
        Эта панель построена по данным загруженного датасета — выберите объекты и периоды,
        чтобы сузить срез на всех виджетах дашборда.
      </p>

      <div class="field">
        <span>Объекты ({{ entities.length }})</span>
        <div class="entity-checklist">
          <label v-for="entity in entities" :key="entity" class="entity-check">
            <input
              type="checkbox"
              :checked="isEntitySelected(entity)"
              @change="toggleEntity(entity)"
            />
            <span class="line-clamp-2">{{ entity }}</span>
          </label>
          <p v-if="!entities.length" class="empty-text">Нет данных</p>
        </div>
      </div>

      <div class="field">
        <span>Период</span>
        <div class="segmented period-segmented">
          <button
            type="button"
            :class="{ active: !filters.periods.length }"
            @click="resetPeriods"
          >
            Все
          </button>
          <button
            v-for="period in periods"
            :key="period"
            type="button"
            :class="{ active: filters.periods.includes(period) }"
            @click="togglePeriod(period)"
          >
            {{ period }}
          </button>
        </div>
      </div>

      <div class="filter-actions">
        <button class="secondary-button full" type="button" @click="reset">
          <i class="bi bi-x-circle"></i>
          Сбросить фильтры
        </button>
      </div>
    </section>

    <section class="panel filter-card compact">
      <span class="eyebrow">Источник данных</span>
      <div class="sidebar-metrics">
        <div>
          <strong>{{ recordsCount }}</strong>
          <span>записей в категории</span>
        </div>
        <div>
          <strong>{{ entities.length }}</strong>
          <span>объектов</span>
        </div>
        <div>
          <strong>{{ periods.length }}</strong>
          <span>периодов</span>
        </div>
      </div>
    </section>
  </aside>
</template>

<script>
export default {
  name: 'CategoryFiltersSidebar',
  props: {
    categoryLabel: {
      type: String,
      default: 'Показатели',
    },
    entities: {
      type: Array,
      default: () => [],
    },
    periods: {
      type: Array,
      default: () => [],
    },
    recordsCount: {
      type: Number,
      default: 0,
    },
    filters: {
      type: Object,
      required: true,
    },
  },
  emits: ['update-filters'],
  methods: {
    isEntitySelected(entity) {
      return !this.filters.entities.length || this.filters.entities.includes(entity)
    },
    toggleEntity(entity) {
      const allSelected = !this.filters.entities.length
      const current = allSelected ? [...this.entities] : [...this.filters.entities]
      const next = current.includes(entity)
        ? current.filter((item) => item !== entity)
        : [...current, entity]

      // если выбраны все объекты — считаем это эквивалентом "без фильтра"
      this.$emit('update-filters', {
        entities: next.length === this.entities.length ? [] : next,
      })
    },
    togglePeriod(period) {
      const next = this.filters.periods.includes(period)
        ? this.filters.periods.filter((item) => item !== period)
        : [...this.filters.periods, period]
      this.$emit('update-filters', { periods: next })
    },
    resetPeriods() {
      this.$emit('update-filters', { periods: [] })
    },
    reset() {
      this.$emit('update-filters', { entities: [], periods: [] })
    },
  },
}
</script>

<style scoped>
.filter-sidebar {
  padding: 0;
  background: var(--color-surface);
}

h2 {
  margin: 2px 0 0;
  color: var(--color-text);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.25;
}

.filter-card {
  padding: 16px;
  margin-bottom: 14px;
}

.filter-card.compact {
  padding: 14px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;
}

.icon-button {
  width: 34px;
  height: 34px;
  flex: none;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: var(--radius-md);
  background: #eef4fb;
  color: var(--color-accent);
}

.hint-text {
  margin: 0 0 16px;
  color: var(--color-muted);
  font-size: 12px;
  line-height: 1.45;
}

.field {
  display: grid;
  gap: 7px;
  margin-bottom: 14px;
}

.field > span {
  color: #526174;
  font-size: 12px;
  font-weight: 700;
}

.entity-checklist {
  display: grid;
  gap: 7px;
  max-height: 230px;
  overflow-y: auto;
  padding-right: 4px;
}

.entity-check {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 8px;
  align-items: center;
  min-height: 38px;
  border: 1px solid #d7e3f1;
  border-radius: var(--radius-md);
  padding: 7px 9px;
  background: #fff;
}

.entity-check span {
  color: var(--color-text);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.25;
}

.empty-text {
  margin: 0;
  color: var(--color-muted);
  font-size: 12px;
}

.segmented {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 4px;
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
}

.period-segmented button {
  min-width: 52px;
}

.segmented button {
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  color: #526174;
  background: transparent;
  font-weight: 800;
  font-size: 12px;
}

.segmented button.active {
  background: var(--color-accent);
  color: #fff;
  box-shadow: 0 6px 14px rgba(31, 122, 236, 0.24);
}

.filter-actions {
  display: grid;
  margin-top: 16px;
}

.secondary-button {
  min-height: 38px;
  border: 0;
  border-radius: var(--radius-md);
  font-weight: 800;
  background: var(--color-surface-muted);
  color: #526174;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.sidebar-metrics {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.sidebar-metrics div {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #edf1f6;
}

.sidebar-metrics div:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.sidebar-metrics strong {
  font-size: 18px;
}

.sidebar-metrics span {
  color: var(--color-muted);
  font-size: 12px;
}

@media (max-width: 820px) {
  .filter-sidebar {
    position: static;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }
}
</style>
