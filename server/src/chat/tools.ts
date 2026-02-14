import {tool} from 'ai';
import {z} from 'zod/v4';
import {
  deleteRecipe,
  getAppliances,
  getRecipe,
  getShelf,
  getTasteProfile,
  listRecipes,
  logCook,
  saveRecipe,
  searchRecipes,
  updateAppliances,
  updateShelf,
  updateTasteProfile,
} from '../data/index.js';

export const chatTools = {
  list_recipes: tool({
    description: 'Returns the recipe index: id, name, name_en, category, tags for all recipes',
    inputSchema: z.object({}),
    execute: async () => {
      return await listRecipes();
    },
  }),

  get_recipe: tool({
    description: 'Returns the full recipe JSON by id',
    inputSchema: z.object({
      id: z.string().describe('Recipe slug id, e.g. "spanakoryzo-tis-mamas", "fakes"'),
    }),
    execute: async ({ id }) => {
      return await getRecipe(id);
    },
  }),

  search_recipes: tool({
    description: 'Searches recipes by name, ingredient, tag, or category (case-insensitive)',
    inputSchema: z.object({
      query: z.string().describe('Search term in Greek or English'),
    }),
    execute: async ({ query }) => {
      return await searchRecipes(query);
    },
  }),

  save_recipe: tool({
    description: 'Creates or updates a recipe. Input is a JSON string of the full recipe object. Validates against the recipe schema. Always confirm with the user before saving.',
    inputSchema: z.object({
      recipe: z.string().describe('Full recipe as a JSON string'),
    }),
    execute: async ({ recipe }) => {
      const parsed = JSON.parse(recipe);
      await saveRecipe(parsed);
      return { success: true, message: `Recipe "${parsed.id}" saved successfully.` };
    },
  }),

  delete_recipe: tool({
    description: 'Deletes a recipe by id and regenerates the index. Always confirm with the user before deleting.',
    inputSchema: z.object({
      id: z.string().describe('Recipe slug id to delete'),
    }),
    execute: async ({ id }) => {
      await deleteRecipe(id);
      return { success: true, message: `Recipe "${id}" deleted.` };
    },
  }),

  get_taste_profile: tool({
    description: 'Returns the full taste profile: preferences, dietary info, cooking log',
    inputSchema: z.object({}),
    execute: async () => {
      return await getTasteProfile();
    },
  }),

  update_taste_profile: tool({
    description: 'Partial update of the taste profile. Input is a JSON string of the fields to merge. Arrays replace existing arrays.',
    inputSchema: z.object({
      updates: z.string().describe('Partial taste profile as a JSON string'),
    }),
    execute: async ({ updates }) => {
      const parsed = JSON.parse(updates);
      return await updateTasteProfile(parsed);
    },
  }),

  log_cook: tool({
    description: 'Logs a cooking session to the taste profile cooking_log',
    inputSchema: z.object({
      recipe_id: z.string().describe('Recipe slug id that was cooked'),
      date: z.string().describe('Date cooked (YYYY-MM-DD)'),
      result: z.enum(['great', 'good', 'ok', 'meh', 'bad']).optional().describe('How it turned out'),
      notes: z.string().optional().describe('Any observations'),
    }),
    execute: async (args) => {
      await logCook(args);
      return { success: true, message: `Cook logged for "${args.recipe_id}" on ${args.date}.` };
    },
  }),

  get_shelf: tool({
    description: 'Returns the kitchen shelf: spices (names only) and categorized ingredients with quantities',
    inputSchema: z.object({}),
    execute: async () => {
      return await getShelf();
    },
  }),

  update_shelf: tool({
    description: 'Partial update of the kitchen shelf. Input is a JSON string. Arrays replace existing arrays.',
    inputSchema: z.object({
      updates: z.string().describe('Partial shelf data as a JSON string'),
    }),
    execute: async ({ updates }) => {
      const parsed = JSON.parse(updates);
      return await updateShelf(parsed);
    },
  }),

  get_appliances: tool({
    description: 'Returns the kitchen appliances and cookware, organized by category. Each appliance has a name and optional notes.',
    inputSchema: z.object({}),
    execute: async () => {
      return await getAppliances();
    },
  }),

  update_appliances: tool({
    description: 'Partial update of kitchen appliances. Input is a JSON string. Arrays replace existing arrays.',
    inputSchema: z.object({
      updates: z.string().describe('Partial appliances data as a JSON string'),
    }),
    execute: async ({ updates }) => {
      const parsed = JSON.parse(updates);
      return await updateAppliances(parsed);
    },
  }),
};
