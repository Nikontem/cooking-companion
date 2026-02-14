import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default: ../data relative to server/ root (i.e. project-level data/ dir)
const serverRoot = path.resolve(__dirname, '../..');
const defaultDataDir = path.resolve(serverRoot, '..', 'data');

export const DATA_DIR = path.resolve(process.env.DATA_DIR || defaultDataDir);
export const RECIPES_DIR = path.join(DATA_DIR, 'recipes');
export const INDEX_PATH = path.join(DATA_DIR, 'index.json');
export const TASTE_PROFILE_PATH = path.join(DATA_DIR, 'taste-profile.json');
export const SHELF_PATH = path.join(DATA_DIR, 'shelf.json');
export const APPLIANCES_PATH = path.join(DATA_DIR, 'appliances.json');
