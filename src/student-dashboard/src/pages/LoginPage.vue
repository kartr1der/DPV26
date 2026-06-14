<template>
  <div class="login-page">
    <div class="login-card panel">
      <div class="login-header">
        <div class="brand-mark">ТИУ</div>
        <h1>Вход в систему</h1>
        <p>Дашборд успеваемости</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label>Email</label>
          <input type="email" v-model="email" placeholder="admin@example.com" required />
        </div>
        <div class="field">
          <label>Пароль</label>
          <input type="password" v-model="password" placeholder="••••••" required />
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <button type="submit" class="primary-button" :disabled="loading">
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
      <div class="demo-info">
        <p>Тестовые учётные записи:</p>
        <ul>
          <li><strong>Администратор:</strong> admin@example.com / admin</li>
          <li><strong>Пользователь:</strong> user@example.com / user</li>
        </ul>
      </div>
    </div>
  </div>
</template><script>
import { useUserStore } from '@/stores/user'

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.errorMessage = ''
      const userStore = useUserStore()
      const result = await userStore.login(this.email, this.password)
      if (result.success) {
        this.$router.push('/')
      } else {
        this.errorMessage = result.error || 'Ошибка входа'
      }
      this.loading = false
    }
  }
}
</script><style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-bg);
  padding: 20px;
}
.login-card {
  max-width: 440px;
  width: 100%;
  padding: 32px 28px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
}
.login-header {
  text-align: center;
  margin-bottom: 28px;
}
.brand-mark {
  display: inline-block;
  background: #172f65;
  color: #fff;
  padding: 8px 20px;
  border-radius: 40px;
  font-weight: 800;
  margin-bottom: 16px;
}
.login-header h1 {
  margin: 8px 0 4px;
  font-size: 28px;
  font-weight: 800;
}
.login-header p {
  color: var(--color-muted);
}
.field {
  margin-bottom: 20px;
}
.field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 700;
  color: var(--color-text);
}
.field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: #fff;
}
.error-message {
  background: #fde8e4;
  color: #a34337;
  padding: 10px;
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  font-size: 13px;
}
.primary-button {
  width: 100%;
  background: var(--color-accent);
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: var(--radius-md);
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
}
.primary-button:hover {
  background: #0f62d2;
}
.demo-info {
  margin-top: 20px;
  font-size: 12px;
  color: var(--color-muted);
  background: var(--color-surface-muted);
  padding: 12px;
  border-radius: var(--radius-md);
}
.demo-info ul {
  margin: 8px 0 0;
  padding-left: 20px;
}
.demo-info li {
  margin: 4px 0;
}
</style>