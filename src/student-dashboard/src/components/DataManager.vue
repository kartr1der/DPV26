<template>
  <div class="data-manager">
    <div class="manager-header">
      <h3>Управление данными</h3>
      <button class="close-btn" @click="$emit('close')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    <div class="manager-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>    <!-- Факультеты -->    <div v-if="activeTab === 'faculties'" class="table-container">
      <div class="table-actions">
        <button class="add-btn" @click="addNewFaculty"><i class="bi bi-plus-lg"></i> Добавить факультет</button>
        <span class="hint">Столбцы: facultyId, faculty, year</span>
      </div>
      <table class="editable-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Год</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in customStore.faculties" :key="item.facultyId">
            <td>{{ item.facultyId }}</td>
            <td><input type="text" v-model="item.faculty" @blur="saveFaculty(item)" /></td>
            <td><input type="number" v-model="item.year" @blur="saveFaculty(item)" /></td>
            <td><button class="delete-btn" @click="deleteFaculty(item.facultyId)"><i class="bi bi-trash"></i></button></td>
          </tr>
        </tbody>
      </table>
    </div>    <!-- Успеваемость -->    <div v-if="activeTab === 'performance'" class="table-container">
      <div class="table-actions">
        <button class="add-btn" @click="addNewPerformance"><i class="bi bi-plus-lg"></i> Добавить запись</button>
        <span class="hint">Столбцы: id, facultyId, averageScore, studentsCount, semester, year</span>
      </div>
      <table class="editable-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>facultyId</th>
            <th>Ср. балл</th>
            <th>Студентов</th>
            <th>Семестр</th>
            <th>Год</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in customStore.performance" :key="item.id">
            <td>{{ item.id }}</td>
            <td><input type="number" v-model="item.facultyId" @blur="savePerformance(item)" /></td>
            <td><input type="number" step="0.01" v-model="item.averageScore" @blur="savePerformance(item)" /></td>
            <td><input type="number" v-model="item.studentsCount" @blur="savePerformance(item)" /></td>
            <td><input type="number" v-model="item.semester" @blur="savePerformance(item)" /></td>
            <td><input type="number" v-model="item.year" @blur="savePerformance(item)" /></td>
            <td><button class="delete-btn" @click="deletePerformance(item.id)"><i class="bi bi-trash"></i></button></td>
          </tr>
        </tbody>
      </table>
    </div>    <!-- Пользователи -->    <div v-if="activeTab === 'users'" class="table-container">
      <div class="table-actions">
        <button class="add-btn" @click="addNewUser"><i class="bi bi-plus-lg"></i> Добавить пользователя</button>
        <span class="hint">Столбцы: studentId, name, email, facultyId</span>
      </div>
      <table class="editable-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
            <th>facultyId</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in customStore.users" :key="item.studentId">
            <td>{{ item.studentId }}</td>
            <td><input type="text" v-model="item.name" @blur="saveUser(item)" /></td>
            <td><input type="email" v-model="item.email" @blur="saveUser(item)" /></td>
            <td><input type="number" v-model="item.facultyId" @blur="saveUser(item)" /></td>
            <td><button class="delete-btn" @click="deleteUser(item.studentId)"><i class="bi bi-trash"></i></button></td>
          </tr>
        </tbody>
      </table>
    </div>    <div class="manager-footer">
      <button class="primary-button" @click="applyChanges">Применить и обновить дашборд</button>
      <button class="secondary-button" @click="resetToBuiltin">Сбросить на встроенные данные</button>
    </div>
  </div>
</template><script>
import { useCustomDataStore } from '@/stores/customData'

export default {
  name: 'DataManager',
  emits: ['close', 'data-updated'],
  data() {
    return {
      activeTab: 'faculties',
      tabs: [
        { key: 'faculties', label: 'Факультеты' },
        { key: 'performance', label: 'Успеваемость' },
        { key: 'users', label: 'Пользователи' },
      ],
    }
  },
  setup() {
    const customStore = useCustomDataStore()
    return { customStore }
  },
  methods: {
    saveFaculty(faculty) {
      this.customStore.updateFaculty(faculty.facultyId, faculty)
    },
    savePerformance(record) {
      this.customStore.updatePerformance(record.id, record)
    },
    saveUser(user) {
      this.customStore.updateUser(user.studentId, user)
    },
    deleteFaculty(id) {
      if (confirm('Удалить факультет? Все связанные записи успеваемости также будут удалены.')) {
        this.customStore.deleteFaculty(id)
      }
    },
    deletePerformance(id) {
      if (confirm('Удалить запись успеваемости?')) {
        this.customStore.deletePerformance(id)
      }
    },
    deleteUser(id) {
      if (confirm('Удалить пользователя?')) {
        this.customStore.deleteUser(id)
      }
    },
    addNewFaculty() {
      this.customStore.addFaculty({
        faculty: 'Новый факультет',
        year: 2024,
      })
    },
    addNewPerformance() {
      this.customStore.addPerformance({
        facultyId: 1,
        averageScore: 4.0,
        studentsCount: 100,
        semester: 1,
        year: 2024,
      })
    },
    addNewUser() {
      this.customStore.addUser({
        name: 'Новый пользователь',
        email: 'new@example.com',
        facultyId: 1,
      })
    },
    applyChanges() {
      this.customStore.switchToCustom()
      this.$emit('data-updated')
      this.$emit('close')
    },
    resetToBuiltin() {
      if (confirm('Сбросить все пользовательские данные и вернуться к встроенным? Все изменения будут потеряны.')) {
        this.customStore.resetToBuiltin()
      }
    },
  },
}
</script><style scoped>
.data-manager {
  position: fixed;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}
.manager-header h3 {
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
.manager-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-muted);
}
.manager-tabs button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
}
.manager-tabs button.active {
  background: var(--color-accent);
  color: white;
}
.table-container {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
.table-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.add-btn {
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 6px 12px;
}
.editable-table {
  width: 100%;
  border-collapse: collapse;
}
.editable-table th, .editable-table td {
  border: 1px solid var(--color-border);
  padding: 8px;
  vertical-align: middle;
}
.editable-table input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px;
}
.delete-btn {
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
}
.manager-footer {
  padding: 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.hint {
  font-size: 12px;
  color: var(--color-muted);
}
</style>