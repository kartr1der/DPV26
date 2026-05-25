<template>
  <section class="panel builder-card">
    <span class="eyebrow">Шаблон</span>
    <h2>Конфигурация фреймов</h2>

    <div class="template-list">
      <button
        v-for="template in templates"
        :key="template.id"
        type="button"
        class="template-button"
        :class="{ active: template.id === activeTemplateId }"
        @click="$emit('select-template', template.id)"
      >
        <strong>{{ template.name }}</strong>
        <span>{{ template.description }}</span>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TemplateSelector',
  props: {
    templates: {
      type: Array,
      required: true,
    },
    activeTemplateId: {
      type: String,
      required: true,
    },
  },
  emits: ['select-template'],
}
</script>

<style scoped>
.builder-card {
  padding: 16px;
  margin-bottom: 14px;
}

h2 {
  margin: 2px 0 12px;
  font-size: 20px;
  font-weight: 800;
}

.template-list {
  display: grid;
  gap: 8px;
}

.template-button {
  display: grid;
  gap: 3px;
  width: 100%;
  min-height: 62px;
  border: 1px solid #d7e3f1;
  border-radius: var(--radius-md);
  padding: 10px;
  background: #fff;
  color: var(--color-text);
  text-align: left;
}

.template-button.active {
  border-color: var(--color-accent);
  background: #edf4ff;
  box-shadow: 0 8px 18px rgba(31, 122, 236, 0.14);
}

.template-button strong {
  font-size: 13px;
}

.template-button span {
  color: var(--color-muted);
  font-size: 11px;
  line-height: 1.25;
}
</style>
