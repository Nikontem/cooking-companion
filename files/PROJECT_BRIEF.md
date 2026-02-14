# Greek Cooking Assistant — Project Brief

## Overview

A personal cooking assistant system with three components:

1. **MCP Server** — Exposes recipe and taste profile data to Claude via MCP tools
2. **REST API** — Same backend serves a REST API for the Vue frontend
3. **Vue UI** — Recipe browser with step-by-step view, search, and an embedded chat interface that talks to Claude (via Anthropic API proxy)

All three share a single backend service. Data is stored as JSON files on the local filesystem.

---

## Tech Stack

| Layer | Technology | Reasoning |
|---|---|---|
| Backend | **Node.js + TypeScript + Express** | Single service exposing both MCP and REST interfaces. First-class MCP SDK support. Same ecosystem as frontend. |
| Frontend | **Vue 3 + TypeScript** | User preference. Great for recipe card UIs and interactive step views. |
| Data Storage | **JSON files on local disk** | Tiny data volume (~50-100 recipes max). No database overhead needed. |
| Chat | **Anthropic API** | Backend proxies calls to Claude, injecting system prompt + tool context. API key stays server-side. |
| Skill | **SKILL.md** | Markdown instructions teaching Claude how to use the MCP tools and behave in cooking context. |

---

## Data Architecture

### File Structure

```
data/
├── recipes/
│   ├── makaronia-me-kima.json
│   ├── spanakoryzo.json
│   ├── giouvetsi-laxanikon.json
│   ├── tiganito-avgo.json
│   └── omeleta-laxanikon.json
├── index.json              # Auto-generated recipe index (id, name, category, tags)
└── taste-profile.json      # User preferences, equipment, pantry, cooking log
```

### Schemas

Two JSON Schema files are provided alongside this brief:

- `recipe.schema.json` — Full recipe model with ingredients (grouped, with substitutions), steps (with heat settings on 1-9 electric scale, durations, sensory cues), modifications log, and ratings.
- `taste-profile.schema.json` — Equipment (stove type/calibration, available tools), pantry (spices, oils, staples), flavor preferences/principles, dietary context, and cooking history log.

**Important schema design decisions:**
- Heat settings use a 1-9 electric stove scale (3-4 low, 5-6 medium, 7-8 high, 9 max)
- Recipe steps include `ingredients_used` to track which ingredients are introduced at each step
- `modifications_log` in recipes tracks what was changed, why, and whether it's a keeper — this feeds taste learning
- `cooking_log` in the taste profile prevents repetitive suggestions and tracks outcomes
- `flavor_principles` are hard rules (e.g. "no cinnamon/sugar in savory dishes")
- All recipe content is in Greek. Field names and schema structure are in English.

---

## MCP Tools

| Tool | Description |
|---|---|
| `list_recipes` | Returns the index: id, name, name_en, category, tags for all recipes |
| `get_recipe(id)` | Returns the full recipe JSON by id |
| `save_recipe(recipe)` | Creates or updates a recipe file. Also regenerates index.json |
| `delete_recipe(id)` | Removes a recipe and regenerates index |
| `search_recipes(query)` | Searches by name, ingredient, tag, or category |
| `get_taste_profile` | Returns the full taste profile |
| `update_taste_profile(updates)` | Partial update of taste profile (e.g. add a spice to pantry, log a cook) |
| `log_cook(recipe_id, result, notes)` | Shortcut to append to cooking_log in taste profile |

---

## REST API Endpoints

These mirror the MCP tools for the Vue frontend:

```
GET    /api/recipes              — List all recipes (index)
GET    /api/recipes/:id          — Get full recipe
POST   /api/recipes              — Create recipe
PUT    /api/recipes/:id          — Update recipe
DELETE /api/recipes/:id          — Delete recipe
GET    /api/recipes/search?q=    — Search recipes

GET    /api/profile              — Get taste profile
PATCH  /api/profile              — Update taste profile
POST   /api/profile/log          — Log a cook

POST   /api/chat                 — Proxy to Anthropic API (system prompt + MCP context injected server-side)
```

