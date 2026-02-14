<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useProfile } from '../composables/useProfile'
import ProfileSection from '../components/ProfileSection.vue'

const { profile, loading, error, saving, fetch, update } = useProfile()

const form = reactive({
  flavor_principles: [] as string[],
  favorite_ingredients: [] as string[],
  disliked_ingredients: [] as string[],
  cooking_style: [] as string[],
  spice_tolerance: 'medium' as string,
  dietary_pattern: '',
  dietary_goals: [] as string[],
  dietary_restrictions: [] as string[],
})

const newItem = reactive<Record<string, string>>({})

type ArrayFields = Exclude<keyof typeof form, 'spice_tolerance' | 'dietary_pattern'>

watch(profile, (p) => {
  if (!p) return
  form.flavor_principles = [...(p.preferences.flavor_principles || [])]
  form.favorite_ingredients = [...(p.preferences.favorite_ingredients || [])]
  form.disliked_ingredients = [...(p.preferences.disliked_ingredients || [])]
  form.cooking_style = [...(p.preferences.cooking_style || [])]
  form.spice_tolerance = p.preferences.spice_tolerance || 'medium'
  form.dietary_pattern = p.dietary?.pattern || ''
  form.dietary_goals = [...(p.dietary?.goals || [])]
  form.dietary_restrictions = [...(p.dietary?.restrictions || [])]
})

function getList(field: ArrayFields): string[] {
  return form[field]
}

function setList(field: ArrayFields, value: string[]) {
  form[field] = value
}

function addItem(field: ArrayFields) {
  const val = newItem[field]?.trim()
  if (!val) return
  setList(field, [...getList(field), val])
  newItem[field] = ''
}

function removeItem(field: ArrayFields, index: number) {
  const arr = [...getList(field)]
  arr.splice(index, 1)
  setList(field, arr)
}

function savePreferences() {
  update({
    preferences: {
      flavor_principles: form.flavor_principles,
      favorite_ingredients: form.favorite_ingredients,
      disliked_ingredients: form.disliked_ingredients,
      cooking_style: form.cooking_style,
      spice_tolerance: form.spice_tolerance as 'mild' | 'medium' | 'spicy' | 'very-spicy',
    },
  })
}

function saveDietary() {
  update({
    dietary: {
      pattern: form.dietary_pattern,
      goals: form.dietary_goals,
      restrictions: form.dietary_restrictions,
    },
  })
}

const toleranceOptions = [
  { value: 'mild', label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'spicy', label: 'Spicy' },
  { value: 'very-spicy', label: 'Very Spicy' },
]

onMounted(fetch)
</script>

