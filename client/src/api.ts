import type { RecipeIndexEntry, Recipe, TasteProfile, CookLogEntry, Shelf, Appliances } from './types'

const BASE = '/api'

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.error || res.statusText)
  }
  return res.json()
}

export const api = {
  listRecipes: () =>
    request<RecipeIndexEntry[]>('/recipes'),

  getRecipe: (id: string) =>
    request<Recipe>(`/recipes/${encodeURIComponent(id)}`),

  searchRecipes: (q: string) =>
    request<RecipeIndexEntry[]>(`/recipes/search?q=${encodeURIComponent(q)}`),

  getProfile: () =>
    request<TasteProfile>('/profile'),

  updateProfile: (updates: Partial<TasteProfile>) =>
    request<TasteProfile>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  logCook: (entry: CookLogEntry) =>
    request<{ message: string }>('/profile/log', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  getShelf: () =>
    request<Shelf>('/shelf'),

  updateShelf: (updates: Partial<Shelf>) =>
    request<Shelf>('/shelf', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  addShelfCategory: (name: string) =>
    request<Shelf>('/shelf/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  removeShelfCategory: (name: string) =>
    request<Shelf>(`/shelf/categories/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    }),

  getAppliances: () =>
    request<Appliances>('/appliances'),

  updateAppliances: (updates: Partial<Appliances>) =>
    request<Appliances>('/appliances', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  addApplianceCategory: (name: string) =>
    request<Appliances>('/appliances/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  removeApplianceCategory: (name: string) =>
    request<Appliances>(`/appliances/categories/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    }),
}

export { ApiError }
