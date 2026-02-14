import { Router } from 'express';
import {
  getShelf,
  updateShelf,
  addShelfCategory,
  removeShelfCategory,
} from '../data/index.js';

export const shelfRouter = Router();

// GET / — get full shelf
shelfRouter.get('/', async (_req, res) => {
  try {
    const shelf = await getShelf();
    res.json(shelf);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH / — update shelf (partial merge)
shelfRouter.patch('/', async (req, res) => {
  try {
    const merged = await updateShelf(req.body);
    res.json(merged);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('validation failed')) {
      res.status(400).json({ error: msg });
    } else {
      res.status(500).json({ error: msg });
    }
  }
});

// POST /categories — add a new category
shelfRouter.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    const shelf = await addShelfCategory(name.trim());
    res.status(201).json(shelf);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('already exists')) {
      res.status(409).json({ error: msg });
    } else {
      res.status(500).json({ error: msg });
    }
  }
});

// DELETE /categories/:name — remove a category
shelfRouter.delete('/categories/:name', async (req, res) => {
  try {
    const shelf = await removeShelfCategory(req.params.name);
    res.json(shelf);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('not found')) {
      res.status(404).json({ error: msg });
    } else {
      res.status(500).json({ error: msg });
    }
  }
});
