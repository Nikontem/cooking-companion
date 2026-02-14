<script setup lang="ts">
import { ref, watch } from 'vue'

const emit = defineEmits<{
  search: [query: string]
}>()

const query = ref('')
let timeout: ReturnType<typeof setTimeout> | null = null

watch(query, (val) => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    emit('search', val.trim())
  }, 300)
})
</script>

<template>
  <div class="search-bar">
    <input
      v-model="query"
      type="text"
      placeholder="Αναζήτηση συνταγών..."
      class="search-input"
    />
  </div>
</template>

<style scoped>
.search-bar {
  margin-bottom: var(--space-lg);
}

.search-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--color-primary);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}
</style>
