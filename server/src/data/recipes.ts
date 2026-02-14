import fs from 'node:fs/promises';
import path from 'node:path';
import { RECIPES_DIR, INDEX_PATH } from './config.js';
import { validateRecipe } from './validator.js';

export interface RecipeIndexEntry {
  id: string;
  name: string;
  name_en?: string;
  category: string;
  tags?: string[];
}

export async function listRecipes(): Promise<RecipeIndexEntry[]> {
  const raw = await fs.readFile(INDEX_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function getRecipe(id: string): Promise<Record<string, unknown>> {
  const filePath = path.join(RECIPES_DIR, `${id}.json`);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

export async function saveRecipe(recipe: Record<string, unknown>): Promise<void> {
  const result = validateRecipe(recipe);
  if (!result.valid) {
    throw new Error(`Recipe validation failed:\n${result.errors!.join('\n')}`);
  }

  const id = recipe.id as string;
  const filePath = path.join(RECIPES_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(recipe, null, 2), 'utf-8');
  await rebuildIndex();
}

export async function deleteRecipe(id: string): Promise<void> {
  const filePath = path.join(RECIPES_DIR, `${id}.json`);
  await fs.unlink(filePath);
  await rebuildIndex();
}

export async function searchRecipes(query: string): Promise<RecipeIndexEntry[]> {
  const index = await listRecipes();
  const q = query.toLowerCase();

  return index.filter(entry => {
    const fields = [
      entry.name,
      entry.name_en,
      entry.category,
      ...(entry.tags ?? []),
    ];
    return fields.some(f => f?.toLowerCase().includes(q));
  });
}

export async function rebuildIndex(): Promise<void> {
  const files = await fs.readdir(RECIPES_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  const entries: RecipeIndexEntry[] = [];

  for (const file of jsonFiles) {
    const raw = await fs.readFile(path.join(RECIPES_DIR, file), 'utf-8');
    const recipe = JSON.parse(raw);
    entries.push({
      id: recipe.id,
      name: recipe.name,
      name_en: recipe.name_en,
      category: recipe.category,
      tags: recipe.tags,
    });
  }

  await fs.writeFile(INDEX_PATH, JSON.stringify(entries, null, 2), 'utf-8');
}
