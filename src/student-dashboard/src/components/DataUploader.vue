<template>
  <div class="data-uploader">
    <button class="upload-button" @click="triggerFileInput">
      <i class="bi bi-cloud-upload"></i> Загрузить данные
    </button>
    <input
      ref="fileInput"
      type="file"
      accept=".csv,.json"
      style="display: none"
      @change="handleFileUpload"
    />
  </div>
</template><script>
import * as XLSX from 'xlsx'
import { useCustomDataStore } from '@/stores/customData'

export default {
  name: 'DataUploader',
  emits: ['uploaded'],
  setup() {
    const customStore = useCustomDataStore()
    return { customStore }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      try {
        let data
        if (file.name.endsWith('.json')) {
          const text = await file.text()
          data = JSON.parse(text)
          if (data.faculties && data.performance && data.users) {
            this.customStore.setCustomData({
              faculties: data.faculties,
              performance: data.performance,
              users: data.users,
            })
            alert('Датасет загружен!')
            this.$emit('uploaded')
            return
          } else {
            alert('JSON должен содержать поля faculties, performance, users')
            return
          }
        } else if (file.name.endsWith('.csv')) {
          const text = await file.text()
          const parsed = this.parseMultiSectionCSV(text)
          if (parsed.faculties && parsed.performance && parsed.users) {
            this.customStore.setCustomData(parsed)
            alert('Датасет загружен!')
            this.$emit('uploaded')
            return
          } else {
            alert('Неверный формат CSV. Ожидаются секции #faculties, #performance, #users')
            return
          }
        } else {
          alert('Поддерживаются только CSV и JSON файлы')
          return
        }
      } catch (err) {
        console.error(err)
        alert('Ошибка при загрузке файла')
      } finally {
        event.target.value = ''
      }
    },
    parseMultiSectionCSV(text) {
      const sections = {
        faculties: [],
        performance: [],
        users: [],
      }
      const lines = text.split(/\r?\n/)
      let currentSection = null
      let headers = []

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim()
        if (line === '') continue
        if (line.startsWith('#faculties')) {
          currentSection = 'faculties'
          headers = []
          continue
        }
        if (line.startsWith('#performance')) {
          currentSection = 'performance'
          headers = []
          continue
        }
        if (line.startsWith('#users')) {
          currentSection = 'users'
          headers = []
          continue
        }
        if (!currentSection) continue

        const cells = line.split(';').map(c => c.trim())
        if (headers.length === 0) {
          headers = cells
          continue
        }
        const obj = {}
        headers.forEach((h, idx) => {
          let val = cells[idx] || ''
          // попробуем преобразовать в число, если возможно
          if (!isNaN(val) && val !== '') val = Number(val)
          obj[h] = val
        })
        sections[currentSection].push(obj)
      }
      // Приведение полей к нужному формату (как встроенный датасет)
      const faculties = sections.faculties.map(f => ({
        facultyId: Number(f.faculty_id),
        faculty: f.faculty,
        year: Number(f.year),
        createdAt: new Date().toISOString(),
      }))
      const performance = sections.performance.map(p => ({
        id: Number(p.id),
        facultyId: Number(p.faculty_id),
        averageScore: Number(p.average_score),
        studentsCount: Number(p.students_count),
        semester: Number(p.semester),
        year: Number(p.year),
        createdAt: new Date().toISOString(),
      }))
      const users = sections.users.map(u => ({
        studentId: Number(u.student_id),
        name: u.name,
        email: u.email,
        facultyId: Number(u.faculty_id),
        createdAt: new Date().toISOString(),
      }))
      return { faculties, performance, users }
    },
  },
}
</script><style scoped>
.upload-button {
  width: 100%;
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px;
  margin-top: 12px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}
.upload-button:hover {
  background: var(--color-surface);
}
</style>