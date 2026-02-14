# Cooking Companion

A personal Greek cooking assistant with three interfaces: **MCP Server**, **REST API**, and **Vue UI**.

All recipe content is in Greek. The assistant uses tool-calling (not RAG) to fetch recipes, check your pantry, and personalize suggestions based on your taste profile.

## Tech Stack

- **Backend:** Node.js + TypeScript + Express
- **Frontend:** Vue 3 + TypeScript + Vite
- **Chat:** Vercel AI SDK with Anthropic (default) and OpenAI support
- **MCP:** `@modelcontextprotocol/sdk` with stdio transport
- **Data:** JSON files on disk — no database needed
- **Monorepo:** npm workspaces (`server/`, `client/`)

## Prerequisites

- Node.js 20+
- npm 10+
- An Anthropic API key (required for chat)
- An OpenAI API key (optional, for OpenAI provider)

## Setup

```bash
# Install dependencies
npm install

# Create .env in the project root
cat <<EOF > .env
ANTHROPIC_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here   # optional
PORT=3000                       # optional, defaults to 3000
DATA_DIR=./data                 # optional, defaults to ../data relative to server
EOF
```

## Development

```bash
# Start the Express API server (hot reload)
npm run dev:server

# Start the Vue UI (Vite dev server, proxies API to Express)
npm run dev:client

# Run the MCP server (stdio transport, for Claude Desktop etc.)
npm run mcp -w server
```

## Production Build

```bash
# Build both server and client
npm run build

# Or individually
npm run build:server
npm run build:client
```

The built Vue app is served as static files by Express in production.

## Project Structure

```
cooking-companion/
├── server/          # Express API + MCP server + chat integration
├── client/          # Vue 3 frontend
├── data/            # JSON data files (recipes, taste profile, shelf, appliances)
├── files/           # Schemas (source of truth), project brief, recipe generation prompt
├── SKILL.md         # Cooking assistant persona & instructions
└── CLAUDE.md        # Development instructions for AI-assisted coding
```

See `server/CLAUDE.md` and `client/CLAUDE.md` for workspace-specific details.

## Features

**Recipe Management** — Browse, search, and view recipes with grouped ingredients, step-by-step instructions with heat settings, and sensory cues.

**Chat Assistant** — A streaming Greek cooking assistant powered by Claude. Stays strictly on-topic (cooking only), checks your pantry and preferences before suggesting anything, and uses the 1-9 electric stove heat scale.

**Taste Profile** — Tracks flavor preferences, dietary goals, and cooking history. Injected into the assistant's system prompt for personalization.

**Kitchen Shelf & Appliances** — Tracks what spices, ingredients, and equipment you have. The assistant adapts suggestions based on what's actually available.

**MCP Server** — Exposes 12 tools via the Model Context Protocol for use with Claude Desktop or any MCP-compatible client.

## API Endpoints

```
GET    /api/recipes              List all recipes
GET    /api/recipes/search?q=    Search recipes
GET    /api/recipes/:id          Get full recipe
POST   /api/recipes              Create recipe
PUT    /api/recipes/:id          Update recipe
DELETE /api/recipes/:id          Delete recipe

GET    /api/profile              Get taste profile
PATCH  /api/profile              Update taste profile
POST   /api/profile/log          Log a cook

GET    /api/shelf                Get kitchen shelf
PATCH  /api/shelf                Update kitchen shelf

GET    /api/appliances           Get appliances
PATCH  /api/appliances           Update appliances

POST   /api/chat                 Chat (streaming)
```

## Data Validation

```bash
# Validate a recipe against the schema
npx tsx server/src/data/validate-file.ts data/recipes/<recipe>.json

# Run data layer smoke tests
npx tsx server/src/data/smoke-test.ts
```

## License

Private project — not for redistribution.
