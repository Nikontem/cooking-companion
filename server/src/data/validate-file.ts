import fs from 'node:fs';
import { validateRecipe } from './validator.js';

const file = process.argv[2];
if (!file) {
  console.error('Usage: npx tsx server/src/data/validate-file.ts <path-to-recipe.json>');
  process.exit(1);
}

const recipe = JSON.parse(fs.readFileSync(file, 'utf-8'));
const result = validateRecipe(recipe);

if (result.valid) {
  console.log('VALID');
} else {
  console.log('INVALID:');
  result.errors?.forEach(e => console.log('  ' + e));
}
