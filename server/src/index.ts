import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { apiRouter } from './api/index.js';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cooking-companion' });
});

app.use('/api', apiRouter);

// Serve Vue static files in production
const clientDist = path.resolve(process.cwd(), 'client', 'dist');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Cooking Companion server running on http://localhost:${PORT}`);
});
