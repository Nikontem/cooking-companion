<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useAppliances } from '../composables/useAppliances'
import type { Appliance } from '../types'

const { appliances, loading, error, saving, fetch, update, addCategory, removeCategory } = useAppliances()

// New category input
const newCategoryName = ref('')
const showNewCategory = ref(false)

// Local category edits: keyed by category name
const categoryEdits = reactive<Record<string, Appliance[]>>({})
const newAppliances = reactive<Record<string, { name: string; notes: string }>>({})

// Sync appliances data to local state
watch(appliances, (a) => {
  if (!a) return
  for (const cat of a.categories) {
    categoryEdits[cat.name] = cat.appliances.map(ap => ({ ...ap }))
    if (!newAppliances[cat.name]) {
      newAppliances[cat.name] = { name: '', notes: '' }
    }
  }
})

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
  delete newAppliances[name]
}

function addAppliance(categoryName: string) {
  const input = newAppliances[categoryName]
  if (!input?.name.trim()) return
  if (!categoryEdits[categoryName]) categoryEdits[categoryName] = []
  categoryEdits[categoryName].push({
    name: input.name.trim(),
    notes: input.notes.trim() || undefined,
  })
  newAppliances[categoryName] = { name: '', notes: '' }
}

function removeAppliance(categoryName: string, index: number) {
  categoryEdits[categoryName]?.splice(index, 1)
}

function saveCategory(categoryName: string) {
  if (!appliances.value) return
  const updatedCategories = appliances.value.categories.map(cat => {
    if (cat.name === categoryName) {
      return { ...cat, appliances: categoryEdits[categoryName] || [] }
    }
    return cat
  })
  update({ categories: updatedCategories })
}

onMounted(fetch)
</script>

<template>
  <div class="appliances-view">
    <h1 class="page-title">Η Κουζίνα μου</h1>

    <p v-if="loading" class="status">Φόρτωση...</p>
    <p v-else-if="error" class="status error">{{ error }}</p>

    <template v-else-if="appliances">
      <section class="appliances-section">
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
            placeholder="Όνομα κατηγορίας (π.χ. Ηλεκτρικές Συσκευές, Μαγειρικά Σκεύη)..."
            @keydown.enter="handleAddCategory"
          />
          <button class="add-btn" :disabled="!newCategoryName.trim() || saving" @click="handleAddCategory">
            Δημιουργία
          </button>
        </div>

        <!-- Each category -->
        <div v-for="cat in appliances.categories" :key="cat.name" class="category-card">
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

          <!-- Appliances table -->
          <table v-if="categoryEdits[cat.name]?.length" class="appliances-table">
            <thead>
              <tr>
                <th>Συσκευή</th>
                <th>Σημειώσεις</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ap, i) in categoryEdits[cat.name]" :key="i">
                <td>
                  <input v-model="ap.name" class="cell-input name-input" />
                </td>
                <td>
                  <input v-model="ap.notes" class="cell-input notes-input" placeholder="Προαιρετικά..." />
                </td>
                <td>
                  <button class="row-remove" @click="removeAppliance(cat.name, i)">&times;</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="empty-category">Δεν υπάρχουν συσκευές ακόμα.</div>

          <!-- Add appliance row -->
          <div v-if="newAppliances[cat.name]" class="add-appliance-row">
            <input
              v-model="newAppliances[cat.name]!.name"
              class="cell-input name-input"
              placeholder="Νέα συσκευή..."
              @keydown.enter="addAppliance(cat.name)"
            />
            <input
              v-model="newAppliances[cat.name]!.notes"
              class="cell-input notes-input"
              placeholder="Σημειώσεις (προαιρετικά)..."
              @keydown.enter="addAppliance(cat.name)"
            />
            <button class="add-btn" @click="addAppliance(cat.name)">+</button>
          </div>
        </div>

        <div v-if="!appliances.categories.length" class="empty-state">
          <p>Δεν υπάρχουν κατηγορίες ακόμα.</p>
          <p class="hint">Δημιούργησε μία για να αρχίσεις! (π.χ. Ηλεκτρικές Συσκευές, Μαγειρικά Σκεύη)</p>
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

.appliances-section {
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

/* Appliances table */
.appliances-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-sm);
}

.appliances-table th {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: var(--space-xs) var(--space-xs);
  border-bottom: 2px solid var(--color-border);
}

.appliances-table td {
  padding: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
}

.appliances-table th:last-child,
.appliances-table td:last-child {
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

.notes-input {
  min-width: 180px;
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

/* Add appliance row */
.add-appliance-row {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
  margin-top: var(--space-sm);
}

.add-appliance-row .name-input {
  flex: 1;
}

.add-appliance-row .notes-input {
  flex: 2;
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
