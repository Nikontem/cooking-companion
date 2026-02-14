<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRecipes } from '../composables/useRecipes'
import TagBadge from '../components/TagBadge.vue'
import IngredientGroup from '../components/IngredientGroup.vue'
import StepCard from '../components/StepCard.vue'
import RecipeChatPanel from '../components/RecipeChatPanel.vue'
import type { Ingredient } from '../types'

const route = useRoute()
const { recipe, loading, error, fetchOne } = useRecipes()

const GROUP_ORDER = [
  'Βάση',
  'Λαχανικά',
  'Αρωματικά',
  'Σάλτσα',
  'Καρυκεύματα',
  'Λάδι/Λίπος',
  'Προαιρετικά',
]

const groupedIngredients = computed(() => {
  if (!recipe.value) return []
  const groups = new Map<string, Ingredient[]>()
  for (const ing of recipe.value.ingredients) {
    const g = ing.group || 'Άλλα'
    if (!groups.has(g)) groups.set(g, [])
    groups.get(g)!.push(ing)
  }
  return [...groups.entries()].sort((a, b) => {
    const ia = GROUP_ORDER.indexOf(a[0])
    const ib = GROUP_ORDER.indexOf(b[0])
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
})

const verdictLabel: Record<string, string> = {
  keeper: 'Keeper',
  revert: 'Revert',
  'try-again': 'Try Again',
  undecided: 'Undecided',
}

function load() {
  const id = route.params.id as string
  if (id) fetchOne(id)
}

onMounted(load)
watch(() => route.params.id, load)
</script>

<template>
  <div class="recipe-detail">
    <p v-if="loading" class="status">Φόρτωση...</p>
    <p v-else-if="error" class="status error">{{ error }}</p>

    <template v-else-if="recipe">
      <!-- Header -->
      <header class="recipe-header">
        <RouterLink to="/" class="back">&larr; Συνταγές</RouterLink>
        <h1 class="recipe-name">{{ recipe.name }}</h1>
        <p v-if="recipe.name_en" class="recipe-name-en">{{ recipe.name_en }}</p>
        <p v-if="recipe.description" class="description">{{ recipe.description }}</p>

        <div class="tags">
          <TagBadge :label="recipe.category" variant="category" />
          <TagBadge v-for="tag in recipe.tags" :key="tag" :label="tag" />
        </div>

        <div class="meta-row">
          <div v-if="recipe.time?.total_minutes" class="meta-item">
            <span class="meta-label">Σύνολο</span>
            <span class="meta-value">{{ recipe.time.total_minutes }}΄</span>
          </div>
          <div v-if="recipe.time?.prep_minutes" class="meta-item">
            <span class="meta-label">Προετοιμασία</span>
            <span class="meta-value">{{ recipe.time.prep_minutes }}΄</span>
          </div>
          <div v-if="recipe.time?.cook_minutes" class="meta-item">
            <span class="meta-label">Μαγείρεμα</span>
            <span class="meta-value">{{ recipe.time.cook_minutes }}΄</span>
          </div>
          <div v-if="recipe.time?.rest_minutes" class="meta-item">
            <span class="meta-label">Ανάπαυση</span>
            <span class="meta-value">{{ recipe.time.rest_minutes }}΄</span>
          </div>
          <div v-if="recipe.servings" class="meta-item">
            <span class="meta-label">Μερίδες</span>
            <span class="meta-value">{{ recipe.servings.amount }} {{ recipe.servings.label }}</span>
          </div>
          <div v-if="recipe.difficulty" class="meta-item">
            <span class="meta-label">Δυσκολία</span>
            <span class="meta-value">{{ recipe.difficulty }}</span>
          </div>
        </div>

        <div v-if="recipe.equipment?.length" class="equipment">
          <span class="equip-label">Εξοπλισμός:</span>
          {{ recipe.equipment.join(', ') }}
        </div>

        <div v-if="recipe.source?.origin" class="source">
          Πηγή: {{ recipe.source.origin }}
          <a v-if="recipe.source.url" :href="recipe.source.url" target="_blank" rel="noopener">(link)</a>
        </div>
      </header>

      <!-- Ingredients -->
      <section class="section">
        <h2 class="section-title">Υλικά</h2>
        <div class="ingredients-panel">
          <IngredientGroup
            v-for="[group, ings] in groupedIngredients"
            :key="group"
            :group="group"
            :ingredients="ings"
          />
        </div>
      </section>

      <!-- Steps -->
      <section class="section">
        <h2 class="section-title">Βήματα</h2>
        <div class="steps">
          <StepCard
            v-for="step in recipe.steps"
            :key="step.order"
            :step="step"
          />
        </div>
      </section>

      <!-- Serving Suggestion -->
      <section v-if="recipe.serving_suggestion" class="section">
        <div class="callout serving">
          <h3>Σερβίρισμα</h3>
          <p>{{ recipe.serving_suggestion }}</p>
        </div>
      </section>

      <!-- General Tips -->
      <section v-if="recipe.general_tips?.length" class="section">
        <h2 class="section-title">Γενικές Συμβουλές</h2>
        <ul class="tips-list">
          <li v-for="(tip, i) in recipe.general_tips" :key="i">{{ tip }}</li>
        </ul>
      </section>

      <!-- Modifications Log -->
      <section v-if="recipe.modifications_log?.length" class="section">
        <h2 class="section-title">Ιστορικό Αλλαγών</h2>
        <div class="mod-list">
          <div v-for="(mod, i) in recipe.modifications_log" :key="i" class="mod-item">
            <div class="mod-header">
              <span class="mod-date">{{ mod.date }}</span>
              <span v-if="mod.verdict" class="mod-verdict" :class="mod.verdict">
                {{ verdictLabel[mod.verdict] || mod.verdict }}
              </span>
            </div>
            <p class="mod-desc">{{ mod.description }}</p>
            <p v-if="mod.reason" class="mod-reason">{{ mod.reason }}</p>
          </div>
        </div>
      </section>

      <!-- Rating -->
      <section v-if="recipe.rating?.score" class="section">
        <h2 class="section-title">Βαθμολογία</h2>
        <div class="rating">
          <span class="stars">{{ '★'.repeat(recipe.rating.score) }}{{ '☆'.repeat(5 - recipe.rating.score) }}</span>
          <p v-if="recipe.rating.comment" class="rating-comment">{{ recipe.rating.comment }}</p>
          <p v-if="recipe.rating.last_cooked" class="rating-date">
            Τελευταίο μαγείρεμα: {{ recipe.rating.last_cooked }}
          </p>
        </div>
      </section>

      <!-- Recipe Chat Panel -->
      <RecipeChatPanel
        :key="recipe.id"
        :recipe-id="recipe.id"
        :recipe-name="recipe.name"
      />
    </template>
  </div>
</template>

<style scoped>
.recipe-detail {
  padding-bottom: 3.5rem; /* Space for the fixed chat toggle bar */
}

.status {
  text-align: center;
  color: var(--color-text-secondary);
  padding: var(--space-xl) 0;
}

.error {
  color: var(--color-primary);
}

.back {
  display: inline-block;
  font-size: 0.9rem;
  margin-bottom: var(--space-md);
  color: var(--color-text-secondary);
}

.back:hover {
  color: var(--color-primary);
}

.recipe-header {
  margin-bottom: var(--space-xl);
}

.recipe-name {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: var(--space-xs);
}

.recipe-name-en {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.description {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
  line-height: 1.6;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
  margin-bottom: var(--space-md);
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.equipment {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.equip-label {
  font-weight: 600;
  color: var(--color-text);
}

.source {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* Sections */
.section {
  margin-bottom: var(--space-xl);
}

.section-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 2px solid var(--color-border);
}

/* Ingredients */
.ingredients-panel {
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: var(--space-lg);
  box-shadow: var(--shadow);
}

/* Steps */
.steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Serving suggestion callout */
.callout {
  border-radius: var(--radius);
  padding: var(--space-md) var(--space-lg);
}

.serving {
  background: var(--color-accent-light);
  border-left: 4px solid var(--color-accent);
}

.serving h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-accent);
  margin-bottom: var(--space-xs);
}

/* Tips */
.tips-list {
  list-style: disc;
  padding-left: var(--space-lg);
}

.tips-list li {
  margin-bottom: var(--space-sm);
  line-height: 1.6;
}

/* Modifications */
.mod-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.mod-item {
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
  box-shadow: var(--shadow);
}

.mod-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.mod-date {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.mod-verdict {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.mod-verdict.keeper { background: var(--color-accent-light); color: var(--color-accent); }
.mod-verdict.revert { background: #fdedec; color: var(--color-primary); }
.mod-verdict.try-again { background: #fef9e7; color: #d68910; }
.mod-verdict.undecided { background: var(--color-tag-bg); color: var(--color-text-secondary); }

.mod-desc {
  font-weight: 500;
}

.mod-reason {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* Rating */
.rating {
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: var(--space-lg);
  box-shadow: var(--shadow);
}

.stars {
  font-size: 1.5rem;
  color: var(--color-warm);
}

.rating-comment {
  margin-top: var(--space-sm);
  font-style: italic;
}

.rating-date {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}
</style>
