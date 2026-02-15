import { tool } from 'ai';
import { z } from 'zod/v4';
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

/**
 * Safely parse a JSON string, returning a structured error on failure
 * so the model gets actionable feedback instead of a silent crash.
 */
function safeParse(jsonString: string): { data?: unknown; error?: string } {
  try {
    return { data: JSON.parse(jsonString) };
  } catch (err) {
    return { error: `Invalid JSON: ${(err as Error).message}. Fix the JSON and try again.` };
  }
}

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
      try {
        return await getRecipe(id);
      } catch (err) {
        return { error: `Recipe "${id}" not found: ${(err as Error).message}` };
      }
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
    description: 'Creates or updates a recipe with structured fields. Always confirm with the user before saving. Timestamps, modifications_log, and rating are auto-managed.',
    inputSchema: z.object({
      id: z.string().describe('URL-safe slug, e.g. "xoirines-brizoles-tiganiou", "fakes"'),
      name: z.string().describe('Recipe name in Greek'),
      name_en: z.string().optional().describe('English translation of the recipe name'),
      description: z.string().optional().describe('Short description in Greek, 1-2 sentences'),
      category: z.enum(['ζυμαρικά', 'λαδερά', 'κρέατα', 'θαλασσινά', 'αυγά', 'σαλάτες', 'σούπες', 'όσπρια', 'ρύζι', 'τεχνικές', 'άλλο']),
      tags: z.array(z.string()).optional().describe('Searchable tags, e.g. ["γρήγορο", "εύκολο"]'),
      difficulty: z.enum(['εύκολο', 'μέτριο', 'δύσκολο']).optional(),
      servings: z.object({
        amount: z.number().int().describe('Number of servings'),
        label: z.string().optional().describe('e.g. "μερίδες", "άτομα"'),
      }),
      time: z.object({
        prep_minutes: z.number().int().optional(),
        cook_minutes: z.number().int().optional(),
        rest_minutes: z.number().int().optional(),
        total_minutes: z.number().int().optional(),
      }).optional(),
      equipment: z.array(z.string()).optional().describe('Required equipment, e.g. ["αντικολλητικό τηγάνι"]'),
      ingredients: z.array(z.object({
        group: z.enum(['Βάση', 'Λαχανικά', 'Αρωματικά', 'Σάλτσα', 'Καρυκεύματα', 'Λάδι/Λίπος', 'Προαιρετικά']).optional()
          .describe('Fixed groups: αλάτι/πιπέρι→Καρυκεύματα, ελαιόλαδο→Λάδι/Λίπος, κρεμμύδι/σκόρδο→Αρωματικά'),
        name: z.string().describe('Ingredient name in Greek'),
        amount: z.number().optional(),
        unit: z.string().optional().describe('e.g. "γρ", "κ.σ.", "κ.γ.", "ml", "τεμ"'),
        notes: z.string().optional().describe('e.g. "ψιλοκομμένο", "σε θερμοκρασία δωματίου"'),
        optional: z.boolean().optional(),
        substitutions: z.array(z.string()).optional(),
      })),
      steps: z.array(z.object({
        order: z.number().int(),
        title: z.string().describe('Short step title in Greek'),
        instruction: z.string().describe('Detailed instruction in Greek'),
        heat_setting: z.object({
          level: z.string().describe('Heat level, e.g. "5-6", "7-8", "MAX"'),
          label: z.enum(['πολύ χαμηλή', 'χαμηλή', 'μέτρια-χαμηλή', 'μέτρια', 'μέτρια-δυνατή', 'δυνατή', 'MAX', 'κλειστή']),
        }).optional(),
        duration: z.object({
          minutes: z.number().optional(),
          until: z.string().optional().describe('Sensory cue, e.g. "να ροδίσει και να γίνει κρούστα"'),
        }).optional(),
        tips: z.array(z.string()).optional(),
        ingredients_used: z.array(z.string()).optional().describe('Ingredient names introduced in this step'),
      })),
      serving_suggestion: z.string().optional(),
      general_tips: z.array(z.string()).optional(),
    }),
    execute: async (input) => {
      const now = new Date().toISOString();
      const recipe = {
        ...input,
        modifications_log: [],
        rating: {},
        created_at: now,
        updated_at: now,
      };
      try {
        await saveRecipe(recipe as Record<string, unknown>);
        return { success: true, message: `Recipe "${input.id}" saved successfully.` };
      } catch (err) {
        return { success: false, error: `Failed to save recipe: ${(err as Error).message}` };
      }
    },
  }),

  delete_recipe: tool({
    description: 'Deletes a recipe by id and regenerates the index. Always confirm with the user before deleting.',
    inputSchema: z.object({
      id: z.string().describe('Recipe slug id to delete'),
    }),
    execute: async ({ id }) => {
      try {
        await deleteRecipe(id);
        return { success: true, message: `Recipe "${id}" deleted.` };
      } catch (err) {
        return { success: false, error: `Failed to delete recipe "${id}": ${(err as Error).message}` };
      }
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
      const { data: parsed, error } = safeParse(updates);
      if (error) return { success: false, error };
      try {
        return await updateTasteProfile(parsed as Record<string, unknown>);
      } catch (err) {
        return { success: false, error: `Failed to update taste profile: ${(err as Error).message}` };
      }
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
      try {
        await logCook(args);
        return { success: true, message: `Cook logged for "${args.recipe_id}" on ${args.date}.` };
      } catch (err) {
        return { success: false, error: `Failed to log cook: ${(err as Error).message}` };
      }
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
      const { data: parsed, error } = safeParse(updates);
      if (error) return { success: false, error };
      try {
        return await updateShelf(parsed as Record<string, unknown>);
      } catch (err) {
        return { success: false, error: `Failed to update shelf: ${(err as Error).message}` };
      }
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
      const { data: parsed, error } = safeParse(updates);
      if (error) return { success: false, error };
      try {
        return await updateAppliances(parsed as Record<string, unknown>);
      } catch (err) {
        return { success: false, error: `Failed to update appliances: ${(err as Error).message}` };
      }
    },
  }),
};
