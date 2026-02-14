# Cooking Companion — CLAUDE.md

## What is this project?

A Greek cooking assistant with three interfaces: MCP Server, REST API, and Vue UI. All content is in Greek, field names/code in English. See `files/PROJECT_BRIEF.md` for the full spec.

**This is NOT a RAG app.** The dataset is small (~7-100 recipes). The chat assistant uses tool-use: Claude calls tools (`get_recipe`, `search_recipes`, etc.) to fetch data on demand. The taste profile and kitchen shelf are injected into the system prompt for personalization.

## Tech Stack

- **Backend:** Node.js + TypeScript + Express (ESM, `"type": "module"`)
- **Frontend:** Vue 3 + TypeScript + Vite
- **Data:** JSON files on disk (`data/` directory)
- **MCP:** `@modelcontextprotocol/sdk` with Zod v4
- **Chat:** Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/openai`)
- **Validation:** Ajv + ajv-formats against JSON Schema
- **Dev runner:** tsx (tsx watch for Express, tsx for scripts)
- **Monorepo:** npm workspaces (`server/`, `client/`)

## Project Structure

```
cooking-companion/
├── package.json                    # Root workspace: ["server", "client"]
├── CLAUDE.md                       # This file (general project instructions)
├── server/
│   ├── CLAUDE.md                   # Server-specific instructions
│   ├── package.json
│   ├── tsconfig.json
│   └── src/                        # See server/CLAUDE.md
├── client/
│   ├── CLAUDE.md                   # Client-specific instructions
│   ├── package.json
│   ├── vite.config.ts
│   └── src/                        # See client/CLAUDE.md
├── data/
│   ├── index.json                  # Auto-generated recipe index (7 recipes)
│   ├── taste-profile.json          # User preferences (populated)
│   ├── shelf.json                  # Kitchen shelf: spices + categorized ingredients
│   ├── appliances.json             # Kitchen appliances & cookware (categorized)
│   └── recipes/                    # Individual recipe JSON files
│       ├── fakes.json
│       ├── fasolakia-ladera.json
│       ├── makaronia-me-kima.json
│       ├── omeleta-me-laxanika.json
│       ├── spanakoryzo-tis-mamas.json
│       ├── tiganito-avgo.json
│       └── turkey-burgers-me-troufa.json
├── files/
│   ├── PROJECT_BRIEF.md            # Full project spec
│   ├── RECIPE_GENERATION_PROMPT.md # Claude project instructions for recipe-to-JSON conversion
│   ├── recipe.schema.json          # Source of truth (kept in sync with server/src/schemas/)
│   ├── taste-profile.schema.json   # Source of truth (kept in sync with server/src/schemas/)
│   ├── shelf.schema.json           # Source of truth (kept in sync with server/src/schemas/)
│   └── appliances.schema.json      # Source of truth (kept in sync with server/src/schemas/)
├── SKILL.md                        # Cooking assistant persona instructions
└── .env                            # ANTHROPIC_API_KEY, OPENAI_API_KEY, PORT, DATA_DIR (git-ignored)
```

## Commands

```bash
# Install dependencies
npm install

# Run Express server (dev, hot reload, loads .env automatically)
npm run dev:server

# Run Vue UI (dev, Vite proxy to server)
npm run dev:client

# Run MCP server (stdio transport)
npm run mcp -w server

# Build for production
npm run build          # builds both server + client
npm run build:client   # builds Vue app to client/dist/
npm run build:server   # compiles server TypeScript

# Validate a recipe file against schema
npx tsx server/src/data/validate-file.ts data/recipes/<recipe>.json

# Run data layer smoke tests
npx tsx server/src/data/smoke-test.ts

# Rebuild recipe index manually
npx tsx -e "async function main() { const { rebuildIndex } = await import('./server/src/data/recipes.js'); await rebuildIndex(); console.log('done'); } main();"
```

## Important Design Decisions

- **Schema files exist in two places:** `files/` (source of truth) and `server/src/schemas/` (used at runtime). Keep them in sync.
- **Heat scale:** Electric stove 1-9. Labels: `πολύ χαμηλή` (1-2), `χαμηλή` (3-4), `μέτρια-χαμηλή` (4-5), `μέτρια` (5-6), `μέτρια-δυνατή` (6-7), `δυνατή` (7-8), `MAX` (9), `κλειστή` (0). Air fryer recipes use °C directly.
- **Deep merge for profile, shelf, and appliances:** Arrays replace (don't concatenate). Use `logCook()` to append to cooking_log.
- **Index is filesystem-driven:** `rebuildIndex()` reads all .json files in `data/recipes/`, extracts id/name/name_en/category/tags.
- **Standardized ingredient groups:** 7 fixed groups: Βάση, Λαχανικά, Αρωματικά, Σάλτσα, Καρυκεύματα, Λάδι/Λίπος, Προαιρετικά. Rules: αλάτι/πιπέρι → Καρυκεύματα, ελαιόλαδο/βούτυρο → Λάδι/Λίπος, κρεμμύδι/σκόρδο → Αρωματικά, optional:true → Προαιρετικά.
- **Environment variables:** Server dev script uses `--env-file=../.env` (Node.js built-in). No dotenv package needed.
- **Recipe generation:** User has a separate Claude project that converts Greek recipe text to schema-valid JSON using `files/RECIPE_GENERATION_PROMPT.md`.

## Recipe Seeding Flow

When the user pastes a recipe JSON:
1. Save to `data/recipes/{id}.json`
2. Validate: `npx tsx server/src/data/validate-file.ts data/recipes/{id}.json`
3. Report VALID/INVALID
4. Rebuild index after batches

## Chat Integration

- **Multi-provider:** Anthropic (default: `claude-sonnet-4-5-20250929`) and OpenAI (`gpt-4o`). Swap via `{ provider, model }` in request body.
- **Streaming:** `POST /api/chat` streams via `pipeTextStreamToResponse()`. Client reads with `fetch` + `getReader()`.
- **Tool use:** 12 tools defined with AI SDK `tool()`. Multi-step calls via `stopWhen: stepCountIs(5)`.
- **System prompt:** Built from `SKILL.md` + taste profile JSON + shelf JSON + appliances JSON. Optional recipe context when `recipe_id` is provided.
