import { Router } from 'express';
import {
  getAppliances,
  updateAppliances,
  addApplianceCategory,
  removeApplianceCategory,
} from '../data/index.js';

export const appliancesRouter = Router();

// GET / — get full appliances
appliancesRouter.get('/', async (_req, res) => {
  try {
    const appliances = await getAppliances();
    res.json(appliances);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH / — update appliances (partial merge)
appliancesRouter.patch('/', async (req, res) => {
  try {
    const merged = await updateAppliances(req.body);
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
appliancesRouter.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    const appliances = await addApplianceCategory(name.trim());
    res.status(201).json(appliances);
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
appliancesRouter.delete('/categories/:name', async (req, res) => {
  try {
    const appliances = await removeApplianceCategory(req.params.name);
    res.json(appliances);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('not found')) {
      res.status(404).json({ error: msg });
    } else {
      res.status(500).json({ error: msg });
    }
  }
});
