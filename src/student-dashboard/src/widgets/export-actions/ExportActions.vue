<template>
  <div class="export-actions">
    <button type="button" :disabled="disabled" @click="$emit('excel')">
      <i class="bi bi-file-earmark-excel"></i>
      Excel
    </button>
    <button type="button" :disabled="disabled" @click="$emit('pdf')">
      <i class="bi bi-file-earmark-pdf"></i>
      PDF
    </button>
  </div>
</template>

<script>
export default {
  name: 'ExportActions',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['excel', 'pdf'],
}
</script>

<style scoped>
.export-actions {
  display: flex;
  gap: 8px;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 13px;
  border: 0;
  border-radius: var(--radius-md);
  background: #172f65;
  color: #fff;
  font-weight: 800;
}

@media (max-width: 820px) {
  .export-actions {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
  }
}
</style>
