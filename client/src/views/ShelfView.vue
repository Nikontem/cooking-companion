<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useShelf } from '../composables/useShelf'
import type { ShelfIngredient } from '../types'

const { shelf, loading, error, saving, fetch, update, addCategory, removeCategory } = useShelf()

// Local spices state
const spices = ref<string[]>([])
const newSpice = ref('')

// New category input
const newCategoryName = ref('')
const showNewCategory = ref(false)

// Local category edits: keyed by category name
const categoryEdits = reactive<Record<string, ShelfIngredient[]>>({})
const newIngredients = reactive<Record<string, { name: string; quantity: string; unit: string }>>({})

// Sync shelf data to local state
watch(shelf, (s) => {
  if (!s) return
  spices.value = [...s.spices]
  for (const cat of s.categories) {
    categoryEdits[cat.name] = cat.ingredients.map(i => ({ ...i }))
    if (!newIngredients[cat.name]) {
      newIngredients[cat.name] = { name: '', quantity: '', unit: '' }
    }
  }
})

function addSpice() {
  const val = newSpice.value.trim()
  if (!val || spices.value.includes(val)) return
  spices.value.push(val)
  newSpice.value = ''
}

function removeSpice(index: number) {
  spices.value.splice(index, 1)
}

function saveSpices() {
  update({ spices: spices.value })
}

async function handleAddCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return
  await addCategory(name)
  newCategoryName.value = ''
  showNewCategory.value = false
}

async function handleRemoveCategory(name: string) {
  await removeCategory(name)
  delete categoryEdits[name]
  delete newIngredients[name]
}

function addIngredient(categoryName: string) {
  const input = newIngredients[categoryName]
  if (!input?.name.trim()) return
  if (!categoryEdits[categoryName]) categoryEdits[categoryName] = []
  categoryEdits[categoryName].push({
    name: input.name.trim(),
    quantity: input.quantity ? Number(input.quantity) : undefined,
    unit: input.unit.trim() || undefined,
  })
  newIngredients[categoryName] = { name: '', quantity: '', unit: '' }
}

function removeIngredient(categoryName: string, index: number) {
  categoryEdits[categoryName]?.splice(index, 1)
}

function saveCategory(categoryName: string) {
  if (!shelf.value) return
  const updatedCategories = shelf.value.categories.map(cat => {
    if (cat.name === categoryName) {
      return { ...cat, ingredients: categoryEdits[categoryName] || [] }
    }
    return cat
  })
  update({ categories: updatedCategories })
}

onMounted(fetch)
</script>

<template>
  <div class="shelf-view">
    <h1 class="page-title">Αποθήκη</h1>

    <p v-if="loading" class="status">Φόρτωση...</p>
    <p v-else-if="error" class="status error">{{ error }}</p>

    <template v-else-if="shelf">
      <!-- Spices Section -->
      <section class="shelf-section">
        <div class="section-header-row">
          <h2 class="section-title">Μπαχαρικά</h2>
          <button class="save-btn" :disabled="saving" @click="saveSpices">
            {{ saving ? 'Αποθήκευση...' : 'Αποθήκευση' }}
          </button>
        </div>
        <p class="section-hint">Μόνο ονόματα — οι ποσότητες δεν μετράνε στα μπαχαρικά</p>

        <div class="tag-list">
          <span v-for="(spice, i) in spices" :key="i" class="tag-item">
            {{ spice }}
            <button class="tag-remove" @click="removeSpice(i)">&times;</button>
          </span>
        </div>
        <div class="tag-input-row">
          <input
            v-model="newSpice"
            placeholder="Προσθήκη μπαχαρικού..."
            @keydown.enter="addSpice"
          />
          <button class="add-btn" @click="addSpice">+</button>
        </div>
      </section>

      <!-- Categories -->
      <section class="shelf-section">
        <div class="section-header-row">
          <h2 class="section-title">Κατηγορίες</h2>
          <button class="new-category-btn" @click="showNewCategory = !showNewCategory">
            {{ showNewCategory ? 'Ακύρωση' : '+ Νέα Κατηγορία' }}
          </button>
        </div>

        <!-- New category input -->
        <div v-if="showNewCategory" class="new-category-form">
          <input
            v-model="newCategoryName"
            placeholder="Όνομα κατηγορίας (π.χ. Κρέατα, Γαλακτοκομικά)..."
            @keydown.enter="handleAddCategory"
          />
          <button class="add-btn" :disabled="!newCategoryName.trim() || saving" @click="handleAddCategory">
            Δημιουργία
          </button>
        </div>

        <!-- Each category -->
        <div v-for="cat in shelf.categories" :key="cat.name" class="category-card">
          <div class="category-header">
            <h3 class="category-name">{{ cat.name }}</h3>
            <div class="category-actions">
              <button class="save-btn small" :disabled="saving" @click="saveCategory(cat.name)">
                Αποθήκευση
              </button>
              <button class="delete-btn" @click="handleRemoveCategory(cat.name)" title="Διαγραφή κατηγορίας">
                &times;
              </button>
            </div>
          </div>

          <!-- Ingredients table -->
          <table v-if="categoryEdits[cat.name]?.length" class="ingredients-table">
            <thead>
              <tr>
                <th>Υλικό</th>
                <th>Ποσότητα</th>
                <th>Μονάδα</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ing, i) in categoryEdits[cat.name]" :key="i">
                <td>
                  <input v-model="ing.name" class="cell-input name-input" />
                </td>
                <td>
                  <input
                    :value="ing.quantity ?? ''"
                    type="number"
                    min="0"
                    step="any"
                    class="cell-input qty-input"
                    @input="ing.quantity = ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined"
                  />
                </td>
                <td>
                  <input v-model="ing.unit" class="cell-input unit-input" placeholder="g, kg, lt..." />
                </td>
                <td>
                  <button class="row-remove" @click="removeIngredient(cat.name, i)">&times;</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="empty-category">Δεν υπάρχουν υλικά ακόμα.</div>

          <!-- Add ingredient row -->
          <div v-if="newIngredients[cat.name]" class="add-ingredient-row">
            <input
              v-model="newIngredients[cat.name]!.name"
              class="cell-input name-input"
              placeholder="Νέο υλικό..."
              @keydown.enter="addIngredient(cat.name)"
            />
            <input
              v-model="newIngredients[cat.name]!.quantity"
              type="number"
              min="0"
              step="any"
              class="cell-input qty-input"
              placeholder="Ποσ."
              @keydown.enter="addIngredient(cat.name)"
            />
            <input
              v-model="newIngredients[cat.name]!.unit"
              class="cell-input unit-input"
              placeholder="Μον."
              @keydown.enter="addIngredient(cat.name)"
            />
            <button class="add-btn" @click="addIngredient(cat.name)">+</button>
          </div>
        </div>

        <div v-if="!shelf.categories.length" class="empty-state">
          <p>Δεν υπάρχουν κατηγορίες ακόμα.</p>
          <p class="hint">Δημιούργησε μία για να αρχίσεις! (π.χ. Κρέατα, Λαχανικά, Γαλακτοκομικά)</p>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: var(--space-lg);
}

