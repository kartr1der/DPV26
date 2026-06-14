<template>
  <aside class="filter-sidebar" aria-label="Панель фильтров">

    <section class="panel filter-card">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Фильтры</span>
          <h2>Срез данных</h2>
        </div>
        <button class="icon-button" type="button" title="Сбросить фильтры" @click="$emit('reset')">
          <i class="bi bi-arrow-counterclockwise"></i>
        </button>
      </div>

      <div class="field">
        <span>Факультет</span>
        <div class="faculty-checklist">
          <label v-for="faculty in options.faculties" :key="faculty.id" class="faculty-check">
            <input
              type="checkbox"
              :checked="filters.facultyIds.includes(faculty.id)"
              @change="toggleFaculty(faculty.id)"
            />
            <span>{{ faculty.shortName }}</span>
            <strong class="line-clamp-2">{{ faculty.name }}</strong>
          </label>
        </div>
      </div>

      <label class="field">
        <span>Поиск по названию</span>
        <input
          :value="filters.query"
          type="search"
          placeholder="Например, ИВТ"
          @input="updateFilter('query', $event.target.value.trim())"
        />
      </label>

      <label class="field">
        <span>Год</span>
        <select :value="filters.year" @change="updateFilter('year', $event.target.value)">
          <option value="all">Все годы</option>
          <option v-for="year in options.years" :key="year" :value="year">{{ year }}</option>
        </select>
      </label>

      <div class="field">
        <span>Семестр</span>
        <div class="segmented">
          <button
            type="button"
            :class="{ active: filters.semester === 'all' }"
            @click="updateFilter('semester', 'all')"
          >
            Все
          </button>
          <button
            v-for="semester in options.semesters"
            :key="semester"
            type="button"
            :class="{ active: filters.semester === semester }"
            @click="updateFilter('semester', semester)"
          >
            {{ semester }}
          </button>
        </div>
      </div>

      <div class="range-grid">
        <label class="field">
          <span>Балл от</span>
          <input
            :value="filters.scoreMin"
            type="number"
            min="0"
            max="5"
            step="0.05"
            @input="updateNumberFilter('scoreMin', $event.target.value)"
          />
        </label>
        <label class="field">
          <span>Балл до</span>
          <input
            :value="filters.scoreMax"
            type="number"
            min="0"
            max="5"
            step="0.05"
            @input="updateNumberFilter('scoreMax', $event.target.value)"
          />
        </label>
      </div>

      <div class="range-grid">
        <label class="field">
          <span>Студентов от</span>
          <input
            :value="filters.studentsMin"
            type="number"
            min="0"
            step="1"
            @input="updateNumberFilter('studentsMin', $event.target.value)"
          />
        </label>
        <label class="field">
          <span>Студентов до</span>
          <input
            :value="filters.studentsMax"
            type="number"
            min="0"
            step="1"
            @input="updateNumberFilter('studentsMax', $event.target.value)"
          />
        </label>
      </div>

      <label class="field">
        <span>Динамика</span>
        <select :value="filters.trend" @change="updateFilter('trend', $event.target.value)">
          <option value="all">Любая</option>
          <option value="positive">Рост</option>
          <option value="negative">Снижение</option>
          <option value="stable">Без изменений</option>
        </select>
      </label>

      <label class="field">
        <span>Сортировка таблицы</span>
        <select :value="filters.sort" @change="updateFilter('sort', $event.target.value)">
          <option value="scoreDesc">Балл по убыванию</option>
          <option value="scoreAsc">Балл по возрастанию</option>
          <option value="studentsDesc">Студенты по убыванию</option>
          <option value="trendDesc">Динамика по убыванию</option>
          <option value="facultyAsc">Факультет A-Я</option>
        </select>
      </label>

      <div class="filter-actions">
        <button class="secondary-button" type="button" @click="$emit('reset')">
          <i class="bi bi-x-circle"></i>
          Сбросить
        </button>
        <button class="primary-button" type="button" @click="$emit('apply')">
          <i class="bi bi-check2-circle"></i>
          Применить
        </button>
      </div>
    </section>

    <section class="panel filter-card compact">
      <span class="eyebrow">Текущий срез</span>
      <div class="sidebar-metrics">
        <div>
          <strong>{{ summary.rows }}</strong>
          <span>записей</span>
        </div>
        <div>
          <strong>{{ summary.students }}</strong>
          <span>студентов</span>
        </div>
        <div>
          <strong>{{ summary.averageScore }}</strong>
          <span>средний балл</span>
        </div>
      </div>
    </section>
  </aside>
</template>

<script>
export default {
  name: 'FiltersSidebar',
  props: {
    filters: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
    summary: {
      type: Object,
      required: true,
    },
  },
  emits: ['apply', 'reset', 'update-filter'],
  methods: {
    updateFilter(key, value) {
      this.$emit('update-filter', key, value)
    },
    updateNumberFilter(key, value) {
      this.$emit('update-filter', key, Number(value))
    },
    toggleFaculty(facultyId) {
      const selectedIds = this.filters.facultyIds.includes(facultyId)
        ? this.filters.facultyIds.filter((id) => id !== facultyId)
        : [...this.filters.facultyIds, facultyId]

      this.$emit('update-filter', 'facultyIds', selectedIds)
    },
  },
}
</script>

<style scoped>
.filter-sidebar {
  padding: 0;
  background: var(--color-surface);
}

.brand-block {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
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

h1,
h2 {
  margin: 2px 0 0;
  color: var(--color-text);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
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
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.icon-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: var(--radius-md);
  background: #eef4fb;
  color: var(--color-accent);
}

.field {
  display: grid;
  gap: 7px;
  margin-bottom: 13px;
}

.field span {
  color: #526174;
  font-size: 12px;
  font-weight: 700;
}

.field input,
.field select {
  width: 100%;
  min-height: 38px;
  border: 1px solid #ccd8e5;
  border-radius: var(--radius-md);
  padding: 8px 10px;
  color: var(--color-text);
  background: #fff;
  font-size: 13px;
}

.faculty-checklist {
  display: grid;
  gap: 7px;
  max-height: 190px;
  overflow-y: auto;
  padding-right: 4px;
}

.faculty-check {
  display: grid;
  grid-template-columns: 18px 38px 1fr;
  gap: 8px;
  align-items: center;
  min-height: 42px;
  border: 1px solid #d7e3f1;
  border-radius: var(--radius-md);
  padding: 7px;
  background: #fff;
}

.faculty-check span {
  display: grid;
  place-items: center;
  min-height: 25px;
  border-radius: 6px;
  background: #edf4ff;
  color: var(--color-accent);
  font-size: 11px;
  font-weight: 900;
}

.faculty-check strong {
  color: var(--color-text);
  font-size: 11px;
  line-height: 1.2;
}

.range-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.segmented {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  padding: 4px;
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
}

.segmented button {
  min-height: 32px;
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
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 16px;
}

.primary-button,
.secondary-button {
  min-height: 38px;
  border: 0;
  border-radius: var(--radius-md);
  font-weight: 800;
}

.primary-button {
  background: var(--color-accent);
  color: #fff;
}

.secondary-button {
  background: var(--color-surface-muted);
  color: #526174;
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
