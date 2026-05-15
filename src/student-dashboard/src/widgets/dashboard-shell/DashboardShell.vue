<template>
  <div class="dashboard-shell">
    <slot name="sidebar" />
    <main class="dashboard-main">
      <slot />
    </main>
  </div>
</template>

<script>
export default {
  name: 'DashboardShell',
}
</script>

<style scoped>
.dashboard-shell {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  min-height: 100vh;
  background: var(--color-bg);
}

.dashboard-main {
  min-width: 0;
  padding: 18px;
}

@media (max-width: 1180px) {
  .dashboard-shell {
    grid-template-columns: 260px minmax(0, 1fr);
  }
}

@media (max-width: 820px) {
  .dashboard-shell {
    display: block;
  }
}
</style>
