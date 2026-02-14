import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod/v4';
import {
  listRecipes,
  getRecipe,
  saveRecipe,
  deleteRecipe,
  searchRecipes,
  getTasteProfile,
  updateTasteProfile,
  logCook,
  getShelf,
  updateShelf,
  getAppliances,
  updateAppliances,
} from '../data/index.js';

export const server = new McpServer({
  name: 'cooking-companion',
  version: '1.0.0',
});

// ── list_recipes ────────────────────────────────────────────────────
server.tool(
  'list_recipes',
  'Returns the recipe index: id, name, name_en, category, tags for all recipes',
  async () => {
    try {
      const index = await listRecipes();
      return { content: [{ type: 'text', text: JSON.stringify(index, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
    }
  },
);

// ── get_recipe ──────────────────────────────────────────────────────
server.tool(
  'get_recipe',
  'Returns the full recipe JSON by id',
  { id: z.string().describe('Recipe slug id, e.g. "spanakoryzo"') },
  async ({ id }) => {
    try {
      const recipe = await getRecipe(id);
      return { content: [{ type: 'text', text: JSON.stringify(recipe, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
    }
  },
);

// ── save_recipe ─────────────────────────────────────────────────────
server.tool(
  'save_recipe',
  'Creates or updates a recipe. Input is a JSON string of the full recipe object. Validates against the recipe schema.',
  { recipe: z.string().describe('Full recipe as a JSON string') },
  async ({ recipe }) => {
    try {
      const parsed = JSON.parse(recipe);
      await saveRecipe(parsed);
      return { content: [{ type: 'text', text: `Recipe "${parsed.id}" saved successfully.` }] };
    } catch (err) {
      return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
    }
  },
);

// ── delete_recipe ───────────────────────────────────────────────────
server.tool(
  'delete_recipe',
  'Deletes a recipe by id and regenerates the index',
  {
    id: z.string().describe('Recipe slug id to delete'),
  },
  async ({ id }) => {
    try {
      await deleteRecipe(id);
      return { content: [{ type: 'text', text: `Recipe "${id}" deleted.` }] };
    } catch (err) {
      return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
    }
  },
);

// ── search_recipes ──────────────────────────────────────────────────
server.tool(
  'search_recipes',
  'Searches recipes by name, ingredient, tag, or category (case-insensitive)',
  { query: z.string().describe('Search term in Greek or English') },
  async ({ query }) => {
    try {
      const results = await searchRecipes(query);
      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
    }
  },
);

// ── get_taste_profile ───────────────────────────────────────────────
server.tool(
  'get_taste_profile',
  'Returns the full taste profile (preferences, dietary, cooking log)',
  async () => {
    try {
      const profile = await getTasteProfile();
      return { content: [{ type: 'text', text: JSON.stringify(profile, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
    }
  },
);

// ── update_taste_profile ────────────────────────────────────────────
server.tool(
  'update_taste_profile',
  'Partial update of the taste profile. Input is a JSON string of the fields to merge. Arrays replace existing arrays.',
  { updates: z.string().describe('Partial taste profile as a JSON string') },
  async ({ updates }) => {
    try {
      const parsed = JSON.parse(updates);
      const merged = await updateTasteProfile(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(merged, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
    }
  },
);

// ── log_cook ────────────────────────────────────────────────────────
server.tool(
  'log_cook',
  'Logs a cooking session to the taste profile cooking_log',
  {
    recipe_id: z.string().describe('Recipe slug id that was cooked'),
    date: z.string().describe('Date cooked (YYYY-MM-DD)'),
    result: z.enum(['great', 'good', 'ok', 'meh', 'bad']).optional().describe('How it turned out'),
    notes: z.string().optional().describe('Any observations'),
  },
  async (args) => {
    try {
      await logCook(args);
      return { content: [{ type: 'text', text: `Cook logged for "${args.recipe_id}" on ${args.date}.` }] };
    } catch (err) {
      return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
    }
  },
);

// ── get_shelf ──────────────────────────────────────────────────────
server.tool(
  'get_shelf',
  'Returns the kitchen shelf: spices (names only) and categorized ingredients with quantities',
  async () => {
    try {
      const shelf = await getShelf();
      return { content: [{ type: 'text', text: JSON.stringify(shelf, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
    }
  },
);

// ── update_shelf ───────────────────────────────────────────────────
server.tool(
  'update_shelf',
  'Partial update of the kitchen shelf. Input is a JSON string. Arrays replace existing arrays.',
  { updates: z.string().describe('Partial shelf data as a JSON string') },
  async ({ updates }) => {
    try {
      const parsed = JSON.parse(updates);
      const merged = await updateShelf(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(merged, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
    }
  },
);

// ── get_appliances ────────────────────────────────────────────────
server.tool(
  'get_appliances',
  'Returns the kitchen appliances and cookware, organized by category',
  async () => {
    try {
      const appliances = await getAppliances();
      return { content: [{ type: 'text', text: JSON.stringify(appliances, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
    }
  },
);

// ── update_appliances ─────────────────────────────────────────────
server.tool(
  'update_appliances',
  'Partial update of kitchen appliances. Input is a JSON string. Arrays replace existing arrays.',
  { updates: z.string().describe('Partial appliances data as a JSON string') },
  async ({ updates }) => {
    try {
      const parsed = JSON.parse(updates);
      const merged = await updateAppliances(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(merged, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
    }
  },
);
