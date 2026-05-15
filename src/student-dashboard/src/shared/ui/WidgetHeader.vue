<template>
  <div class="widget-header">
    <div class="widget-title-icon">
      <i :class="icon"></i>
    </div>
    <div>
      <h3>{{ title }}</h3>
      <p>{{ subtitle }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WidgetHeader',
  props: {
    icon: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped>
.widget-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.widget-title-icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: #edf4ff;
  color: var(--color-accent);
}

h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0;
}

p {
  margin: 2px 0 0;
  color: var(--color-muted);
  font-size: 12px;
}
</style>
