import { ref } from 'vue'
import { api } from '../api'
import type { RecipeIndexEntry, Recipe } from '../types'

export function useRecipes() {
  const recipes = ref<RecipeIndexEntry[]>([])
  const recipe = ref<Recipe | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      recipes.value = await api.listRecipes()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string) {
    loading.value = true
    error.value = null
    try {
      recipe.value = await api.getRecipe(id)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function search(query: string) {
    loading.value = true
    error.value = null
    try {
      recipes.value = await api.searchRecipes(query)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  return { recipes, recipe, loading, error, fetchAll, fetchOne, search }
}
