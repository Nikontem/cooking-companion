import { ref } from 'vue'
import { api } from '../api'
import type { Shelf } from '../types'

export function useShelf() {
  const shelf = ref<Shelf | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      shelf.value = await api.getShelf()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function update(updates: Partial<Shelf>) {
    saving.value = true
    error.value = null
    try {
      shelf.value = await api.updateShelf(updates)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      saving.value = false
    }
  }

  async function addCategory(name: string) {
    saving.value = true
    error.value = null
    try {
      shelf.value = await api.addShelfCategory(name)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      saving.value = false
    }
  }

  async function removeCategory(name: string) {
    saving.value = true
    error.value = null
    try {
      shelf.value = await api.removeShelfCategory(name)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      saving.value = false
    }
  }

  return { shelf, loading, error, saving, fetch, update, addCategory, removeCategory }
}
