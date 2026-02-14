import fs from 'node:fs/promises';
import path from 'node:path';
import { getTasteProfile, getRecipe, getShelf, getAppliances } from '../data/index.js';

let skillContent: string | null = null;

async function loadSkill(): Promise<string> {
  if (skillContent) return skillContent;

  const skillPath = path.resolve(process.cwd(), 'SKILL.md');
  try {
    skillContent = await fs.readFile(skillPath, 'utf-8');
  } catch {
    skillContent = 'You are a helpful Greek cooking assistant.';
  }
  return skillContent;
}

export async function buildSystemPrompt(recipeId?: string): Promise<string> {
  const [skill, profile, shelf, appliances] = await Promise.all([
    loadSkill(),
    getTasteProfile(),
    getShelf(),
    getAppliances(),
  ]);

  let prompt = `${skill}

---

## Current Taste Profile

\`\`\`json
${JSON.stringify(profile, null, 2)}
\`\`\`

---

## Kitchen Shelf (Αποθήκη)

\`\`\`json
${JSON.stringify(shelf, null, 2)}
\`\`\`

---

## Η Κουζίνα μου (Συσκευές & Σκεύη)

\`\`\`json
${JSON.stringify(appliances, null, 2)}
\`\`\``;

  if (recipeId) {
    try {
      const recipe = await getRecipe(recipeId);
      prompt += `

---

## Current Recipe Context

The user is currently viewing this recipe. Answer questions about it directly without needing to call get_recipe. If they ask about a DIFFERENT recipe, use the tools as usual.

\`\`\`json
${JSON.stringify(recipe, null, 2)}
\`\`\``;
    } catch {
      // Recipe not found — proceed without recipe context
    }
  }

  return prompt;
}
