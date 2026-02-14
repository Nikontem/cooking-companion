/**
 * One-time migration: Extracts equipment data from taste-profile.json
 * into a new appliances.json, then removes equipment from the profile.
 *
 * Run: npx tsx server/src/data/migrate-equipment-to-appliances.ts
 *
 * NOTE: This migration has already been performed manually.
 * This script is kept for documentation and reproducibility.
 */

import fs from 'node:fs/promises';
import { TASTE_PROFILE_PATH, APPLIANCES_PATH } from './config.js';
import { validateTasteProfile, validateAppliances } from './validator.js';

interface OldEquipment {
  stove?: {
    type?: string;
    heat_scale?: Record<string, unknown>;
    notes?: string;
  };
  available?: string[];
}

async function migrate() {
  console.log('Reading taste-profile.json...');
  const raw = await fs.readFile(TASTE_PROFILE_PATH, 'utf-8');
  const profile = JSON.parse(raw);

  const equipment: OldEquipment = profile.equipment || {};

  if (!equipment.stove && !equipment.available?.length) {
    console.log('No equipment data found — nothing to migrate.');
    return;
  }

  // Build appliances from old equipment
  const electricAppliances: Array<{ name: string; notes?: string }> = [];
  const cookwareAppliances: Array<{ name: string; notes?: string }> = [];

  // Stove → electric appliance with notes
  if (equipment.stove) {
    const stove = equipment.stove;
    let notes = `${stove.type || 'electric'}`;
    if (stove.heat_scale) {
      const hs = stove.heat_scale as Record<string, unknown>;
      notes += `, κλίμακα ${hs.min}-${hs.max}`;
    }
    if (stove.notes) {
      notes += `. ${stove.notes}`;
    }
    electricAppliances.push({ name: 'Κουζίνα', notes });
  }

  // Categorize available items
  const electricKeywords = ['air fryer', 'βραστήρας', 'φούρνος', 'μίξερ', 'μπλέντερ'];
  for (const item of equipment.available || []) {
    const isElectric = electricKeywords.some(kw => item.toLowerCase().includes(kw));
    if (isElectric) {
      electricAppliances.push({ name: item });
    } else {
      cookwareAppliances.push({ name: item });
    }
  }

  const appliances = {
    categories: [] as Array<{ name: string; appliances: Array<{ name: string; notes?: string }> }>,
    updated_at: new Date().toISOString(),
  };

  if (electricAppliances.length > 0) {
    appliances.categories.push({ name: 'Ηλεκτρικές Συσκευές', appliances: electricAppliances });
  }
  if (cookwareAppliances.length > 0) {
    appliances.categories.push({ name: 'Μαγειρικά Σκεύη', appliances: cookwareAppliances });
  }

  // Validate appliances
  const appliancesResult = validateAppliances(appliances);
  if (!appliancesResult.valid) {
    console.error('Appliances validation failed:', appliancesResult.errors);
    process.exit(1);
  }

  // Write appliances.json
  await fs.writeFile(APPLIANCES_PATH, JSON.stringify(appliances, null, 2), 'utf-8');
  console.log(`Created ${APPLIANCES_PATH}`);

  // Remove equipment from taste profile
  delete profile.equipment;
  profile.updated_at = new Date().toISOString();

  // Validate updated profile
  const profileResult = validateTasteProfile(profile);
  if (!profileResult.valid) {
    console.error('Taste profile validation failed after removing equipment:', profileResult.errors);
    process.exit(1);
  }

  // Write updated profile
  await fs.writeFile(TASTE_PROFILE_PATH, JSON.stringify(profile, null, 2), 'utf-8');
  console.log(`Updated ${TASTE_PROFILE_PATH} (equipment removed)`);

  console.log('\nMigration complete!');
  console.log(`  Categories: ${appliances.categories.length}`);
  for (const cat of appliances.categories) {
    console.log(`    - ${cat.name}: ${cat.appliances.length} appliances`);
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
