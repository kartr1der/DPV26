<template>
  <section class="faculty-filter">
    <div class="filter-title">
      <span>Институты для сравнения</span>
      <button type="button" @click="$emit('change', [])">Все</button>
    </div>

    <div class="faculty-list">
      <label v-for="faculty in faculties" :key="faculty.id" class="faculty-option">
        <input
          type="checkbox"
          :checked="selectedIds.includes(faculty.id)"
          @change="toggleFaculty(faculty.id)"
        />
        <span>{{ faculty.shortName }}</span>
        <strong class="line-clamp-2">{{ faculty.name }}</strong>
      </label>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MultiFacultyFilter',
  props: {
    faculties: {
      type: Array,
      required: true,
    },
    selectedIds: {
      type: Array,
      required: true,
    },
  },
  emits: ['change'],
  methods: {
    toggleFaculty(facultyId) {
      const nextIds = this.selectedIds.includes(facultyId)
        ? this.selectedIds.filter((id) => id !== facultyId)
        : [...this.selectedIds, facultyId]

      this.$emit('change', nextIds)
    },
  },
}
</script>

<style scoped>
.faculty-filter {
  display: grid;
  gap: 9px;
  margin-bottom: 13px;
}

.filter-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.filter-title span {
  color: #526174;
  font-size: 12px;
  font-weight: 800;
}

.filter-title button {
  border: 0;
  background: transparent;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 800;
}

.faculty-list {
  display: grid;
  gap: 7px;
  max-height: 232px;
  overflow-y: auto;
  padding-right: 4px;
}

.faculty-option {
  display: grid;
  grid-template-columns: 18px 38px 1fr;
  gap: 8px;
  align-items: center;
  min-height: 44px;
  border: 1px solid #d7e3f1;
  border-radius: var(--radius-md);
  padding: 7px;
  background: #fff;
}

.faculty-option span {
  display: grid;
  place-items: center;
  min-height: 26px;
  border-radius: 6px;
  background: #edf4ff;
  color: var(--color-accent);
  font-size: 11px;
  font-weight: 900;
}

.faculty-option strong {
  color: var(--color-text);
  font-size: 11px;
  line-height: 1.2;
}
</style>
