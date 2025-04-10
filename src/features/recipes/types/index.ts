export interface RecipeIngredient {
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unit: string;
  have: boolean;
}

export interface RecipeStep {
  id?: number;
  stepNumber: number;
  title?: string;
  description: string;
  timerMinutes?: number;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  authorId: number;
  authorUsername: string;
  averageRating: number;
  ratingsCount?: number;
  cookingTimeMinutes?: number;
  difficulty?: string;
  servings?: number;
  tags: string[];
  matchPercentage: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface MissingIngredient {
  productId: number;
  productName: string;
  quantityNeeded: number;
  unit: string;
}

export interface RecipeSuggestion extends Recipe {
  missingIngredients: MissingIngredient[];
}
