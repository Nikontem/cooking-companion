import { Router } from 'express';
import {
  listRecipes,
  getRecipe,
  saveRecipe,
  deleteRecipe,
  searchRecipes,
} from '../data/index.js';

export const recipesRouter = Router();

// GET /search — must be before /:id
recipesRouter.get('/search', async (req, res) => {
  try {
    const q = (req.query.q as string) ?? '';
    const results = await searchRecipes(q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET / — list all recipes (index)
recipesRouter.get('/', async (_req, res) => {
  try {
    const index = await listRecipes();
    res.json(index);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /:id — get full recipe
recipesRouter.get('/:id', async (req, res) => {
  try {
    const recipe = await getRecipe(req.params.id);
    res.json(recipe);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      res.status(404).json({ error: `Recipe "${req.params.id}" not found` });
    } else {
      res.status(500).json({ error: (err as Error).message });
    }
  }
});

// POST / — create recipe
recipesRouter.post('/', async (req, res) => {
  try {
    await saveRecipe(req.body);
    res.status(201).json({ message: `Recipe "${req.body.id}" created.` });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('validation failed')) {
      res.status(400).json({ error: msg });
    } else {
      res.status(500).json({ error: msg });
    }
  }
});

// PUT /:id — update recipe
recipesRouter.put('/:id', async (req, res) => {
  try {
    const recipe = { ...req.body, id: req.params.id };
    await saveRecipe(recipe);
    res.json({ message: `Recipe "${req.params.id}" updated.` });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('validation failed')) {
      res.status(400).json({ error: msg });
    } else {
      res.status(500).json({ error: msg });
    }
  }
});

// DELETE /:id — delete recipe
recipesRouter.delete('/:id', async (req, res) => {
  try {
    await deleteRecipe(req.params.id);
    res.json({ message: `Recipe "${req.params.id}" deleted.` });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      res.status(404).json({ error: `Recipe "${req.params.id}" not found` });
    } else {
      res.status(500).json({ error: (err as Error).message });
    }
  }
});
