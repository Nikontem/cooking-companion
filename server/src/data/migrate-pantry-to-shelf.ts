/**
 * One-time migration: Extracts pantry data from taste-profile.json
 * into a new shelf.json, then removes pantry from the profile.
 *
 * Run: npx tsx server/src/data/migrate-pantry-to-shelf.ts
 */

import fs from 'node:fs/promises';
import { TASTE_PROFILE_PATH, SHELF_PATH } from './config.js';
import { validateTasteProfile, validateShelf } from './validator.js';

interface OldPantry {
  spices?: string[];
  oils_and_fats?: string[];
  staples?: string[];
  last_updated?: string;
}

async function migrate() {
  console.log('Reading taste-profile.json...');
  const raw = await fs.readFile(TASTE_PROFILE_PATH, 'utf-8');
  const profile = JSON.parse(raw);

  const pantry: OldPantry = profile.pantry || {};

  if (!pantry.spices && !pantry.oils_and_fats && !pantry.staples) {
    console.log('No pantry data found — nothing to migrate.');
    return;
  }

  // Build shelf from old pantry
  const shelf = {
    spices: pantry.spices || [],
    categories: [] as Array<{ name: string; ingredients: Array<{ name: string; quantity: number; unit: string }> }>,
    updated_at: new Date().toISOString(),
  };

  if (pantry.oils_and_fats && pantry.oils_and_fats.length > 0) {
    shelf.categories.push({
      name: 'Λάδια & Λίπη',
      ingredients: pantry.oils_and_fats.map(name => ({ name, quantity: 0, unit: '' })),
    });
  }

  if (pantry.staples && pantry.staples.length > 0) {
    shelf.categories.push({
      name: 'Βασικά',
      ingredients: pantry.staples.map(name => ({ name, quantity: 0, unit: '' })),
    });
  }

  // Validate shelf
  const shelfResult = validateShelf(shelf);
  if (!shelfResult.valid) {
    console.error('Shelf validation failed:', shelfResult.errors);
    process.exit(1);
  }

  // Write shelf.json
  await fs.writeFile(SHELF_PATH, JSON.stringify(shelf, null, 2), 'utf-8');
  console.log(`Created ${SHELF_PATH}`);

  // Remove pantry from taste profile
  delete profile.pantry;
  profile.updated_at = new Date().toISOString();

  // Validate updated profile
  const profileResult = validateTasteProfile(profile);
  if (!profileResult.valid) {
    console.error('Taste profile validation failed after removing pantry:', profileResult.errors);
    process.exit(1);
  }

  // Write updated profile
  await fs.writeFile(TASTE_PROFILE_PATH, JSON.stringify(profile, null, 2), 'utf-8');
  console.log(`Updated ${TASTE_PROFILE_PATH} (pantry removed)`);

  console.log('\nMigration complete!');
  console.log(`  Spices: ${shelf.spices.length}`);
  console.log(`  Categories: ${shelf.categories.length}`);
  for (const cat of shelf.categories) {
    console.log(`    - ${cat.name}: ${cat.ingredients.length} ingredients`);
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
