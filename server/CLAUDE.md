# Server — CLAUDE.md

Express + TypeScript backend serving the REST API, MCP server, and chat endpoint.

## Structure

```
server/
├── package.json                # "type": "module", deps: ai, @ai-sdk/*, express, ajv, @modelcontextprotocol/sdk
├── tsconfig.json               # ES2022, NodeNext, strict, outDir: dist
└── src/
    ├── index.ts                # Express entry: cors, json, /api/health, mounts apiRouter, serves client/dist in production
    ├── schemas/
    │   ├── recipe.schema.json
    │   ├── taste-profile.schema.json
    │   ├── shelf.schema.json
    │   └── appliances.schema.json
    ├── data/
    │   ├── config.ts           # Path resolution: DATA_DIR, RECIPES_DIR, INDEX_PATH, TASTE_PROFILE_PATH, SHELF_PATH, APPLIANCES_PATH
    │   ├── validator.ts        # Ajv compilation: validateRecipe(), validateTasteProfile(), validateShelf(), validateAppliances()
    │   ├── recipes.ts          # listRecipes, getRecipe, saveRecipe, deleteRecipe, searchRecipes, rebuildIndex
    │   ├── taste-profile.ts    # getTasteProfile, updateTasteProfile (deep merge), logCook
    │   ├── shelf.ts            # getShelf, updateShelf, addShelfCategory, removeShelfCategory
    │   ├── appliances.ts      # getAppliances, updateAppliances, addApplianceCategory, removeApplianceCategory
    │   ├── index.ts            # Barrel re-export of all data functions
    │   ├── smoke-test.ts       # Data layer test: `npx tsx server/src/data/smoke-test.ts`
    │   ├── validate-file.ts    # CLI validator: `npx tsx server/src/data/validate-file.ts <path>`
    │   ├── migrate-pantry-to-shelf.ts  # One-time migration utility
    │   └── migrate-equipment-to-appliances.ts  # One-time migration utility
    ├── api/
    │   ├── index.ts            # Mounts /recipes, /profile, /shelf, /appliances, /chat routers
    │   ├── recipes.ts          # 6 routes: GET /, GET /search, GET /:id, POST /, PUT /:id, DELETE /:id
    │   ├── profile.ts          # 3 routes: GET /, PATCH /, POST /log
    │   ├── shelf.ts            # 4 routes: GET /, PATCH /, POST /categories, DELETE /categories/:name
    │   └── appliances.ts      # 4 routes: GET /, PATCH /, POST /categories, DELETE /categories/:name
    ├── chat/
    │   ├── index.ts            # POST /api/chat — streaming endpoint
    │   ├── models.ts           # Provider registry: anthropic (claude-sonnet-4-5-20250929), openai (gpt-4o)
    │   ├── tools.ts            # 12 AI SDK tool() definitions wrapping the data layer
    │   └── system-prompt.ts    # Builds system prompt from SKILL.md + taste profile + shelf + appliances + optional recipe
    └── mcp/
        ├── server.ts           # McpServer with 12 tools
        └── stdio.ts            # StdioServerTransport entry point
```

## Commands

```bash
# Dev with hot reload (run from project root)
npm run dev:server

# Build TypeScript
npm run build -w server

# MCP server (stdio)
npm run mcp -w server

# Validate a recipe
npx tsx server/src/data/validate-file.ts data/recipes/<recipe>.json

# Smoke test
npx tsx server/src/data/smoke-test.ts
```

## API Endpoints

```
GET    /api/health                 — Health check
GET    /api/recipes                — List all recipes (index)
GET    /api/recipes/search?q=      — Search recipes
GET    /api/recipes/:id            — Get full recipe
POST   /api/recipes                — Create recipe
PUT    /api/recipes/:id            — Update recipe
DELETE /api/recipes/:id            — Delete recipe

GET    /api/profile                — Get taste profile
PATCH  /api/profile                — Update taste profile (deep merge)
POST   /api/profile/log            — Log a cook

GET    /api/shelf                  — Get kitchen shelf
PATCH  /api/shelf                  — Update shelf (deep merge)
POST   /api/shelf/categories       — Add shelf category
DELETE /api/shelf/categories/:name — Remove shelf category

GET    /api/appliances                  — Get kitchen appliances
PATCH  /api/appliances                  — Update appliances (deep merge)
POST   /api/appliances/categories       — Add appliance category
DELETE /api/appliances/categories/:name — Remove appliance category

POST   /api/chat                   — Streaming chat (accepts: messages, provider?, model?, recipe_id?)
```

## MCP + Chat Tools (12 total)

Both the MCP server and chat endpoint expose the same 12 tools:

| Tool | Input | Description |
|------|-------|-------------|
| `list_recipes` | — | Returns recipe index (id, name, name_en, category, tags) |
| `get_recipe` | `id` | Returns full recipe JSON |
| `search_recipes` | `query` | Search by name, ingredient, tag, or category |
| `save_recipe` | `recipe` (JSON string) | Create/update recipe (validates against schema) |
| `delete_recipe` | `id` | Delete recipe + rebuild index |
| `get_taste_profile` | — | Returns full taste profile |
| `update_taste_profile` | `updates` (JSON string) | Partial update (deep merge, arrays replace) |
| `log_cook` | `recipe_id`, `date`, `result?`, `notes?` | Append to cooking_log |
| `get_shelf` | — | Returns kitchen shelf (spices + ingredients) |
| `update_shelf` | `updates` (JSON string) | Partial update of shelf |
| `get_appliances` | — | Returns kitchen appliances and cookware |
| `update_appliances` | `updates` (JSON string) | Partial update of appliances |

## Data Layer

- All data lives in `data/` at the project root (configurable via `DATA_DIR` env var).
- Recipes are individual JSON files in `data/recipes/`. Index is auto-generated.
- Validation uses Ajv compiled against JSON Schema files in `src/schemas/`.
- Deep merge: objects merge recursively, arrays replace. `logCook()` is the exception — it appends.
- `rebuildIndex()` scans the recipes directory and regenerates `data/index.json`.

## Chat Details

- Uses Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/openai`).
- Tools with no parameters must have `inputSchema: z.object({})` — the Anthropic API requires `input_schema.type` on every tool.
- System prompt is built from: SKILL.md persona + taste profile JSON + shelf JSON + appliances JSON + optional recipe context.
- Streaming via `pipeTextStreamToResponse()`. Multi-step tool calls limited to 5 steps.
- Provider/model configurable per request. Default: Anthropic `claude-sonnet-4-5-20250929`.

## Environment

The dev script uses `--env-file=../.env` to load environment variables from the project root. Required:

- `ANTHROPIC_API_KEY` — for chat with Anthropic provider
- `OPENAI_API_KEY` — for chat with OpenAI provider
- `PORT` — server port (default: 3000)
- `DATA_DIR` — path to data directory (default: `../data` relative to server/)
