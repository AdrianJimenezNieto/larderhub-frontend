import { apiClient } from '../../lib/axiosClient';
import type { Recipe, RecipeSuggestion } from './types';

export interface RecipePayload {
  title: string;
  description?: string;
  imageUrl?: string;
  cookingTimeMinutes?: number;
  difficulty?: string;
  servings?: number;
  ingredients: { productId: number; quantity: number; unit?: string }[];
  steps: { stepNumber: number; title?: string; description: string; timerMinutes?: number }[];
}

export const createRecipe = (data: RecipePayload): Promise<Recipe> =>
  apiClient.post<Recipe>('/api/v1/recipes', data).then(r => r.data);

export const updateRecipe = (id: number, data: RecipePayload): Promise<Recipe> =>
  apiClient.put<Recipe>(`/api/v1/recipes/${id}`, data).then(r => r.data);

export const deleteRecipe = (id: number): Promise<void> =>
  apiClient.delete(`/api/v1/recipes/${id}`).then(() => undefined);

export const getAllRecipes = (): Promise<Recipe[]> =>
  apiClient.get<Recipe[]>('/api/v1/recipes').then(r => r.data);

export const getRecipeSuggestions = (householdId: number): Promise<RecipeSuggestion[]> =>
  apiClient
    .get<RecipeSuggestion[]>(`/api/v1/households/${householdId}/recipes/suggestions`)
    .then(r => r.data);

export const addMissingToShoppingList = (
  householdId: number,
  recipeId: number
): Promise<{ itemsAdded: number }> =>
  apiClient
    .post(`/api/v1/households/${householdId}/recipes/${recipeId}/add-missing`)
    .then(r => r.data);

export const rateRecipe = (
  recipeId: number,
  rating: number,
  comment?: string
): Promise<Recipe> =>
  apiClient
    .post<Recipe>(`/api/v1/recipes/${recipeId}/ratings`, null, {
      params: { rating, comment },
    })
    .then(r => r.data);
