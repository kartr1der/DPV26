import { defineStore } from 'pinia'

export const useCustomDataStore = defineStore('customData', {
state: () => ({
faculties: [],
performance: [],
users: [],
isUsingCustom: false, // флаг, что используем кастомные данные вместо встроенных
lastLoaded: null,
}),
getters: {
hasCustomData: (state) => state.faculties.length > 0,
},
actions: {
loadFromLocalStorage() {
const saved = localStorage.getItem('customDashboardData')
if (saved) {
try {
const data = JSON.parse(saved)
this.faculties = data.faculties || []
this.performance = data.performance || []
this.users = data.users || []
this.isUsingCustom = data.isUsingCustom || false
this.lastLoaded = data.lastLoaded || null
return true
} catch (e) {
console.error('Failed to load custom data from localStorage', e)
}
}
return false
},
saveToLocalStorage() {
const toSave = {
faculties: this.faculties,
performance: this.performance,
users: this.users,
isUsingCustom: this.isUsingCustom,
lastLoaded: this.lastLoaded || new Date().toISOString(),
}
localStorage.setItem('customDashboardData', JSON.stringify(toSave))
},
setCustomData({ faculties, performance, users }) {
this.faculties = faculties || []
this.performance = performance || []
this.users = users || []
this.isUsingCustom = true
this.lastLoaded = new Date().toISOString()
this.saveToLocalStorage()
},
addFaculty(faculty) {
const newId = Math.max(0, ...this.faculties.map(f => f.facultyId)) + 1
this.faculties.push({ ...faculty, facultyId: newId })
this.saveToLocalStorage()
},
updateFaculty(id, updated) {
const index = this.faculties.findIndex(f => f.facultyId === id)
if (index !== -1) {
this.faculties[index] = { ...this.faculties[index], ...updated }
this.saveToLocalStorage()
}
},
deleteFaculty(id) {
this.faculties = this.faculties.filter(f => f.facultyId !== id)
// также нужно удалить связанные записи успеваемости
this.performance = this.performance.filter(p => p.facultyId !== id)
this.saveToLocalStorage()
},
addPerformance(record) {
const newId = Math.max(0, ...this.performance.map(p => p.id)) + 1
this.performance.push({ ...record, id: newId })
this.saveToLocalStorage()
},
updatePerformance(id, updated) {
const index = this.performance.findIndex(p => p.id === id)
if (index !== -1) {
this.performance[index] = { ...this.performance[index], ...updated }
this.saveToLocalStorage()
}
},
deletePerformance(id) {
this.performance = this.performance.filter(p => p.id !== id)
this.saveToLocalStorage()
},
addUser(user) {
const newId = Math.max(0, ...this.users.map(u => u.studentId)) + 1
this.users.push({ ...user, studentId: newId })
this.saveToLocalStorage()
},
updateUser(id, updated) {
const index = this.users.findIndex(u => u.studentId === id)
if (index !== -1) {
this.users[index] = { ...this.users[index], ...updated }
this.saveToLocalStorage()
}
},
deleteUser(id) {
this.users = this.users.filter(u => u.studentId !== id)
this.saveToLocalStorage()
},
resetToBuiltin() {
this.faculties = []
this.performance = []
this.users = []
this.isUsingCustom = false
this.lastLoaded = null
localStorage.removeItem('customDashboardData')
// перезагрузим страницу, чтобы подхватились встроенные данные
window.location.reload()
},
switchToCustom() {
this.isUsingCustom = true
this.saveToLocalStorage()
},
},
})