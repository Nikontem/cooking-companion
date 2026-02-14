<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink to="/" class="logo">Cooking Companion</RouterLink>
      <nav class="nav">
        <RouterLink to="/" class="nav-link">Συνταγές</RouterLink>
        <RouterLink to="/shelf" class="nav-link">Αποθήκη</RouterLink>
        <RouterLink to="/appliances" class="nav-link">Η Κουζίνα μου</RouterLink>
        <RouterLink to="/chat" class="nav-link">Chat</RouterLink>
        <RouterLink to="/profile" class="nav-link">Προφίλ</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.logo:hover {
  color: var(--color-primary-light);
}

.nav {
  display: flex;
  gap: var(--space-lg);
}

.nav-link {
  color: var(--color-text-secondary);
  font-weight: 500;
  padding: var(--space-xs) 0;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
</style>