.status {
  text-align: center;
  color: var(--color-text-secondary);
  padding: var(--space-xl) 0;
}

.error {
  color: var(--color-primary);
}

.shelf-section {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
}

.section-hint {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-style: italic;
  margin-bottom: var(--space-md);
}

/* Tag editor (spices) */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 14px;
  background: var(--color-tag-bg);
  font-size: 0.85rem;
}

.tag-remove {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1;
  padding: 0 2px;
  cursor: pointer;
}

.tag-remove:hover {
  color: var(--color-primary);
}

.tag-input-row {
  display: flex;
  gap: var(--space-xs);
}

.tag-input-row input {
  flex: 1;
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
}

.tag-input-row input:focus {
  border-color: var(--color-primary);
}

/* Buttons */
.save-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-btn.small {
  padding: var(--space-xs) var(--space-md);
  font-size: 0.85rem;
}

.add-btn {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}

.add-btn:hover:not(:disabled) {
  background: #219a52;
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.new-category-btn {
  padding: var(--space-xs) var(--space-md);
  background: none;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.new-category-btn:hover {
  background: var(--color-accent);
  color: white;
}

.new-category-form {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
}

.new-category-form input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
}

.new-category-form input:focus {
  border-color: var(--color-primary);
}

.new-category-form .add-btn {
  padding: var(--space-sm) var(--space-md);
  font-size: 0.9rem;
  font-weight: 600;
}

/* Category cards */
.category-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--space-md);
  margin-bottom: var(--space-md);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.category-name {
  font-size: 1.05rem;
  font-weight: 600;
}

.category-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.delete-btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  line-height: 1;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.delete-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Ingredients table */
.ingredients-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-sm);
}

.ingredients-table th {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: var(--space-xs) var(--space-xs);
  border-bottom: 2px solid var(--color-border);
}

.ingredients-table td {
  padding: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
}

.ingredients-table th:last-child,
.ingredients-table td:last-child {
  width: 2rem;
  text-align: center;
}

.cell-input {
  width: 100%;
  padding: var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  font-size: 0.9rem;
  background: white;
}

.cell-input:focus {
  border-color: var(--color-primary);
}

.name-input {
  min-width: 120px;
}

.qty-input {
  width: 80px;
}

.unit-input {
  width: 70px;
}

.row-remove {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0 4px;
}

.row-remove:hover {
  color: var(--color-primary);
}

.empty-category {
  color: var(--color-text-secondary);
  font-style: italic;
  font-size: 0.9rem;
  padding: var(--space-sm) 0;
}

/* Add ingredient row */
.add-ingredient-row {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
  margin-top: var(--space-sm);
}

.add-ingredient-row .name-input {
  flex: 1;
}

.add-ingredient-row .qty-input {
  width: 80px;
}

.add-ingredient-row .unit-input {
  width: 70px;
}

.empty-state {
  text-align: center;
  padding: var(--space-xl) 0;
  color: var(--color-text-secondary);
}

.empty-state p {
  margin-bottom: var(--space-xs);
}

.hint {
  font-size: 0.85rem;
  font-style: italic;
}
</style>
