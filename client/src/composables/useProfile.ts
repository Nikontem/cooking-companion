import { ref } from 'vue'
import { api } from '../api'
import type { TasteProfile, CookLogEntry } from '../types'

export function useProfile() {
  const profile = ref<TasteProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      profile.value = await api.getProfile()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function update(updates: Partial<TasteProfile>) {
    saving.value = true
    error.value = null
    try {
      profile.value = await api.updateProfile(updates)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      saving.value = false
    }
  }

  async function logCook(entry: CookLogEntry) {
    saving.value = true
    error.value = null
    try {
      await api.logCook(entry)
      await fetch()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      saving.value = false
    }
  }

  return { profile, loading, error, saving, fetch, update, logCook }
}
