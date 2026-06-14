<template>
<router-view />
</template>
<script>
import { useUserStore } from '@/stores/user'

export default {
  name: 'App',
  created() {
    const userStore = useUserStore()
    userStore.restoreSession()
  }
}
</script><style>
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';
/* остальные глобальные стили уже подключены в main.js или через @import */
</style>