<script setup lang="ts">
defineProps<{
  label: string
  variant?: 'default' | 'category'
}>()
</script>

<template>
  <span class="tag" :class="variant || 'default'">{{ label }}</span>
</template>

<style scoped>
.tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.6;
}

.default {
  background: var(--color-tag-bg);
  color: var(--color-text-secondary);
}

.category {
  background: var(--color-primary);
  color: white;
}
</style>
