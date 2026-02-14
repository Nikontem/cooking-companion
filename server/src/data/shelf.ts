import fs from 'node:fs/promises';
import { SHELF_PATH } from './config.js';
import { validateShelf } from './validator.js';

export interface ShelfIngredient {
  name: string;
  quantity?: number;
  unit?: string;
}

export interface ShelfCategory {
  name: string;
  ingredients: ShelfIngredient[];
}

export interface Shelf {
  spices: string[];
  categories: ShelfCategory[];
  updated_at: string;
}

export async function getShelf(): Promise<Shelf> {
  const raw = await fs.readFile(SHELF_PATH, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Deep-merge updates into the existing shelf.
 * Arrays in the update REPLACE arrays in the existing shelf (not concatenated).
 */
export async function updateShelf(updates: Record<string, unknown>): Promise<Shelf> {
  const current = await getShelf();
  const merged = deepMerge(current as unknown as Record<string, unknown>, updates);
  merged.updated_at = new Date().toISOString();

  const result = validateShelf(merged);
  if (!result.valid) {
    throw new Error(`Shelf validation failed:\n${result.errors!.join('\n')}`);
  }

  await fs.writeFile(SHELF_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  return merged as unknown as Shelf;
}

/**
 * Add a new category to the shelf.
 */
export async function addShelfCategory(name: string): Promise<Shelf> {
  const shelf = await getShelf();

  if (shelf.categories.some(c => c.name === name)) {
    throw new Error(`Category "${name}" already exists`);
  }

  shelf.categories.push({ name, ingredients: [] });
  shelf.updated_at = new Date().toISOString();

  const result = validateShelf(shelf);
  if (!result.valid) {
    throw new Error(`Shelf validation failed:\n${result.errors!.join('\n')}`);
  }

  await fs.writeFile(SHELF_PATH, JSON.stringify(shelf, null, 2), 'utf-8');
  return shelf;
}

/**
 * Remove a category from the shelf by name.
 */
export async function removeShelfCategory(name: string): Promise<Shelf> {
  const shelf = await getShelf();

  const index = shelf.categories.findIndex(c => c.name === name);
  if (index === -1) {
    throw new Error(`Category "${name}" not found`);
  }

  shelf.categories.splice(index, 1);
  shelf.updated_at = new Date().toISOString();

  await fs.writeFile(SHELF_PATH, JSON.stringify(shelf, null, 2), 'utf-8');
  return shelf;
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
