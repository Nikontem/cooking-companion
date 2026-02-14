export interface RecipeIndexEntry {
  id: string
  name: string
  name_en?: string
  category: string
  tags?: string[]
}

export interface Ingredient {
  group?: string
  name: string
  amount?: number
  unit?: string
  notes?: string
  optional?: boolean
  substitutions?: string[]
}

export interface HeatSetting {
  level?: string
  label?: string
}

export interface Duration {
  minutes?: number
  until?: string
}

export interface Step {
  order: number
  title: string
  instruction: string
  heat_setting?: HeatSetting
  duration?: Duration
  tips?: string[]
  ingredients_used?: string[]
}

export interface Modification {
  date: string
  description: string
  reason?: string
  verdict?: 'keeper' | 'revert' | 'try-again' | 'undecided'
}

export interface Rating {
  score?: number
  comment?: string
  would_make_again?: boolean
  last_cooked?: string
}

export interface Recipe {
  id: string
  name: string
  name_en?: string
  description?: string
  category: string
  tags?: string[]
  source?: { origin?: string; url?: string }
  servings: { amount: number; label?: string }
  time?: {
    prep_minutes?: number
    cook_minutes?: number
    rest_minutes?: number
    total_minutes?: number
  }
  difficulty?: 'εύκολο' | 'μέτριο' | 'δύσκολο'
  equipment?: string[]
  ingredients: Ingredient[]
  steps: Step[]
  serving_suggestion?: string
  general_tips?: string[]
  modifications_log?: Modification[]
  rating?: Rating
  created_at: string
  updated_at: string
}

export interface HeatScale {
  min?: number
  max?: number
  low?: string
  medium_low?: string
  medium?: string
  high?: string
  max_setting?: string
}

export interface Stove {
  type?: 'electric' | 'gas' | 'induction'
  heat_scale?: HeatScale
  notes?: string
}

export interface FlavorAffinity {
  combination: string[]
  notes?: string
}

export interface CookLogEntry {
  recipe_id: string
  date: string
  result?: 'great' | 'good' | 'ok' | 'meh' | 'bad'
  notes?: string
}

export interface TasteProfile {
  equipment?: {
    stove?: Stove
    available?: string[]
  }
  preferences: {
    flavor_principles?: string[]
    favorite_ingredients?: string[]
    disliked_ingredients?: string[]
    flavor_affinities?: FlavorAffinity[]
    cooking_style?: string[]
    spice_tolerance?: 'mild' | 'medium' | 'spicy' | 'very-spicy'
  }
  dietary?: {
    pattern?: string
    goals?: string[]
    restrictions?: string[]
  }
  cooking_log?: CookLogEntry[]
  updated_at: string
}

export interface ShelfIngredient {
  name: string
  quantity?: number
  unit?: string
}

export interface ShelfCategory {
  name: string
  ingredients: ShelfIngredient[]
}

export interface Shelf {
  spices: string[]
  categories: ShelfCategory[]
  updated_at: string
}

export interface Appliance {
  name: string
  notes?: string
}

export interface ApplianceCategory {
  name: string
  appliances: Appliance[]
}

export interface Appliances {
  categories: ApplianceCategory[]
  updated_at: string
}