---

## Chat Interface

The Vue UI includes a chat interface. The backend proxies chat messages to the Anthropic API with:

- A **system prompt** that includes the cooking assistant persona (Greek language, casual tone, heat scale awareness, mentorship style)
- The **taste profile** injected as context so Claude can personalize suggestions
- **Tool definitions** matching the MCP tools, so Claude in the chat can look up recipes, check pantry, etc.

This means the chat Claude has the same capabilities as the MCP Claude — it can read/write recipes and evolve the taste profile mid-conversation.

---

## Existing Recipes to Seed

These recipes were developed through past conversations and should be seeded as initial data. The content exists in Greek from our chat history:

1. **Μακαρόνια με Κιμά** (Pasta with Meat Sauce) — κιμά, σάλτσα ντομάτας
2. **Σπανακόρυζο** (Spinach Rice) — της μαμάς version, φρέσκο σπανάκι, φρέσκος άνηθος, τηγανητό αυγό companion
3. **Γιουβέτσι Λαχανικών** (Vegetable Giouvetsi) — "Hardcore Edition": μελιτζάνα αντί κολοκυθιού, γλυκοπατάτα, χωρίς κανέλα/ζάχαρη, two-wave sautéing, φρέσκος χυμός ντομάτας αντί πελτέ
4. **Τηγανητό Αυγό** (Fried Egg) — sunny side up, over easy, over hard techniques
5. **Ομελέτα με Λαχανικά** (Vegetable Omelette)

**Note:** The full recipe details for these need to be extracted from the chat history in the "Γιουβέτσι λαχανικών συνταγή" and "Greek meat sauce recipe tips" conversations. The schemas define the target structure.

---

## Known Taste Profile Data to Seed

From past conversations:

**Equipment:**
- Electric stove, 1-9 scale (runs one setting higher than standard)
- Xiaomi air fryer (small)
- Wok
- Egg cooker
- Various pots, pans, antikollitiko tigani

**Pantry (spices):**
θυμάρι, ρίγανη, δενδρολίβανο, κουρκουμάς, σαφράν, πάπρικα, κάρυ, κόλιανδρος, μπούκοβο, πάπρικα καπνιστή, πάπρικα γλυκιά

**Oils:**
ελαιόλαδο, λάδι λευκής τρούφας

**Flavor principles:**
- No κανέλα/ζάχαρη in savory dishes
- Traditional Greek λαδερά style preferred
- Appreciates precise measurements and temperatures
- Questions assumptions (e.g. caught early ρίγανη → πικρίζει issue)
- Adapts recipes based on available ingredients rather than buying new ones

**Dietary:**
- Intermittent fasting
- Calisthenics / active lifestyle
- Calorie-conscious

---

## Build Order

1. **Project scaffolding** — monorepo with `server/` and `client/` directories
2. **Data layer** — JSON file read/write utilities with schema validation
3. **MCP server** — Implement all MCP tools
4. **REST API** — Express routes mirroring MCP tools
5. **Seed data** — Create initial recipe files and taste profile from known data
6. **Vue UI** — Recipe list, recipe detail (step-by-step), search, taste profile editor
7. **Chat integration** — Anthropic API proxy + chat UI component
8. **SKILL.md** — Instructions for Claude on how to use the system

---

## Communication Style (for SKILL.md)

When Claude operates as the cooking assistant (via MCP or chat), it should:

- Communicate in **Greek** with casual tone: "ρε συ", "θα γαμήσει", etc.
- Use emojis: 🔥💪😎👑💚
- Always reference the **1-9 heat scale** in cooking instructions
- Be **precise** with times, temperatures, and quantities
- Act as a **mentor** — guide the user, don't just dump instructions
- **Check the taste profile** before suggesting recipes or modifications
- **Check the pantry** before recommending ingredients
- **Log modifications** when the user makes changes to recipes
- Never suggest κανέλα or ζάχαρη in savory dishes
- Respect the user's style: they question assumptions and prefer to understand *why*
