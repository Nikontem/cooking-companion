/**
 * Smoke test for the data layer.
 * Run with: npx tsx server/src/data/smoke-test.ts
 */
import { listRecipes, getRecipe, saveRecipe, deleteRecipe, searchRecipes } from './recipes.js';
import { getTasteProfile, updateTasteProfile, logCook } from './taste-profile.js';

const DUMMY_RECIPE = {
  id: 'test-recipe',
  name: 'Τεστ Συνταγή',
  name_en: 'Test Recipe',
  category: 'αυγά' as const,
  tags: ['τεστ', 'γρήγορο'],
  servings: { amount: 2, label: 'μερίδες' },
  ingredients: [
    { name: 'αυγά', amount: 2, unit: 'τεμ' },
  ],
  steps: [
    { order: 1, title: 'Βήμα 1', instruction: 'Τηγανίζεις τα αυγά' },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

async function run() {
  console.log('\n--- Recipe CRUD ---');

  // Save
  await saveRecipe(DUMMY_RECIPE);
  const index = await listRecipes();
  assert(index.some(e => e.id === 'test-recipe'), 'saveRecipe → appears in index');

  // Read
  const recipe = await getRecipe('test-recipe');
  assert(recipe.name === 'Τεστ Συνταγή', 'getRecipe → correct name');

  // Search
  const byName = await searchRecipes('Τεστ');
  assert(byName.length === 1, 'searchRecipes by Greek name');
  const byEn = await searchRecipes('test');
  assert(byEn.length === 1, 'searchRecipes by English name');
  const byTag = await searchRecipes('γρήγορο');
  assert(byTag.length === 1, 'searchRecipes by tag');
  const noMatch = await searchRecipes('ανύπαρκτο');
  assert(noMatch.length === 0, 'searchRecipes no match → empty');

  // Delete
  await deleteRecipe('test-recipe');
  const afterDelete = await listRecipes();
  assert(!afterDelete.some(e => e.id === 'test-recipe'), 'deleteRecipe → removed from index');

  console.log('\n--- Taste Profile ---');

  // Read
  const profile = await getTasteProfile();
  assert(typeof profile.preferences === 'object', 'getTasteProfile → has preferences');

  // Update (deep merge)
  const updated = await updateTasteProfile({
    preferences: { favorite_ingredients: ['φέτα', 'σκόρδο'] },
  });
  const prefs = updated.preferences as Record<string, unknown>;
  const favs = prefs.favorite_ingredients as string[];
  assert(favs.includes('φέτα'), 'updateTasteProfile → favorite_ingredients updated');
  assert(favs.length === 2, 'updateTasteProfile → array replaced (not merged)');

  // Log cook
  await logCook({
    recipe_id: 'test-recipe',
    date: '2026-02-10',
    result: 'great',
    notes: 'Smoke test entry',
  });
  const afterLog = await getTasteProfile();
  const log = afterLog.cooking_log as Array<Record<string, unknown>>;
  assert(log.some(e => e.recipe_id === 'test-recipe'), 'logCook → entry appended');

  // Cleanup: remove the smoke test cook log entry and reset favorite_ingredients
  await updateTasteProfile({
    preferences: { favorite_ingredients: ['φέτα', 'σκόρδο', 'ελαιόλαδο', 'τρούφα'] },
    cooking_log: [],
  });

  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
