import fs from 'node:fs/promises';
import { APPLIANCES_PATH } from './config.js';
import { validateAppliances } from './validator.js';

export interface Appliance {
  name: string;
  notes?: string;
}

export interface ApplianceCategory {
  name: string;
  appliances: Appliance[];
}

export interface Appliances {
  categories: ApplianceCategory[];
  updated_at: string;
}

export async function getAppliances(): Promise<Appliances> {
  const raw = await fs.readFile(APPLIANCES_PATH, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Deep-merge updates into the existing appliances.
 * Arrays in the update REPLACE arrays in the existing data (not concatenated).
 */
export async function updateAppliances(updates: Record<string, unknown>): Promise<Appliances> {
  const current = await getAppliances();
  const merged = deepMerge(current as unknown as Record<string, unknown>, updates);
  merged.updated_at = new Date().toISOString();

  const result = validateAppliances(merged);
  if (!result.valid) {
    throw new Error(`Appliances validation failed:\n${result.errors!.join('\n')}`);
  }

  await fs.writeFile(APPLIANCES_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  return merged as unknown as Appliances;
}

/**
 * Add a new category to the appliances.
 */
export async function addApplianceCategory(name: string): Promise<Appliances> {
  const data = await getAppliances();

  if (data.categories.some(c => c.name === name)) {
    throw new Error(`Category "${name}" already exists`);
  }

  data.categories.push({ name, appliances: [] });
  data.updated_at = new Date().toISOString();

  const result = validateAppliances(data);
  if (!result.valid) {
    throw new Error(`Appliances validation failed:\n${result.errors!.join('\n')}`);
  }

  await fs.writeFile(APPLIANCES_PATH, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

/**
 * Remove a category from the appliances by name.
 */
export async function removeApplianceCategory(name: string): Promise<Appliances> {
  const data = await getAppliances();

  const index = data.categories.findIndex(c => c.name === name);
  if (index === -1) {
    throw new Error(`Category "${name}" not found`);
  }

  data.categories.splice(index, 1);
  data.updated_at = new Date().toISOString();

  await fs.writeFile(APPLIANCES_PATH, JSON.stringify(data, null, 2), 'utf-8');
  return data;
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
