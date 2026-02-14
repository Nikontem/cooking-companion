import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import recipeSchema from '../schemas/recipe.schema.json' with { type: 'json' };
import tasteProfileSchema from '../schemas/taste-profile.schema.json' with { type: 'json' };
import shelfSchema from '../schemas/shelf.schema.json' with { type: 'json' };
import appliancesSchema from '../schemas/appliances.schema.json' with { type: 'json' };

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validateRecipeSchema = ajv.compile(recipeSchema);
const validateTasteProfileSchema = ajv.compile(tasteProfileSchema);
const validateShelfSchema = ajv.compile(shelfSchema);
const validateAppliancesSchema = ajv.compile(appliancesSchema);

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

function formatErrors(errors: typeof validateRecipeSchema.errors): string[] {
  if (!errors) return [];
  return errors.map(e => `${e.instancePath || '/'} ${e.message ?? 'unknown error'}`);
}

export function validateRecipe(data: unknown): ValidationResult {
  const valid = validateRecipeSchema(data);
  return valid
    ? { valid: true }
    : { valid: false, errors: formatErrors(validateRecipeSchema.errors) };
}

export function validateTasteProfile(data: unknown): ValidationResult {
  const valid = validateTasteProfileSchema(data);
  return valid
    ? { valid: true }
    : { valid: false, errors: formatErrors(validateTasteProfileSchema.errors) };
}

export function validateShelf(data: unknown): ValidationResult {
  const valid = validateShelfSchema(data);
  return valid
    ? { valid: true }
    : { valid: false, errors: formatErrors(validateShelfSchema.errors) };
}

export function validateAppliances(data: unknown): ValidationResult {
  const valid = validateAppliancesSchema(data);
  return valid
    ? { valid: true }
    : { valid: false, errors: formatErrors(validateAppliancesSchema.errors) };
}
