import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import DashboardPage from '@/pages/dashboard/DashboardPage.vue'

const routes = [
{
path: '/login',
name: 'Login',
component: LoginPage,
meta: { requiresAuth: false }
},
{
path: '/',
name: 'Dashboard',
component: DashboardPage,
meta: { requiresAuth: true }
},
// fallback – любая другая страница ведёт на дашборд (с проверкой)
{
path: '/:pathMatch(.*)*',
redirect: '/'
}
]

const router = createRouter({
history: createWebHistory(),
routes
})

// Глобальный страж для защиты маршрутов
router.beforeEach((to, from, next) => {
const isAuthenticated = localStorage.getItem('auth_token') === 'true'
if (to.meta.requiresAuth && !isAuthenticated) {
next('/login')
} else if (to.path === '/login' && isAuthenticated) {
next('/')
} else {
next()
}
})

export default router