<template>
  <div class="control-panel card shadow-sm">
    <div class="card-header bg-primary text-white">
      <h5 class="mb-0"><i class="bi bi-sliders"></i> Панель управления</h5>
    </div>
    <div class="card-body">
      <div class="mb-4">
        <label class="form-label fw-bold">Выбор факультета:</label>
        <select v-model="selectedFaculty" class="form-select" @change="onFacultyChange">
          <option value="all">Все факультеты</option>
          <option
            v-for="faculty in faculties"
            :key="faculty.faculty_id"
            :value="faculty.faculty_id"
          >
            {{ faculty.faculty }}
          </option>
        </select>
      </div>

      <div class="mb-4">
        <label class="form-label fw-bold">Семестр:</label>
        <div class="btn-group w-100">
          <button
            class="btn"
            :class="semester === 1 ? 'btn-primary' : 'btn-outline-primary'"
            @click="changeSemester(1)"
          >
            1 семестр
          </button>
          <button
            class="btn"
            :class="semester === 2 ? 'btn-primary' : 'btn-outline-primary'"
            @click="changeSemester(2)"
          >
            2 семестр
          </button>
          <button
            class="btn"
            :class="semester === 'all' ? 'btn-primary' : 'btn-outline-primary'"
            @click="changeSemester('all')"
          >
            Оба
          </button>
        </div>
      </div>

      <div class="mb-4">
        <label class="form-label fw-bold">Тип диаграммы:</label>
        <div class="btn-group w-100">
          <button
            class="btn"
            :class="chartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'"
            @click="changeChartType('bar')"
          >
            <i class="bi bi-bar-chart"></i> Столбчатая
          </button>
          <button
            class="btn"
            :class="chartType === 'line' ? 'btn-primary' : 'btn-outline-primary'"
            @click="changeChartType('line')"
          >
            <i class="bi bi-graph-up"></i> Линейная
          </button>
          <button
            class="btn"
            :class="chartType === 'radar' ? 'btn-primary' : 'btn-outline-primary'"
            @click="changeChartType('radar')"
          >
            <i class="bi bi-radar"></i> Радар
          </button>
        </div>
      </div>

      <div class="row">
        <div class="col-6 mb-3">
          <label class="form-label">Размер шрифта:</label>
          <input
            type="range"
            min="8"
            max="24"
            v-model="fontSize"
            class="form-range"
            @input="onSettingsChange"
          />
          <span class="badge bg-secondary">{{ fontSize }}px</span>
        </div>
        <div class="col-6 mb-3">
          <label class="form-label">Высота графика:</label>
          <input
            type="range"
            min="200"
            max="600"
            v-model="chartHeight"
            class="form-range"
            @input="onSettingsChange"
          />
          <span class="badge bg-secondary">{{ chartHeight }}px</span>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold">Цвет диаграммы:</label>
        <div class="d-flex gap-2 flex-wrap">
          <button
            v-for="(color, index) in colorPalette"
            :key="index"
            class="btn btn-sm"
            :style="{ backgroundColor: color, borderColor: color }"
            @click="changeColor(color)"
            :class="{ 'border-3': selectedColor === color }"
          ></button>
        </div>
      </div>

      <button class="btn btn-success w-100 mt-3" @click="loadData">
        <i class="bi bi-file-earmark-arrow-down"></i> Загрузить данные
      </button>
    </div>
  </div>
</template>

<script>
import colors from '@/assets/colors'

export default {
  name: 'ControlPanel',
  props: {
    faculties: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['faculty-change', 'semester-change', 'chart-type-change', 'settings-change', 'load-data'],
  data() {
    return {
      selectedFaculty: 'all',
      semester: 'all',
      chartType: 'bar',
      fontSize: 14,
      chartHeight: 400,
      selectedColor: colors.primary,
      colorPalette: [
        colors.primary,
        colors.secondary,
        colors.accent,
        colors.success,
        colors.warning,
        '#663399',
        '#FF6B6B',
      ],
    }
  },
  methods: {
    onFacultyChange() {
      this.$emit('faculty-change', this.selectedFaculty)
    },
    changeSemester(semester) {
      this.semester = semester
      this.$emit('semester-change', semester)
    },
    changeChartType(type) {
      this.chartType = type
      this.$emit('chart-type-change', type)
    },
    changeColor(color) {
      this.selectedColor = color
      this.onSettingsChange()
    },
    onSettingsChange() {
      this.$emit('settings-change', {
        fontSize: parseInt(this.fontSize),
        chartHeight: parseInt(this.chartHeight),
        color: this.selectedColor,
      })
    },
    loadData() {
      this.$emit('load-data')
    },
  },
}
</script>

<style scoped>
.control-panel {
  border-radius: 8px;
}
.btn {
  transition: all 0.3s;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.form-range {
  cursor: pointer;
}
</style>
