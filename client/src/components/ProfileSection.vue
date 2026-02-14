<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
  saving?: boolean
}>()

const emit = defineEmits<{
  save: []
}>()

const open = ref(true)
</script>

<template>
  <section class="profile-section">
    <button class="section-header" @click="open = !open">
      <h3 class="section-title">{{ title }}</h3>
      <span class="toggle">{{ open ? '−' : '+' }}</span>
    </button>
    <div v-if="open" class="section-body">
      <slot />
      <div class="section-footer">
        <button class="save-btn" :disabled="saving" @click="emit('save')">
          {{ saving ? 'Αποθήκευση...' : 'Αποθήκευση' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-section {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.section-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  background: none;
  border: none;
  text-align: left;
}

.section-header:hover {
  background: #faf7f2;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.toggle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  font-weight: 300;
}

.section-body {
  padding: 0 var(--space-lg) var(--space-lg);
}

.section-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-md);
}

.save-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: background 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.save-btn:disabled {
  opacity: 0.6;
}
</style>
