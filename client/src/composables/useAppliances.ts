import { ref } from 'vue'
import { api } from '../api'
import type { Appliances } from '../types'

export function useAppliances() {
  const appliances = ref<Appliances | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      appliances.value = await api.getAppliances()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function update(updates: Partial<Appliances>) {
    saving.value = true
    error.value = null
    try {
      appliances.value = await api.updateAppliances(updates)
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
      appliances.value = await api.addApplianceCategory(name)
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
      appliances.value = await api.removeApplianceCategory(name)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      saving.value = false
    }
  }

  return { appliances, loading, error, saving, fetch, update, addCategory, removeCategory }
}
