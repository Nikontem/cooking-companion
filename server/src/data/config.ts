import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve data dir: always relative to the actual source file location,
// so it works regardless of cwd (project root, server/, or WebStorm configs).
const serverRoot = path.resolve(__dirname, '../..');              // → server/
const projectRoot = path.resolve(serverRoot, '..');               // → cooking-companion/
const defaultDataDir = path.join(projectRoot, 'data');

function resolveDataDir(): string {
  const envVal = process.env.DATA_DIR;
  if (!envVal) return defaultDataDir;

  // Absolute paths are used as-is
  if (path.isAbsolute(envVal)) return envVal;

  // Relative paths: try from cwd first, fall back to project root
  const fromCwd = path.resolve(envVal);
  if (fs.existsSync(fromCwd)) return fromCwd;

  const fromProject = path.resolve(projectRoot, envVal);
  if (fs.existsSync(fromProject)) return fromProject;

  // Default to cwd-based resolution (original behavior)
  return fromCwd;
}

export const DATA_DIR = resolveDataDir();
export const RECIPES_DIR = path.join(DATA_DIR, 'recipes');
export const INDEX_PATH = path.join(DATA_DIR, 'index.json');
export const TASTE_PROFILE_PATH = path.join(DATA_DIR, 'taste-profile.json');
export const SHELF_PATH = path.join(DATA_DIR, 'shelf.json');
export const APPLIANCES_PATH = path.join(DATA_DIR, 'appliances.json');
