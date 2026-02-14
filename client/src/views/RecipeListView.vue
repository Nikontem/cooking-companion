<script setup lang="ts">
import { onMounted } from 'vue'
import { useRecipes } from '../composables/useRecipes'
import SearchBar from '../components/SearchBar.vue'
import RecipeCard from '../components/RecipeCard.vue'

const { recipes, loading, error, fetchAll, search } = useRecipes()

function onSearch(query: string) {
  if (query) {
    search(query)
  } else {
    fetchAll()
  }
}

onMounted(fetchAll)
</script>

<template>
  <div class="recipe-list">
    <h1 class="page-title">Συνταγές</h1>
    <SearchBar @search="onSearch" />

    <p v-if="loading" class="status">Φόρτωση...</p>
    <p v-else-if="error" class="status error">{{ error }}</p>
    <p v-else-if="recipes.length === 0" class="status">Δεν βρέθηκαν συνταγές.</p>

    <div v-else class="grid">
      <RecipeCard
        v-for="r in recipes"
        :key="r.id"
        :recipe="r"
      />
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: var(--space-lg);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.status {
  text-align: center;
  color: var(--color-text-secondary);
  padding: var(--space-xl) 0;
}

.error {
  color: var(--color-primary);
}
</style>
