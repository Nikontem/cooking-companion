# Client — CLAUDE.md

Vue 3 + TypeScript frontend built with Vite.

## Structure

```
client/
├── package.json              # Vue 3, vue-router, Vite, vue-tsc
├── vite.config.ts            # Proxy /api → localhost:3000
└── src/
    ├── App.vue               # AppHeader + RouterView
    ├── main.ts               # Bootstrap: createApp, router, styles
    ├── router.ts             # 7 routes (see below)
    ├── api.ts                # Fetch wrapper for all REST API calls
    ├── types.ts              # TS interfaces matching server schemas
    ├── style.css             # Mediterranean palette CSS custom properties
    ├── composables/
    │   ├── useRecipes.ts     # fetchAll, fetchOne, search
    │   ├── useProfile.ts     # fetch, update, logCook
    │   ├── useChat.ts        # sendMessage (streaming), clearChat
    │   ├── useShelf.ts       # fetch, update, addCategory, removeCategory
    │   └── useAppliances.ts # fetch, update, addCategory, removeCategory
    ├── components/
    │   ├── AppHeader.vue     # Nav: Συνταγές, Αποθήκη, Η Κουζίνα μου, Chat, Προφίλ
    │   ├── RecipeCard.vue    # Card for recipe list grid
    │   ├── IngredientGroup.vue # Ingredient group with rows
    │   ├── StepCard.vue      # Step with heat badge, duration, tips
    │   ├── HeatBadge.vue     # Color-coded heat level
    │   ├── TagBadge.vue      # Tag/category pill
    │   ├── SearchBar.vue     # Debounced search input
    │   ├── ProfileSection.vue # Collapsible profile section
    │   ├── ChatMessage.vue   # Chat message bubble
    │   └── RecipeChatPanel.vue # Contextual chat within recipe detail
    └── views/
        ├── RecipeListView.vue  # Search + recipe card grid
        ├── RecipeDetailView.vue # Full step-by-step recipe display
        ├── ChatView.vue        # Streaming chat interface
        ├── ShelfView.vue       # Kitchen shelf editor
        ├── AppliancesView.vue  # Kitchen appliances editor
        ├── ProfileView.vue     # Taste profile editor
        └── NotFoundView.vue    # 404
```

## Commands

```bash
# Dev server (run from project root)
npm run dev:client

# Build for production
npm run build:client    # outputs to client/dist/

# Type check
npx vue-tsc -b --noEmit
```

## Routes

| Path | View | Description |
|------|------|-------------|
| `/` | RecipeListView | Search bar + recipe card grid |
| `/recipe/:id` | RecipeDetailView | Step-by-step recipe with ingredients, heat badges, tips |
| `/shelf` | ShelfView | Kitchen shelf editor (spices + categorized ingredients) |
| `/appliances` | AppliancesView | Kitchen appliances and cookware editor |
| `/chat` | ChatView | Streaming chat with the cooking assistant |
| `/profile` | ProfileView | Taste profile editor (preferences, dietary) |
| `/:pathMatch(.*)*` | NotFoundView | 404 catch-all |

## API Layer (`api.ts`)

All calls go through a fetch wrapper targeting `/api/...`. In dev, Vite proxies these to `localhost:3000`.

**Recipes:** `fetchRecipes()`, `fetchRecipe(id)`, `searchRecipes(q)`, `createRecipe(data)`, `updateRecipe(id, data)`, `deleteRecipe(id)`

**Profile:** `fetchProfile()`, `updateProfile(data)`, `logCook(entry)`

**Shelf:** `fetchShelf()`, `updateShelf(data)`, `addShelfCategory(category)`, `removeShelfCategory(name)`

**Appliances:** `getAppliances()`, `updateAppliances(data)`, `addApplianceCategory(name)`, `removeApplianceCategory(name)`

**Chat:** `sendChatMessage(messages, options?)` — streams response via `fetch` + `getReader()`

## Composables

Each composable wraps the API layer with reactive state:

- **`useRecipes`** — `recipes`, `recipe`, `loading`, `fetchAll()`, `fetchOne(id)`, `search(q)`
- **`useProfile`** — `profile`, `loading`, `fetch()`, `update(data)`, `logCook(entry)`
- **`useChat`** — `messages`, `loading`, `sendMessage(text, options?)`, `clearChat()`
- **`useShelf`** — `shelf`, `loading`, `fetch()`, `update(data)`, `addCategory(cat)`, `removeCategory(name)`
- **`useAppliances`** — `appliances`, `loading`, `fetch()`, `update(data)`, `addCategory(cat)`, `removeCategory(name)`

## Chat Streaming

The chat view sends messages to `POST /api/chat` and reads the streaming response with `getReader()`. It supports:
- Optional `provider` and `model` override
- Optional `recipe_id` for contextual recipe chat (used by RecipeChatPanel)

## Styling

CSS custom properties defined in `style.css` with a Mediterranean color palette. Components use scoped styles.
