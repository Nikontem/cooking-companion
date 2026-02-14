<script setup lang="ts">
import type { Ingredient } from '../types'

defineProps<{
  group: string
  ingredients: Ingredient[]
}>()
</script>

<template>
  <div class="ingredient-group">
    <h4 class="group-name">{{ group }}</h4>
    <ul class="ingredient-list">
      <li v-for="(ing, i) in ingredients" :key="i" class="ingredient">
        <span class="ing-main">
          <span v-if="ing.amount" class="amount">{{ ing.amount }}</span>
          <span v-if="ing.unit" class="unit">{{ ing.unit }}</span>
          <span class="name">{{ ing.name }}</span>
          <span v-if="ing.optional" class="optional">προαιρετικό</span>
        </span>
        <span v-if="ing.notes" class="notes">{{ ing.notes }}</span>
        <span v-if="ing.substitutions?.length" class="subs">
          Αντικατάσταση: {{ ing.substitutions.join(', ') }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ingredient-group {
  margin-bottom: var(--space-md);
}

.group-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
}

.ingredient-list {
  list-style: none;
}

.ingredient {
  padding: var(--space-xs) 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ingredient + .ingredient {
  border-top: 1px solid #f0ebe3;
}

.ing-main {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.amount {
  font-weight: 600;
  min-width: 2.5rem;
}

.unit {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.name {
  font-weight: 500;
}

.optional {
  font-size: 0.75rem;
  color: var(--color-warm);
  font-style: italic;
}

.notes {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-style: italic;
  padding-left: 2.5rem;
}

.subs {
  font-size: 0.8rem;
  color: var(--color-olive);
  padding-left: 2.5rem;
}
</style>
