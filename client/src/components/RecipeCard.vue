<script setup lang="ts">
import type { RecipeIndexEntry } from '../types'
import TagBadge from './TagBadge.vue'

defineProps<{
  recipe: RecipeIndexEntry
}>()
</script>

<template>
  <RouterLink :to="`/recipe/${recipe.id}`" class="card">
    <div class="card-body">
      <h3 class="name">{{ recipe.name }}</h3>
      <p v-if="recipe.name_en" class="name-en">{{ recipe.name_en }}</p>
      <div class="tags">
        <TagBadge :label="recipe.category" variant="category" />
        <TagBadge
          v-for="tag in recipe.tags"
          :key="tag"
          :label="tag"
        />
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  display: block;
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: var(--space-lg);
  transition: box-shadow 0.2s, transform 0.2s;
  color: inherit;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.name {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.name-en {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}
</style>