<template>
  <div class="profile-view">
    <h1 class="page-title">Προφίλ Γεύσης</h1>

    <p v-if="loading" class="status">Φόρτωση...</p>
    <p v-else-if="error" class="status error">{{ error }}</p>

    <template v-else-if="profile">
      <div class="sections">
        <!-- Kitchen link -->
        <div class="shelf-link-card">
          <span class="shelf-label">Η Κουζίνα μου</span>
          <RouterLink to="/appliances" class="shelf-link">Δες τις συσκευές σου →</RouterLink>
        </div>

        <!-- Shelf link -->
        <div class="shelf-link-card">
          <span class="shelf-label">Αποθήκη</span>
          <RouterLink to="/shelf" class="shelf-link">Δες την αποθήκη σου →</RouterLink>
        </div>

        <!-- Preferences -->
        <ProfileSection title="Προτιμήσεις" :saving="saving" @save="savePreferences">
          <div v-for="field in [
            { key: 'flavor_principles', label: 'Αρχές Γεύσης' },
            { key: 'favorite_ingredients', label: 'Αγαπημένα Υλικά' },
            { key: 'disliked_ingredients', label: 'Μη Αρεστά Υλικά' },
            { key: 'cooking_style', label: 'Στυλ Μαγειρέματος' },
          ]" :key="field.key" class="tag-editor">
            <label class="field-label">{{ field.label }}</label>
            <div class="tag-list">
              <span v-for="(item, i) in getList(field.key as ArrayFields)" :key="i" class="tag-item">
                {{ item }}
                <button class="tag-remove" @click="removeItem(field.key as ArrayFields, i)">&times;</button>
              </span>
            </div>
            <div class="tag-input-row">
              <input
                v-model="newItem[field.key]"
                :placeholder="`Προσθήκη...`"
                @keydown.enter="addItem(field.key as ArrayFields)"
              />
              <button class="add-btn" @click="addItem(field.key as ArrayFields)">+</button>
            </div>
          </div>

          <div class="field">
            <label class="field-label">Ανοχή Πικάντικου</label>
            <select v-model="form.spice_tolerance" class="select">
              <option v-for="opt in toleranceOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </ProfileSection>

        <!-- Dietary -->
        <ProfileSection title="Διατροφή" :saving="saving" @save="saveDietary">
          <div class="field">
            <label class="field-label">Διατροφικό Πρότυπο</label>
            <input v-model="form.dietary_pattern" class="text-input" placeholder="π.χ. Intermittent fasting" />
          </div>

          <div v-for="field in [
            { key: 'dietary_goals', label: 'Στόχοι' },
            { key: 'dietary_restrictions', label: 'Περιορισμοί' },
          ]" :key="field.key" class="tag-editor">
            <label class="field-label">{{ field.label }}</label>
            <div class="tag-list">
              <span v-for="(item, i) in getList(field.key as ArrayFields)" :key="i" class="tag-item">
                {{ item }}
                <button class="tag-remove" @click="removeItem(field.key as ArrayFields, i)">&times;</button>
              </span>
            </div>
            <div class="tag-input-row">
              <input
                v-model="newItem[field.key]"
                :placeholder="`Προσθήκη...`"
                @keydown.enter="addItem(field.key as ArrayFields)"
              />
              <button class="add-btn" @click="addItem(field.key as ArrayFields)">+</button>
            </div>
          </div>
        </ProfileSection>

        <!-- Cooking Log (read-only) -->
        <ProfileSection title="Ιστορικό Μαγειρέματος" :saving="false" @save="() => {}">
          <div v-if="!profile.cooking_log?.length" class="empty">
            Δεν υπάρχουν καταχωρήσεις ακόμα.
          </div>
          <table v-else class="log-table">
            <thead>
              <tr>
                <th>Συνταγή</th>
                <th>Ημερομηνία</th>
                <th>Αποτέλεσμα</th>
                <th>Σημειώσεις</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(entry, i) in profile.cooking_log" :key="i">
                <td>{{ entry.recipe_id }}</td>
                <td>{{ entry.date }}</td>
                <td>{{ entry.result || '—' }}</td>
                <td>{{ entry.notes || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </ProfileSection>
      </div>
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

.sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.shelf-link-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.shelf-label {
  font-size: 1.1rem;
  font-weight: 600;
}

.shelf-link {
  color: var(--color-primary);
  font-weight: 500;
  transition: color 0.2s;
}

.shelf-link:hover {
  color: var(--color-primary-light);
}

.tag-editor {
  margin-bottom: var(--space-md);
}

.field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

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

.add-btn {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 1.1rem;
  line-height: 1;
}

.add-btn:hover {
  background: #219a52;
}

.field {
  margin-bottom: var(--space-md);
}

.text-input,
.select {
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: white;
  outline: none;
}

.text-input:focus,
.select:focus {
  border-color: var(--color-primary);
}

.empty {
  color: var(--color-text-secondary);
  font-style: italic;
  padding: var(--space-md) 0;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.log-table th {
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: var(--space-sm);
  border-bottom: 2px solid var(--color-border);
}

.log-table td {
  padding: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}
</style>
