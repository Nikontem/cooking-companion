import fs from 'node:fs/promises';
import { TASTE_PROFILE_PATH } from './config.js';
import { validateTasteProfile } from './validator.js';

export interface CookLogEntry {
  recipe_id: string;
  date: string;
  result?: 'great' | 'good' | 'ok' | 'meh' | 'bad';
  notes?: string;
}

export async function getTasteProfile(): Promise<Record<string, unknown>> {
  const raw = await fs.readFile(TASTE_PROFILE_PATH, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Deep-merge updates into the existing taste profile.
 * Arrays in the update REPLACE arrays in the existing profile (not concatenated).
 * For appending to cooking_log, use logCook() instead.
 */
export async function updateTasteProfile(updates: Record<string, unknown>): Promise<Record<string, unknown>> {
  const current = await getTasteProfile();
  const merged = deepMerge(current, updates);
  merged.updated_at = new Date().toISOString();

  const result = validateTasteProfile(merged);
  if (!result.valid) {
    throw new Error(`Taste profile validation failed:\n${result.errors!.join('\n')}`);
  }

  await fs.writeFile(TASTE_PROFILE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

export async function logCook(entry: CookLogEntry): Promise<void> {
  const profile = await getTasteProfile();
  const log = (profile.cooking_log as CookLogEntry[]) ?? [];
  log.push(entry);
  profile.cooking_log = log;
  profile.updated_at = new Date().toISOString();

  await fs.writeFile(TASTE_PROFILE_PATH, JSON.stringify(profile, null, 2), 'utf-8');
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (Array.isArray(sourceVal)) {
      // Arrays replace, not merge
      result[key] = sourceVal;
    } else if (
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal !== null &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      );
    } else {
      result[key] = sourceVal;
    }
  }

  return result;
}
