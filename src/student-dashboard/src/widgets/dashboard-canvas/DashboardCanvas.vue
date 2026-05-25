<template>
  <section ref="canvas" class="dashboard-canvas" aria-label="Рабочая область дашборда">
    <div class="canvas-header">
      <div>
        <p>{{ formattedDate }}</p>
        <h2>Аналитика по факультетам и семестрам</h2>
      </div>
      <div class="canvas-header-actions">
        <span>{{ template.name }}</span>
        <div data-html2canvas-ignore="true">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>

    <div class="canvas-grid">
      <FrameSlot
        v-for="frame in frames"
        :key="frame.id"
        :frame="frame"
        :options="options"
        :active="frame.id === activeFrameId"
        @select="$emit('select-frame', $event)"
        @patch-frame="$emit('patch-frame', $event)"
      />
    </div>
  </section>
</template>

<script>
import FrameSlot from '../frame-slot/FrameSlot.vue'

export default {
  name: 'DashboardCanvas',
  components: {
    FrameSlot,
  },
  props: {
    template: {
      type: Object,
      required: true,
    },
    frames: {
      type: Array,
      required: true,
    },
    activeFrameId: {
      type: String,
      default: null,
    },
    options: {
      type: Object,
      required: true,
    },
  },
  emits: ['select-frame', 'patch-frame'],
  computed: {
    formattedDate() {
      return new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    },
  },
}
</script>

<style scoped>
.dashboard-canvas {
  min-width: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px;
  background: #f8fbff;
}

.canvas-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
  border: 1px solid #dbe6f2;
  border-radius: var(--radius-md);
  padding: 12px;
  background: #fff;
}

.canvas-header > div:first-child {
  min-width: 0;
}

.canvas-header p {
  margin: 0;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.canvas-header h2 {
  margin: 2px 0 0;
  font-size: 24px;
  font-weight: 900;
}

.canvas-header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
}

.canvas-header-actions span {
  color: #111827;
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
}

.canvas-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 1180px) {
  .canvas-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .canvas-header {
    flex-direction: column;
  }

  .canvas-header-actions {
    justify-content: flex-start;
  }
}

@media print {
  .dashboard-canvas {
    border: 0;
  }
}
</style>
