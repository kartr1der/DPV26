import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
state: () => ({
user: null,
token: null,
isAuthenticated: false
}),
getters: {
isAdmin: (state) => state.user?.role === 'admin'
},
actions: {
// Заглушка для входа (имитация API)
async login(email, password) {
// В реальном проекте здесь был бы запрос к API
if (email === 'admin@example.com' && password === 'admin') {
const user = {
id: 1,
email: 'admin@example.com',
name: 'Администратор',
role: 'admin'
}
this.user = user
this.token = 'fake-jwt-token'
this.isAuthenticated = true
localStorage.setItem('auth_token', 'true')
localStorage.setItem('user', JSON.stringify(user))
return { success: true }
} else if (email === 'user@example.com' && password === 'user') {
const user = {
id: 2,
email: 'user@example.com',
name: 'Пользователь',
role: 'user'
}
this.user = user
this.token = 'fake-jwt-token'
this.isAuthenticated = true
localStorage.setItem('auth_token', 'true')
localStorage.setItem('user', JSON.stringify(user))
return { success: true }
} else {
return { success: false, error: 'Неверный email или пароль' }
}
},
logout() {
this.user = null
this.token = null
this.isAuthenticated = false
localStorage.removeItem('auth_token')
localStorage.removeItem('user')
},
// Восстановление сессии при загрузке приложения
restoreSession() {
const token = localStorage.getItem('auth_token')
const userStr = localStorage.getItem('user')
if (token === 'true' && userStr) {
try {
const user = JSON.parse(userStr)
this.user = user
this.token = 'fake-jwt-token'
this.isAuthenticated = true
} catch (e) {
this.logout()
}
}
}
}
})