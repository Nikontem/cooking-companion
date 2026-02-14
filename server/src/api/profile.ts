import { Router } from 'express';
import {
  getTasteProfile,
  updateTasteProfile,
  logCook,
} from '../data/index.js';

export const profileRouter = Router();

// GET / — get taste profile
profileRouter.get('/', async (_req, res) => {
  try {
    const profile = await getTasteProfile();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH / — update taste profile (partial merge)
profileRouter.patch('/', async (req, res) => {
  try {
    const merged = await updateTasteProfile(req.body);
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

// POST /log — log a cook
profileRouter.post('/log', async (req, res) => {
  try {
    const { recipe_id, date, result, notes } = req.body;
    if (!recipe_id || !date) {
      res.status(400).json({ error: 'recipe_id and date are required' });
      return;
    }
    await logCook({ recipe_id, date, result, notes });
    res.status(201).json({ message: `Cook logged for "${recipe_id}" on ${date}.` });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
