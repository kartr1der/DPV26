<template>
  <section class="kpi-grid" aria-label="Ключевые показатели">
    <article v-for="kpi in items" :key="kpi.title" class="panel kpi-tile">
      <div class="kpi-icon" :class="kpi.tone">
        <i :class="kpi.icon"></i>
      </div>
      <div>
        <span>{{ kpi.title }}</span>
        <strong>{{ kpi.value }}</strong>
        <small :class="kpi.deltaTone">{{ kpi.delta }}</small>
      </div>
    </article>
  </section>
</template>

<script>
export default {
  name: 'KpiGrid',
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
}
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.kpi-tile {
  min-height: 116px;
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 13px;
  align-items: center;
  padding: 16px;
}

.kpi-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  color: #fff;
}

.kpi-icon.blue {
  background: var(--color-accent);
}

.kpi-icon.cyan {
  background: var(--color-cyan);
}

.kpi-icon.violet {
  background: var(--color-violet);
}

.kpi-icon.amber {
  background: var(--color-amber);
}

.kpi-tile span {
  display: block;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 800;
}

.kpi-tile strong {
  display: block;
  margin: 4px 0;
  font-size: 28px;
  line-height: 1;
}

.kpi-tile small {
  font-weight: 800;
}

.positive {
  color: var(--color-success);
}

.negative {
  color: var(--color-danger);
}

.neutral {
  color: var(--color-muted);
}

@media (max-width: 1180px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
