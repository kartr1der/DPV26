<template>
  <section v-if="frame" class="panel inspector-card">
    <span class="eyebrow">Фрейм</span>
    <h2>Настройка виджета</h2>

    <label class="field">
      <span>Название</span>
      <input :value="frame.title" @input="patch({ title: $event.target.value })" />
    </label>

    <label class="field">
      <span>Тип диаграммы</span>
      <select :value="frame.widgetType" @change="patch({ widgetType: $event.target.value })">
        <option v-for="item in options.widgetTypes" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
    </label>

    <label class="field">
      <span>Данные</span>
      <select :value="frame.metric" @change="patch({ metric: $event.target.value })">
        <option v-for="item in options.metricOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
    </label>

    <label class="field">
      <span>Группировка</span>
      <select :value="frame.groupBy" @change="patch({ groupBy: $event.target.value })">
        <option v-for="item in options.groupByOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
    </label>

    <MultiFacultyFilter
      :faculties="options.faculties"
      :selected-ids="frame.facultyIds"
      @change="patch({ facultyIds: $event })"
    />
  </section>
</template>

<script>
import MultiFacultyFilter from '../multi-faculty-filter/MultiFacultyFilter.vue'

export default {
  name: 'FrameInspector',
  components: {
    MultiFacultyFilter,
  },
  props: {
    frame: {
      type: Object,
      default: null,
    },
    options: {
      type: Object,
      required: true,
    },
  },
  emits: ['patch-frame'],
  methods: {
    patch(patch) {
      this.$emit('patch-frame', patch)
    },
  },
}
</script>

<style scoped>
.inspector-card {
  padding: 16px;
  margin-bottom: 14px;
}

h2 {
  margin: 2px 0 12px;
  font-size: 20px;
  font-weight: 800;
}

.field {
  display: grid;
  gap: 7px;
  margin-bottom: 13px;
}

.field span {
  color: #526174;
  font-size: 12px;
  font-weight: 800;
}

.field input,
.field select {
  width: 100%;
  min-height: 38px;
  border: 1px solid #ccd8e5;
  border-radius: var(--radius-md);
  padding: 8px 10px;
  background: #fff;
  color: var(--color-text);
  font-size: 13px;
}
</style>
